const express = require("express");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { ghiNhatKy } = require("../lib/audit");

const router = express.Router();
router.use(requireAuth);

const NHAN_VIEN_SAFE = { id: true, maNhanVien: true, hoTen: true, vaiTro: true };

// REQ-052: Phân quyền Ủy thác — QTHT cấp/sửa/thu hồi, "Ký số" không bao giờ
// nằm trong phạm vi ủy thác được (chặn ở tầng ứng dụng, không có trong danh mục scope).
router.get("/", async (req, res) => {
  const rows = await prisma.uyThac.findMany({
    include: { nguoiDuocUyThac: { select: NHAN_VIEN_SAFE }, ccvChuToken: { select: NHAN_VIEN_SAFE } },
    orderBy: { createdAt: "desc" },
  });
  res.json(rows);
});

router.post("/", requireRole("QTHT"), async (req, res) => {
  const { nguoiDuocUyThacId, ccvChuTokenId, phamVi, thoiHan } = req.body || {};
  if (!nguoiDuocUyThacId || !ccvChuTokenId || !Array.isArray(phamVi) || !phamVi.length || !thoiHan) {
    return res.status(400).json({ error: "Thiếu người được ủy thác / CCV chủ token / phạm vi / thời hạn" });
  }
  if (phamVi.includes("sign") || phamVi.includes("ky_so")) {
    return res.status(422).json({ error: "Thẩm quyền Ký số không được phép ủy thác" });
  }
  const row = await prisma.uyThac.create({
    data: { nguoiDuocUyThacId, ccvChuTokenId, phamVi, thoiHan: new Date(thoiHan) },
    include: { nguoiDuocUyThac: { select: NHAN_VIEN_SAFE }, ccvChuToken: { select: NHAN_VIEN_SAFE } },
  });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "TAO_UY_THAC", doiTuong: row.id,
    giaTriMoi: row.nguoiDuocUyThac.hoTen + " uỷ thác từ " + row.ccvChuToken.hoTen, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.status(201).json(row);
});

router.patch("/:id", requireRole("QTHT"), async (req, res) => {
  const { phamVi, thoiHan } = req.body || {};
  const before = await prisma.uyThac.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy ủy thác" });
  if (before.trangThai === "DA_THU_HOI") return res.status(409).json({ error: "Ủy thác đã bị thu hồi, không sửa được" });
  if (phamVi && (phamVi.includes("sign") || phamVi.includes("ky_so"))) {
    return res.status(422).json({ error: "Thẩm quyền Ký số không được phép ủy thác" });
  }
  const data = {};
  if (phamVi) data.phamVi = phamVi;
  if (thoiHan) data.thoiHan = new Date(thoiHan);
  const row = await prisma.uyThac.update({
    where: { id: req.params.id }, data,
    include: { nguoiDuocUyThac: { select: NHAN_VIEN_SAFE }, ccvChuToken: { select: NHAN_VIEN_SAFE } },
  });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "SUA_UY_THAC", doiTuong: row.id, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.json(row);
});

router.post("/:id/thu-hoi", requireRole("QTHT"), async (req, res) => {
  const before = await prisma.uyThac.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Không tìm thấy ủy thác" });
  const row = await prisma.uyThac.update({
    where: { id: req.params.id }, data: { trangThai: "DA_THU_HOI" },
    include: { nguoiDuocUyThac: { select: NHAN_VIEN_SAFE }, ccvChuToken: { select: NHAN_VIEN_SAFE } },
  });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "THU_HOI_UY_THAC", doiTuong: row.id,
    giaTriCu: "CON_HIEU_LUC", giaTriMoi: "DA_THU_HOI", ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.json(row);
});

module.exports = router;
