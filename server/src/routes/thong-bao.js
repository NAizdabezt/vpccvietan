const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../lib/asyncHandler");

const router = express.Router();
router.use(requireAuth);

// Danh sách thông báo THẬT của người đang đăng nhập — broadcast theo vai trò
// HOẶC nhắm đúng người đó (xem lib/thong-bao.js).
router.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.thongBao.findMany({
    where: { OR: [{ vaiTro: { in: req.user.vaiTro } }, { nhanVienId: req.user.id }] },
    include: { hoSo: { select: { id: true, maPhien: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(rows);
}));

// Đánh dấu đã đọc TẤT CẢ thông báo thuộc về mình (theo vai trò hoặc đích danh).
router.post("/danh-dau-da-doc", asyncHandler(async (req, res) => {
  await prisma.thongBao.updateMany({
    where: { OR: [{ vaiTro: { in: req.user.vaiTro } }, { nhanVienId: req.user.id }], daDoc: false },
    data: { daDoc: true },
  });
  res.json({ ok: true });
}));

module.exports = router;
