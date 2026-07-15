const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { ghiNhatKy } = require("../lib/audit");

const router = express.Router();
router.use(requireAuth);

const SAFE_SELECT = { id: true, maNhanVien: true, hoTen: true, vaiTro: true, trangThai: true, email: true, noiLamViecId: true, lastLogin: true };
const MAT_KHAU_MAC_DINH = "123456";

router.get("/", async (req, res) => {
  const { vaiTro } = req.query;
  const where = vaiTro ? { vaiTro: { has: vaiTro } } : {};
  const rows = await prisma.nhanVien.findMany({ where, select: SAFE_SELECT, orderBy: { hoTen: "asc" } });
  res.json(rows);
});

// REQ-050: Admin khởi tạo tài khoản định danh riêng cho từng nhân sự — mật khẩu
// mặc định, buộc đổi ở lần đăng nhập đầu (thực thi ở tầng client vì schema hiện
// tại không có cờ mustChange riêng — theo dõi qua lastLogin null).
router.post("/", requireRole("QTHT"), async (req, res) => {
  const { hoTen, maNhanVien, email, vaiTro, noiLamViecId } = req.body || {};
  if (!hoTen || !maNhanVien || !email || !Array.isArray(vaiTro) || !vaiTro.length) {
    return res.status(400).json({ error: "Thiếu họ tên / mã nhân viên / email / vai trò" });
  }
  const matKhauHash = await bcrypt.hash(MAT_KHAU_MAC_DINH, 10);
  const row = await prisma.nhanVien.create({
    data: { hoTen, maNhanVien, email, vaiTro, noiLamViecId: noiLamViecId || null, matKhauHash },
    select: SAFE_SELECT,
  });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "TAO_TAI_KHOAN", doiTuong: row.maNhanVien, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.status(201).json({ ...row, matKhauMacDinh: MAT_KHAU_MAC_DINH });
});

// Khóa/mở tài khoản (toggle)
router.post("/:id/khoa", requireRole("QTHT"), async (req, res) => {
  const nv = await prisma.nhanVien.findUnique({ where: { id: req.params.id } });
  if (!nv) return res.status(404).json({ error: "Không tìm thấy tài khoản" });
  const trangThaiMoi = nv.trangThai === "LOCKED" ? "ACTIVE" : "LOCKED";
  const row = await prisma.nhanVien.update({ where: { id: nv.id }, data: { trangThai: trangThaiMoi }, select: SAFE_SELECT });
  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: trangThaiMoi === "LOCKED" ? "KHOA_TAI_KHOAN" : "MO_KHOA_TAI_KHOAN",
    doiTuong: nv.maNhanVien, giaTriCu: nv.trangThai, giaTriMoi: trangThaiMoi, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });
  res.json(row);
});

// Đặt lại mật khẩu về mặc định (REQ-058 nói người dùng tự đổi được; đây là nhánh
// Admin đặt lại hộ khi quên/khoá)
router.post("/:id/dat-lai-mat-khau", requireRole("QTHT"), async (req, res) => {
  const nv = await prisma.nhanVien.findUnique({ where: { id: req.params.id } });
  if (!nv) return res.status(404).json({ error: "Không tìm thấy tài khoản" });
  const matKhauHash = await bcrypt.hash(MAT_KHAU_MAC_DINH, 10);
  await prisma.nhanVien.update({ where: { id: nv.id }, data: { matKhauHash } });
  await ghiNhatKy({ nguoiThucHienId: req.user.id, loaiThaoTac: "DAT_LAI_MAT_KHAU", doiTuong: nv.maNhanVien, ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân" });
  res.json({ ok: true, matKhauMacDinh: MAT_KHAU_MAC_DINH });
});

module.exports = router;
