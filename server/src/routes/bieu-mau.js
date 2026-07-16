const express = require("express");
const path = require("path");
const mammoth = require("mammoth");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { ghiNhatKy } = require("../lib/audit");
const { asyncHandler } = require("../lib/asyncHandler");
const { single: uploadSingle } = require("../lib/upload");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.bieuMau.findMany({ orderBy: { ten: "asc" } });
  res.json(rows);
}));

// Đọc nội dung THẬT từ file .docx người dùng tải lên (mammoth: docx -> HTML)
// để nạp vào Quill làm nội dung khởi tạo, thay vì gõ tay lại — chỉ đọc văn bản/
// cấu trúc đoạn, KHÔNG tự nhận diện trường dữ liệu (người dùng vẫn phải tự đánh
// dấu trường sau khi đọc, qua màn "Cập nhật nội dung").
router.post("/parse-docx", requireRole("TKNV"), uploadSingle("file"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Thiếu file tải lên" });
  const ext = path.extname(req.file.originalname || "").toLowerCase();
  if (ext !== ".docx") return res.status(400).json({ error: "Chỉ đọc được nội dung từ file .docx (Word mới) — .doc/.pdf/.rtf/.odt chưa hỗ trợ" });
  const result = await mammoth.convertToHtml({ buffer: req.file.buffer });
  res.json({ html: result.value, warnings: result.messages.map((m) => m.message) });
}));

// Mốc 6: CRUD biểu mẫu tùy chỉnh (không builtin) — màn "Biểu mẫu soạn thảo"
// sống trong app soạn thảo của TKNV/CCV nên dùng cùng cấp quyền requireRole("TKNV").
router.post("/", requireRole("TKNV"), asyncHandler(async (req, res) => {
  const { ten, nhom, phiMacDinh, tenFile, noiDung } = req.body || {};
  if (!ten) return res.status(400).json({ error: "Thiếu tên biểu mẫu" });
  const row = await prisma.bieuMau.create({
    data: { ten, nhom: nhom || null, phiMacDinh: phiMacDinh != null ? phiMacDinh : null, tenFile: tenFile || null, builtin: false, noiDung: noiDung || {}, taoBoiId: req.user.id },
  });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "TAO_BIEU_MAU", doiTuong: row.id, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.status(201).json(row);
}));

router.patch("/:id", requireRole("TKNV"), asyncHandler(async (req, res) => {
  const { ten, nhom, phiMacDinh, noiDung } = req.body || {};
  const before = await prisma.bieuMau.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy biểu mẫu" });
  if (before.builtin) return res.status(403).json({ error: "Không thể sửa biểu mẫu chuẩn (builtin)" });

  const data = {};
  if (ten != null) data.ten = ten;
  if (nhom != null) data.nhom = nhom;
  if (phiMacDinh != null) data.phiMacDinh = phiMacDinh;
  if (noiDung != null) data.noiDung = noiDung;
  const row = await prisma.bieuMau.update({ where: { id: req.params.id }, data });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "SUA_BIEU_MAU", doiTuong: row.id,
    giaTriCu: JSON.stringify(before), giaTriMoi: JSON.stringify(row), ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.json(row);
}));

router.delete("/:id", requireRole("TKNV"), asyncHandler(async (req, res) => {
  const before = await prisma.bieuMau.findUnique({ where: { id: req.params.id }, include: { _count: { select: { hoSos: true } } } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy biểu mẫu" });
  if (before.builtin) return res.status(403).json({ error: "Không thể xóa biểu mẫu chuẩn (builtin)" });
  if (before._count.hoSos > 0) return res.status(409).json({ error: "Biểu mẫu đã được dùng trong hồ sơ, không thể xóa" });

  await prisma.bieuMau.delete({ where: { id: req.params.id } });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "XOA_BIEU_MAU", doiTuong: before.ten, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.json({ ok: true });
}));

module.exports = router;
