const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../lib/asyncHandler");

const router = express.Router();
router.use(requireAuth);

// Chỉ 1 tenant hiện có (seed sẵn) — văn phòng thứ 2 trở đi sẽ cần NhanVien có
// tenantId riêng để tách theo đúng cơ sở; chưa làm ở đợt này (ngoài phạm vi
// "thiết kế luồng", xem trao đổi trước khi làm tính năng này).
const TENANT_ID = "00000000-0000-0000-0000-000000000001";

/* "Thiết kế luồng" — CHỈ cấu hình phần an toàn: mô tả từng bước (cố định 5
   bước, không thêm/bớt/nối lại vì đó là quy trình công chứng theo luật) và
   danh sách giấy tờ cần nhập ở bước "Bóc tách giấy tờ" theo từng nhóm biểu
   mẫu (BieuMau.nhom) — KHÔNG cấu hình trạng thái/RBAC/điều kiện chuyển bước.
   Versioning thật: 1 bản NHÁP có thể sửa tự do; kích hoạt xong thì khóa lại
   (chỉ đọc), muốn sửa tiếp phải "Nhân bản" ra bản nháp mới. */

router.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.luongNghiepVu.findMany({
    where: { tenantId: TENANT_ID },
    orderBy: [{ ten: "asc" }, { phienBan: "desc" }],
  });
  res.json(rows);
}));

router.post("/", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const { ten, danhSachBuoc } = req.body || {};
  if (!ten || !ten.trim()) return res.status(400).json({ error: "Thiếu tên luồng" });
  const existed = await prisma.luongNghiepVu.findFirst({ where: { tenantId: TENANT_ID, ten: ten.trim() } });
  if (existed) return res.status(409).json({ error: "Đã có luồng tên này — hãy sửa bản nháp hoặc Nhân bản thay vì tạo mới" });
  const row = await prisma.luongNghiepVu.create({
    data: { ten: ten.trim(), tenantId: TENANT_ID, phienBan: 1, trangThai: "NHAP", danhSachBuoc: danhSachBuoc || {} },
  });
  res.status(201).json(row);
}));

router.patch("/:id", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const row = await prisma.luongNghiepVu.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ error: "Không tìm thấy luồng" });
  if (row.trangThai !== "NHAP") return res.status(409).json({ error: "Chỉ sửa được bản nháp — hãy Nhân bản để tạo bản nháp mới rồi sửa" });
  const { danhSachBuoc } = req.body || {};
  const updated = await prisma.luongNghiepVu.update({
    where: { id: row.id },
    data: { danhSachBuoc: danhSachBuoc ?? row.danhSachBuoc },
  });
  res.json(updated);
}));

// Nhân bản: tạo bản NHÁP mới (số phiên bản kế tiếp của cùng "ten") sao chép
// nội dung từ 1 phiên bản có sẵn (đang áp dụng hoặc đã lưu trữ) để sửa tiếp.
router.post("/:id/nhan-ban", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const src = await prisma.luongNghiepVu.findUnique({ where: { id: req.params.id } });
  if (!src) return res.status(404).json({ error: "Không tìm thấy luồng" });
  const max = await prisma.luongNghiepVu.aggregate({ where: { tenantId: TENANT_ID, ten: src.ten }, _max: { phienBan: true } });
  const row = await prisma.luongNghiepVu.create({
    data: { ten: src.ten, tenantId: TENANT_ID, phienBan: (max._max.phienBan || 0) + 1, trangThai: "NHAP", danhSachBuoc: src.danhSachBuoc },
  });
  res.status(201).json(row);
}));

// Kích hoạt: bản này -> đang áp dụng; bản đang áp dụng trước đó (cùng "ten",
// nếu có) -> lưu trữ. Chỉ 1 bản "đang áp dụng" cho mỗi tên luồng tại 1 thời điểm.
router.post("/:id/kich-hoat", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const row = await prisma.luongNghiepVu.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ error: "Không tìm thấy luồng" });
  await prisma.$transaction([
    prisma.luongNghiepVu.updateMany({
      where: { tenantId: TENANT_ID, ten: row.ten, trangThai: "DANG_AP_DUNG" },
      data: { trangThai: "DA_LUU_TRU" },
    }),
    prisma.luongNghiepVu.update({ where: { id: row.id }, data: { trangThai: "DANG_AP_DUNG" } }),
  ]);
  const updated = await prisma.luongNghiepVu.findUnique({ where: { id: row.id } });
  res.json(updated);
}));

router.delete("/:id", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const row = await prisma.luongNghiepVu.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ error: "Không tìm thấy luồng" });
  if (row.trangThai !== "NHAP") return res.status(409).json({ error: "Chỉ xóa được bản nháp" });
  await prisma.luongNghiepVu.delete({ where: { id: row.id } });
  res.json({ ok: true });
}));

module.exports = router;
