const express = require("express");
const fs = require("fs");
const path = require("path");
const { prisma } = require("../lib/prisma");
const { ghiNhatKy } = require("../lib/audit");
const { taoThongBao } = require("../lib/thong-bao");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../lib/asyncHandler");
const { single: uploadSingle } = require("../lib/upload");

const router = express.Router();
router.use(requireAuth);

// Không bao giờ trả matKhauHash ra API — chỉ chọn các trường an toàn khi include NhanVien.
const NHAN_VIEN_SAFE = { id: true, maNhanVien: true, hoTen: true, vaiTro: true, email: true };

// Mã phiên hiển thị "PGD-YYYY-MMDD-NNN" (REQ-001 Mã phiên) — chỉ để hiển thị,
// không phải khóa chính; NNN cộng dồn theo số hồ sơ đã tạo trong ngày.
async function taoMaPhien() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const prefix = `PGD-${now.getFullYear()}-${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const countToday = await prisma.hoSo.count({ where: { ngayTao: { gte: startOfDay } } });
  return `${prefix}-${String(countToday + 1).padStart(3, "0")}`;
}

/* REQ-013 Smart Hint chống trùng: gán số CC/CT/SY kế tiếp cho 1 hồ sơ bằng
   transaction + retry khi vi phạm unique (nam, thu_tu). Tách thành hàm dùng
   chung cho cả /cap-so (luồng thường) và /fast-track (khách vãng lai, bỏ qua
   bước soạn thảo/CCV) — trước đây chỉ /cap-so có, /fast-track hoàn toàn mock. */
async function ganSoChoHoSo(hoSo, extraData) {
  const nam = new Date().getFullYear();
  const cot = { HOP_DONG: "soCongChung", CHUNG_THUC: "soChungThuc", SAO_Y: "soSaoY" }[hoSo.loaiHoSo];
  const tienTo = { HOP_DONG: "0036", CHUNG_THUC: "CT", SAO_Y: "SY" }[hoSo.loaiHoSo];
  for (let attempt = 0; attempt < 5; attempt++) {
    const max = await prisma.soCongChung.aggregate({ where: { nam }, _max: { thuTu: true } });
    const thuTu = (max._max.thuTu || 0) + 1;
    const soCc = `${tienTo}-${String(thuTu).padStart(6, "0")}-${nam}`;
    try {
      const [, updated] = await prisma.$transaction([
        prisma.soCongChung.create({ data: { soCc, nam, thuTu, hoSoId: hoSo.id } }),
        prisma.hoSo.update({ where: { id: hoSo.id }, data: { [cot]: soCc, ...extraData } }),
      ]);
      return { hoSo: updated, soCc };
    } catch (e) {
      if (e.code === "P2002") continue; // trùng số, thử số kế tiếp
      throw e;
    }
  }
  throw new Error("Không cấp được số sau nhiều lần thử, vui lòng thử lại");
}

/* Ánh xạ trạng thái DB (TrangThaiHoSo, đúng theo schema đã thống nhất) sang
   6 bước hiển thị của REQ-055 / SESSION_STATUS phía frontend:
   NHAP_LIEU → Lưu nháp · CHO_CCV → Đang soạn thảo · CHO_THU_NGAN → Chờ cấp số & thu phí
   DA_CAP_SO → (đã có số CC, đang chờ vào hàng số hóa) · DANG_LIEN_THONG → Chờ số hóa & đẩy CMC
   HOAN_TAT → Hoàn thành · CHO_BO_SUNG → Chờ bổ sung giấy tờ · LOI → Lỗi liên thông CMC */

router.get("/", asyncHandler(async (req, res) => {
  const { trangThai, tknvId, ccvId, q } = req.query;
  const where = {};
  if (trangThai) where.trangThai = trangThai;
  if (tknvId) where.tknvId = tknvId;
  if (ccvId) where.ccvId = ccvId;
  if (q) {
    where.OR = [
      { soCongChung: { contains: q, mode: "insensitive" } },
      { khachHang: { hoTen: { contains: q, mode: "insensitive" } } },
    ];
  }
  const rows = await prisma.hoSo.findMany({
    where,
    include: { khachHang: true, tknv: { select: NHAN_VIEN_SAFE }, ccv: { select: NHAN_VIEN_SAFE }, dangSoanBoi: { select: NHAN_VIEN_SAFE }, fileScans: true, bieuMaus: true },
    orderBy: { ngayTao: "desc" },
  });
  res.json(rows);
}));

/* Gợi ý số công chứng THẬT cho màn Thu ngân (thay POS_DATA.soCC mock) — chỉ mang
   tính hiển thị/tham khảo, KHÔNG quyết định số cuối cùng: /cap-so ở dưới vẫn tự
   tính số kế tiếp bằng transaction + retry chống trùng (an toàn hơn để client
   tự chọn số). "missing" = số đã hủy (DA_HUY) mà chưa có số thay thế — cần ưu
   tiên lấp trước khi cấp số mới, đúng nghiệp vụ REQ-013. */
router.get("/so-cc-hint", asyncHandler(async (req, res) => {
  const nam = new Date().getFullYear();
  const max = await prisma.soCongChung.aggregate({ where: { nam }, _max: { thuTu: true } });
  const lastUsed = max._max.thuTu || 0;
  const missingRows = await prisma.soCongChung.findMany({
    where: { nam, trangThai: "DA_HUY", soThayThe: null },
    orderBy: { thuTu: "asc" },
    select: { thuTu: true },
  });
  res.json({ nam, next: lastUsed + 1, lastUsed, missing: missingRows.map((r) => r.thuTu) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const row = await prisma.hoSo.findUnique({
    where: { id: req.params.id },
    include: {
      khachHang: true,
      tknv: { select: NHAN_VIEN_SAFE },
      ccv: { select: NHAN_VIEN_SAFE },
      dangSoanBoi: { select: NHAN_VIEN_SAFE },
      fileScans: true,
      soCongChungLedger: true,
      yeuCauHieuChinh: true,
      bieuMaus: true,
    },
  });
  if (!row) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
  res.json(row);
}));

router.post("/", requireRole("TKNV"), asyncHandler(async (req, res) => {
  const { loaiHoSo, khachHangId, phiDichVu, ccvId, bieuMauIds } = req.body || {};
  if (!loaiHoSo) return res.status(400).json({ error: "Thiếu loại hồ sơ" });

  // Phí có thể truyền tay (Thu ngân sửa sau) hoặc tự tính tổng theo biểu mẫu đã chọn.
  let phi = phiDichVu;
  if (phi == null && Array.isArray(bieuMauIds) && bieuMauIds.length) {
    const mau = await prisma.bieuMau.findMany({ where: { id: { in: bieuMauIds } } });
    phi = mau.reduce((sum, m) => sum + Number(m.phiMacDinh || 0), 0);
  }
  if (phi == null) return res.status(400).json({ error: "Thiếu phí dịch vụ (hoặc chọn ít nhất 1 biểu mẫu để tự tính)" });

  const row = await prisma.hoSo.create({
    data: {
      maPhien: await taoMaPhien(),
      loaiHoSo,
      khachHangId: khachHangId || null,
      phiDichVu: phi,
      ccvId: ccvId || null,
      tknvId: req.user.id,
      createdById: req.user.id,
      trangThai: "NHAP_LIEU",
      bieuMaus: Array.isArray(bieuMauIds) && bieuMauIds.length ? { connect: bieuMauIds.map((id) => ({ id })) } : undefined,
    },
    include: { bieuMaus: true },
  });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "TAO_HO_SO", doiTuong: row.id, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.status(201).json(row);
}));

/* Chuyển trạng thái chung (soạn thảo → chờ CCV → chờ thu ngân, v.v.) — không
   dùng cho cấp số/đẩy CMC, 2 việc đó có endpoint riêng bên dưới vì cần
   ràng buộc nghiệp vụ đặc thù. */
router.post("/:id/chuyen-trang-thai", asyncHandler(async (req, res) => {
  const { trangThai } = req.body || {};
  if (!trangThai) return res.status(400).json({ error: "Thiếu trạng thái đích" });
  const before = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

  const row = await prisma.hoSo.update({ where: { id: req.params.id }, data: { trangThai } });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "CHUYEN_TRANG_THAI", doiTuong: row.id,
    giaTriCu: before.trangThai, giaTriMoi: trangThai, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  if (trangThai === "CHO_THU_NGAN") {
    await taoThongBao({
      vaiTro: "THU_NGAN", tieuDe: "Hồ sơ chờ cấp số & thu phí",
      noiDung: `Hồ sơ ${row.maPhien} đã soạn xong.`, hoSoId: row.id, hanhDong: "cap-so",
    });
  }
  res.json(row);
}));

/* REQ-013 Smart Hint: Thu ngân cấp Số CC/CT/SY. Chống trùng bằng retry khi vi
   phạm unique (nam, thu_tu) thay vì SELECT...FOR UPDATE (đủ an toàn ở quy mô
   1 văn phòng, tránh phụ thuộc raw SQL lock). */
router.post("/:id/cap-so", requireRole("THU_NGAN"), asyncHandler(async (req, res) => {
  const { soTienThucThu, noTienThu, noHoSo, phuongThucThanhToan } = req.body || {};
  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
  if (hoSo.soCongChung || hoSo.soChungThuc || hoSo.soSaoY) {
    return res.status(409).json({ error: "Hồ sơ đã được cấp số, không cấp lại" });
  }
  // "cash"/"transfer" (client) → enum thật — trước đây field này bị nhận rồi
  // vứt, không cột nào lưu nên màn Kế toán không có dữ liệu hình thức thu thật.
  const hinhThuc = phuongThucThanhToan === "transfer" ? "CHUYEN_KHOAN" : phuongThucThanhToan === "cash" ? "TIEN_MAT" : undefined;

  let result;
  try {
    result = await ganSoChoHoSo(hoSo, {
      soTienThucThu: soTienThucThu ?? null,
      noTienThu: !!noTienThu,
      noHoSo: !!noHoSo,
      hinhThucThanhToan: hinhThuc,
      trangThai: "DANG_LIEN_THONG", // chờ số hóa & đẩy CMC — không còn bước chốt số riêng
    });
  } catch (e) {
    return res.status(409).json({ error: "Không cấp được số sau nhiều lần thử, vui lòng thử lại", detail: String(e) });
  }
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "CAP_SO", doiTuong: hoSo.id,
    giaTriMoi: result.soCc, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  await taoThongBao({
    vaiTro: "LUU_TRU", tieuDe: "Hồ sơ chờ số hóa & đẩy CMC",
    noiDung: `Hồ sơ ${hoSo.maPhien} đã cấp số ${result.soCc}.`, hoSoId: hoSo.id, hanhDong: "so-hoa",
  });
  res.json(result);
}));

/* Dịch vụ nhanh (Fast-track) — khách vãng lai Sao y/Chứng thực, không qua
   soạn thảo/CCV. Trước đây modal "Dịch vụ nhanh" ở Thu ngân hoàn toàn mock
   (nút "Cấp số & In phơi" chỉ đóng modal, không gọi API nào). Gọn thành 1
   route riêng cho Thu ngân thay vì mở quyền tạo hồ sơ/khách hàng (vốn chỉ
   dành cho TKNV) — chỉ nhận loại SAO_Y/CHUNG_THUC, không thể tạo hợp đồng. */
router.post("/fast-track", requireRole("THU_NGAN"), asyncHandler(async (req, res) => {
  const { khachTen, phuongThucThanhToan, rows } = req.body || {};
  if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: "Thiếu danh sách dịch vụ" });
  const hinhThuc = phuongThucThanhToan === "transfer" ? "CHUYEN_KHOAN" : "TIEN_MAT";

  let khachHangId = null;
  if (khachTen && khachTen.trim()) {
    const kh = await prisma.khachHang.create({ data: { hoTen: khachTen.trim() } });
    khachHangId = kh.id;
  }

  const results = [];
  for (const r of rows) {
    const phi = Number(r.amount || 0);
    if (phi <= 0) continue;
    const loaiHoSo = r.mode === "chungthuc" ? "CHUNG_THUC" : "SAO_Y";
    const hoSo = await prisma.hoSo.create({
      data: {
        maPhien: await taoMaPhien(), loaiHoSo, khachHangId,
        phiDichVu: phi, tknvId: req.user.id, createdById: req.user.id, trangThai: "NHAP_LIEU",
      },
    });
    const result = await ganSoChoHoSo(hoSo, {
      soTienThucThu: phi, noTienThu: false, noHoSo: false,
      hinhThucThanhToan: hinhThuc, trangThai: "DANG_LIEN_THONG",
    });
    await ghiNhatKy({
      nguoiThucHienId: req.user.id, loaiThaoTac: "FAST_TRACK_CAP_SO", doiTuong: result.hoSo.id,
      giaTriMoi: result.soCc, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
    });
    results.push(result);
  }
  if (!results.length) return res.status(400).json({ error: "Không có dịch vụ nào có phí hợp lệ" });
  await taoThongBao({
    vaiTro: "LUU_TRU", tieuDe: "Hồ sơ chờ số hóa & đẩy CMC",
    noiDung: `${results.length} hồ sơ dịch vụ nhanh đã cấp số.`, hanhDong: "so-hoa",
  });
  res.status(201).json({ results });
}));

/* Tất toán công nợ (nợ tiền thu / nợ hồ sơ) ghi nhận lúc cấp số ở trên — trước
   đây chỉ có 2 cờ boolean rồi rơi vào quên lãng, không nơi nào hiển thị số
   tiền còn thiếu hay cho phép đánh dấu đã thu xong. Route này set lại cờ về
   false VÀ coi như đã thu đủ (soTienThucThu = phiDichVu) khi tất toán nợ tiền. */
router.post("/:id/tat-toan-no", requireRole("THU_NGAN", "KE_TOAN"), asyncHandler(async (req, res) => {
  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
  if (!hoSo.noTienThu && !hoSo.noHoSo) return res.status(422).json({ error: "Hồ sơ này không có công nợ đang treo" });

  const row = await prisma.hoSo.update({
    where: { id: hoSo.id },
    data: {
      noTienThu: false,
      noHoSo: false,
      soTienThucThu: hoSo.noTienThu ? hoSo.phiDichVu : hoSo.soTienThucThu,
    },
  });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "TAT_TOAN_NO", doiTuong: hoSo.id,
    giaTriCu: `noTienThu=${hoSo.noTienThu},noHoSo=${hoSo.noHoSo}`, giaTriMoi: "noTienThu=false,noHoSo=false",
    ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.json(row);
}));

/* Ghi nhận 1 file đã số hóa VÀ lưu file nhị phân thật (Mốc 6) — client gửi
   multipart/form-data (trường "loaiFile" PHẢI đứng trước trường "file" trong
   FormData để multer đã có req.body.loaiFile lúc xử lý file). Tên file thật
   do SERVER quyết định theo đúng quy ước "0036-[SốCC]-[năm]-[VB/HS]" (không
   tin tên file client gửi lên — tránh path traversal). */
router.post("/:id/file-scan", requireRole("LUU_TRU"), uploadSingle("file"), asyncHandler(async (req, res) => {
  const { loaiFile } = req.body || {};
  if (!loaiFile) return res.status(400).json({ error: "Thiếu loại file" });
  if (!req.file) return res.status(400).json({ error: "Thiếu file tải lên" });

  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

  // hoSo.soCongChung/soChungThuc/soSaoY đã là chuỗi đầy đủ "0036-[số]-[năm]"
  // (xem /cap-so ở trên) — không thêm tiền tố/năm lần nữa ở đây.
  const nam = new Date().getFullYear();
  const soCc = hoSo.soCongChung || hoSo.soChungThuc || hoSo.soSaoY || `0036-TAMTHOI-${nam}`;
  const ext = path.extname(req.file.originalname || "") || "";
  const tenFile = `${soCc}-${loaiFile}${ext}`;

  const dir = path.join(__dirname, "..", "..", "uploads", "file-scans");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, tenFile), req.file.buffer);

  const row = await prisma.fileScan.create({
    data: {
      hoSoId: req.params.id,
      loaiFile,
      tenFile,
      duongDan: `/uploads/file-scans/${tenFile}`,
      dungLuongKb: Math.round(req.file.size / 1024),
      doPhanGiaiDpi: req.body.doPhanGiaiDpi ? Number(req.body.doPhanGiaiDpi) : 200,
    },
  });
  res.status(201).json(row);
}));

/* Lưu nội dung Quill đã soạn cho hồ sơ NÀY, theo từng biểu mẫu đã chọn —
   { [bieuMauId]: "<html>" }, merge vào dữ liệu cũ (không ghi đè toàn bộ vì
   phiên có thể gồm nhiều biểu mẫu, mỗi lần lưu chỉ gửi phần vừa đổi). Không
   ghi ghiNhatKy vì route này có thể gọi thường xuyên (mỗi lần "Lưu nháp"/trước
   khi in), không phải 1 thao tác nghiệp vụ rời rạc. */
router.patch("/:id/noi-dung", requireRole("TKNV"), asyncHandler(async (req, res) => {
  const { noiDung } = req.body || {};
  if (!noiDung || typeof noiDung !== "object") return res.status(400).json({ error: "Thiếu nội dung đã soạn" });
  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
  const merged = { ...(hoSo.noiDungDaSoan || {}), ...noiDung };
  const row = await prisma.hoSo.update({ where: { id: req.params.id }, data: { noiDungDaSoan: merged } });
  res.json(row);
}));

/* Khóa soạn thảo THẬT (server) — thay cho khóa giả localStorage trước đây, vì
   2 người khác máy vẫn cần biết ai đang mở hồ sơ này. Không khóa nếu chưa ai
   giữ, hoặc nếu chính người gọi đang giữ (mở lại chính phiên của mình).
   `force: true` nghĩa là người dùng đã xác nhận "Đồng ý" ở popup xung đột —
   ghi đè khóa VÀ báo cho người đang giữ khóa cũ biết. */
router.post("/:id/khoa-soan-thao", asyncHandler(async (req, res) => {
  const { force } = req.body || {};
  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id }, include: { dangSoanBoi: { select: NHAN_VIEN_SAFE } } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

  const giuBoiNguoiKhac = hoSo.dangSoanBoiId && hoSo.dangSoanBoiId !== req.user.id;
  if (giuBoiNguoiKhac && !force) {
    return res.status(409).json({ error: "Hồ sơ đang được soạn thảo bởi người khác", dangSoanBoi: hoSo.dangSoanBoi, dangSoanTu: hoSo.dangSoanTu });
  }

  const row = await prisma.hoSo.update({
    where: { id: hoSo.id },
    data: { dangSoanBoiId: req.user.id, dangSoanTu: new Date() },
    include: { dangSoanBoi: { select: NHAN_VIEN_SAFE } },
  });

  if (giuBoiNguoiKhac && force) {
    await taoThongBao({
      nhanVienId: hoSo.dangSoanBoiId, tieuDe: "Hồ sơ đang được người khác truy cập",
      noiDung: `${req.user.hoTen} đang mở hồ sơ ${hoSo.maPhien} để chỉnh sửa.`, hoSoId: hoSo.id, hanhDong: "xem",
    });
  }

  res.json(row);
}));

/* Nhả khóa soạn thảo — gọi khi thoát khỏi bước Soạn thảo (dù lưu nháp hay hủy). */
router.post("/:id/mo-khoa-soan-thao", asyncHandler(async (req, res) => {
  const row = await prisma.hoSo.update({ where: { id: req.params.id }, data: { dangSoanBoiId: null, dangSoanTu: null } });
  res.json(row);
}));

/* Atomic "Hoàn tất số hóa & đẩy CMC": CHỈ cho phép khi đã có CCV ký VÀ ít nhất
   1 file VB đã gắn vào hồ sơ — đúng luồng vừa thống nhất (không đẩy dữ liệu
   trước rồi đính file sau). */
router.post("/:id/finalize", requireRole("LUU_TRU"), asyncHandler(async (req, res) => {
  const { ccvId, ngayCongChungThucTe } = req.body || {};
  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id }, include: { fileScans: true } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

  const finalCcvId = hoSo.ccvId || ccvId;
  if (!finalCcvId) return res.status(422).json({ error: "Chưa gán công chứng viên ký — bắt buộc trước khi đẩy CMC" });

  const fileVb = hoSo.fileScans.find((f) => f.loaiFile === "VB");
  if (!fileVb) return res.status(422).json({ error: "Chưa có file văn bản (VB) đã số hóa — không thể đẩy CMC" });

  const [, updatedHoSo] = await prisma.$transaction([
    prisma.fileScan.updateMany({
      where: { hoSoId: hoSo.id },
      data: { trangThaiCmc: "THANH_CONG", uploadedAt: new Date() },
    }),
    prisma.hoSo.update({
      where: { id: hoSo.id },
      data: {
        ccvId: finalCcvId,
        trangThai: "HOAN_TAT",
        ngayCongChungThucTe: ngayCongChungThucTe ? new Date(ngayCongChungThucTe) : null,
      },
    }),
  ]);

  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "DAY_CMC", doiTuong: hoSo.id,
    ketQua: "DA_DONG_BO_CMC", tokenSuDung: "Token cá nhân",
  });
  await taoThongBao({
    vaiTro: "KE_TOAN", tieuDe: "Hồ sơ hoàn tất — chờ xuất hóa đơn",
    noiDung: `Hồ sơ ${hoSo.maPhien} đã hoàn tất số hóa & đẩy CMC.`, hoSoId: hoSo.id, hanhDong: "hoa-don",
  });

  res.json(updatedHoSo);
}));

module.exports = router;
