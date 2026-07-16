const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../lib/asyncHandler");

const router = express.Router();
router.use(requireAuth);

// Dùng khi Soạn thảo khởi tạo phiên mới cần tìm khách cũ trước khi tạo mới (tránh
// trùng) — trước đây màn "Khách cũ & hồ sơ liên quan" không hề gọi route này,
// toàn bộ kết quả tìm kiếm là dữ liệu bịa (src/data.jsx#priorRecords). Kèm theo
// lịch sử hồ sơ THẬT của khách (tối đa 5 hồ sơ gần nhất) để CCV/TKNV biết khách
// đã từng công chứng việc gì, không chỉ tên trùng khớp.
router.get("/", asyncHandler(async (req, res) => {
  const { q } = req.query;
  const where = q ? {
    OR: [
      { hoTen: { contains: q, mode: "insensitive" } },
      { soCccd: { contains: q, mode: "insensitive" } },
      { soDienThoai: { contains: q, mode: "insensitive" } },
    ],
  } : {};
  const rows = await prisma.khachHang.findMany({
    where,
    orderBy: { hoTen: "asc" },
    take: 20,
    include: {
      hoSos: {
        select: {
          id: true, maPhien: true, loaiHoSo: true, trangThai: true, ngayTao: true,
          soCongChung: true, soChungThuc: true, soSaoY: true,
          ccv: { select: { hoTen: true } },
          bieuMaus: { select: { ten: true } },
        },
        orderBy: { ngayTao: "desc" },
        take: 5,
      },
    },
  });
  res.json(rows);
}));

router.post("/", requireRole("TKNV"), asyncHandler(async (req, res) => {
  const { hoTen, soCccd, ngaySinh, diaChiThuongTru, diaChiLienLac, soDienThoai, email, ocrSource } = req.body || {};
  if (!hoTen) return res.status(400).json({ error: "Thiếu họ tên khách hàng" });
  const row = await prisma.khachHang.create({
    data: {
      hoTen,
      soCccd: soCccd || null,
      ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
      diaChiThuongTru: diaChiThuongTru || null,
      diaChiLienLac: diaChiLienLac || null,
      soDienThoai: soDienThoai || null,
      email: email || null,
      ocrSource: ocrSource || null,
    },
  });
  res.status(201).json(row);
}));

module.exports = router;
