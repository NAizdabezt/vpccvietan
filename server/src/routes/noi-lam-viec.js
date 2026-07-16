const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { ghiNhatKy } = require("../lib/audit");
const { asyncHandler } = require("../lib/asyncHandler");

const router = express.Router();
router.use(requireAuth);

// REQ-051: quản lý danh mục nơi làm việc (văn phòng/chi nhánh)
router.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.noiLamViec.findMany({
    include: { _count: { select: { nhanViens: true } } },
    orderBy: { ten: "asc" },
  });
  res.json(rows);
}));

router.post("/", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const { ten, loai, diaChi, soDienThoai } = req.body || {};
  if (!ten) return res.status(400).json({ error: "Thiếu tên nơi làm việc" });
  const row = await prisma.noiLamViec.create({ data: { ten, loai, diaChi, soDienThoai } });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "TAO_NOI_LAM_VIEC", doiTuong: row.ten, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.status(201).json(row);
}));

router.patch("/:id", requireRole("QTHT"), asyncHandler(async (req, res) => {
  const { ten, loai, diaChi, soDienThoai, trangThai } = req.body || {};
  const before = await prisma.noiLamViec.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy nơi làm việc" });
  const data = {};
  if (ten != null) data.ten = ten;
  if (loai != null) data.loai = loai;
  if (diaChi != null) data.diaChi = diaChi;
  if (soDienThoai != null) data.soDienThoai = soDienThoai;
  if (trangThai != null) data.trangThai = !!trangThai;
  const row = await prisma.noiLamViec.update({ where: { id: req.params.id }, data });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "CAP_NHAT_NOI_LAM_VIEC", doiTuong: row.ten,
    giaTriCu: JSON.stringify(before), giaTriMoi: JSON.stringify(row), ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.json(row);
}));

module.exports = router;
