const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth);

// REQ-054: Nhật ký thao tác — CHỈ GET, không có route update/delete nào cho
// NhatKyThaoTac ở bất kỳ file nào trong server/ (append-only, NFR-007).
router.get("/", requireRole("QTHT", "LANH_DAO"), async (req, res) => {
  const { actor, loaiThaoTac, q } = req.query;
  const where = {};
  if (actor) where.nguoiThucHienId = actor;
  if (loaiThaoTac) where.loaiThaoTac = loaiThaoTac;
  if (q) where.doiTuong = { contains: q, mode: "insensitive" };

  const rows = await prisma.nhatKyThaoTac.findMany({
    where,
    include: { nguoiThucHien: { select: { id: true, hoTen: true, maNhanVien: true } } },
    orderBy: { thoiGian: "desc" },
    take: 300,
  });
  res.json(rows);
});

module.exports = router;
