const express = require("express");
const { prisma } = require("../lib/prisma");
const { ghiNhatKy } = require("../lib/audit");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

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

/* Ánh xạ trạng thái DB (TrangThaiHoSo, đúng theo schema đã thống nhất) sang
   6 bước hiển thị của REQ-055 / SESSION_STATUS phía frontend:
   NHAP_LIEU → Lưu nháp · CHO_CCV → Đang soạn thảo · CHO_THU_NGAN → Chờ cấp số & thu phí
   DA_CAP_SO → (đã có số CC, đang chờ vào hàng số hóa) · DANG_LIEN_THONG → Chờ số hóa & đẩy CMC
   HOAN_TAT → Hoàn thành · CHO_BO_SUNG → Chờ bổ sung giấy tờ · LOI → Lỗi liên thông CMC */

router.get("/", async (req, res) => {
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
    include: { khachHang: true, tknv: { select: NHAN_VIEN_SAFE }, ccv: { select: NHAN_VIEN_SAFE }, fileScans: true, bieuMaus: true },
    orderBy: { ngayTao: "desc" },
  });
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const row = await prisma.hoSo.findUnique({
    where: { id: req.params.id },
    include: {
      khachHang: true,
      tknv: { select: NHAN_VIEN_SAFE },
      ccv: { select: NHAN_VIEN_SAFE },
      fileScans: true,
      soCongChungLedger: true,
      yeuCauHieuChinh: true,
      bieuMaus: true,
    },
  });
  if (!row) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
  res.json(row);
});

router.post("/", requireRole("TKNV"), async (req, res) => {
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
});

/* Chuyển trạng thái chung (soạn thảo → chờ CCV → chờ thu ngân, v.v.) — không
   dùng cho cấp số/đẩy CMC, 2 việc đó có endpoint riêng bên dưới vì cần
   ràng buộc nghiệp vụ đặc thù. */
router.post("/:id/chuyen-trang-thai", async (req, res) => {
  const { trangThai } = req.body || {};
  if (!trangThai) return res.status(400).json({ error: "Thiếu trạng thái đích" });
  const before = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });

  const row = await prisma.hoSo.update({ where: { id: req.params.id }, data: { trangThai } });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "CHUYEN_TRANG_THAI", doiTuong: row.id,
    giaTriCu: before.trangThai, giaTriMoi: trangThai, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.json(row);
});

/* REQ-013 Smart Hint: Thu ngân cấp Số CC/CT/SY. Chống trùng bằng retry khi vi
   phạm unique (nam, thu_tu) thay vì SELECT...FOR UPDATE (đủ an toàn ở quy mô
   1 văn phòng, tránh phụ thuộc raw SQL lock). */
router.post("/:id/cap-so", requireRole("THU_NGAN"), async (req, res) => {
  const { soTienThucThu, noTienThu, noHoSo, phuongThucThanhToan } = req.body || {};
  const hoSo = await prisma.hoSo.findUnique({ where: { id: req.params.id } });
  if (!hoSo) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
  if (hoSo.soCongChung || hoSo.soChungThuc || hoSo.soSaoY) {
    return res.status(409).json({ error: "Hồ sơ đã được cấp số, không cấp lại" });
  }

  const nam = new Date().getFullYear();
  const cot = { HOP_DONG: "soCongChung", CHUNG_THUC: "soChungThuc", SAO_Y: "soSaoY" }[hoSo.loaiHoSo];
  const tienTo = { HOP_DONG: "0036", CHUNG_THUC: "CT", SAO_Y: "SY" }[hoSo.loaiHoSo];

  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    const max = await prisma.soCongChung.aggregate({ where: { nam }, _max: { thuTu: true } });
    const thuTu = (max._max.thuTu || 0) + 1;
    const soCc = `${tienTo}-${String(thuTu).padStart(6, "0")}-${nam}`;
    try {
      const [, updated] = await prisma.$transaction([
        prisma.soCongChung.create({ data: { soCc, nam, thuTu, hoSoId: hoSo.id } }),
        prisma.hoSo.update({
          where: { id: hoSo.id },
          data: {
            [cot]: soCc,
            soTienThucThu: soTienThucThu ?? null,
            noTienThu: !!noTienThu,
            noHoSo: !!noHoSo,
            trangThai: "DANG_LIEN_THONG", // chờ số hóa & đẩy CMC — không còn bước chốt số riêng
          },
        }),
      ]);
      await ghiNhatKy({
        nguoiThucHienId: req.user.id, loaiThaoTac: "CAP_SO", doiTuong: hoSo.id,
        giaTriMoi: soCc, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
      });
      return res.json({ hoSo: updated, soCc });
    } catch (e) {
      if (e.code === "P2002") { lastErr = e; continue; } // trùng số, thử số kế tiếp
      throw e;
    }
  }
  res.status(409).json({ error: "Không cấp được số sau nhiều lần thử, vui lòng thử lại", detail: String(lastErr) });
});

/* Ghi nhận 1 file đã số hóa (tiền xử lý/đặt tên/ghép nối đã chạy phía client —
   xem src/arc/pipeline.jsx). CHƯA lưu file nhị phân thật (multer/storage thuộc
   Mốc 6) — chỉ tạo bản ghi FileScan để làm điều kiện tiên quyết cho /finalize. */
router.post("/:id/file-scan", requireRole("LUU_TRU"), async (req, res) => {
  const { loaiFile, tenFile, dungLuongKb, doPhanGiaiDpi } = req.body || {};
  if (!loaiFile || !tenFile) return res.status(400).json({ error: "Thiếu loại file / tên file" });
  const row = await prisma.fileScan.create({
    data: {
      hoSoId: req.params.id,
      loaiFile,
      tenFile,
      duongDan: `/scans/${req.params.id}/${tenFile}`,
      dungLuongKb: Math.round(dungLuongKb || 0),
      doPhanGiaiDpi: doPhanGiaiDpi || 200,
    },
  });
  res.status(201).json(row);
});

/* Atomic "Hoàn tất số hóa & đẩy CMC": CHỈ cho phép khi đã có CCV ký VÀ ít nhất
   1 file VB đã gắn vào hồ sơ — đúng luồng vừa thống nhất (không đẩy dữ liệu
   trước rồi đính file sau). */
router.post("/:id/finalize", requireRole("LUU_TRU"), async (req, res) => {
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

  res.json(updatedHoSo);
});

module.exports = router;
