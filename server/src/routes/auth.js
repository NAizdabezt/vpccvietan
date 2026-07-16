const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../lib/prisma");
const { ghiNhatKy } = require("../lib/audit");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../lib/asyncHandler");

const router = express.Router();

const MAX_SAI_MAT_KHAU = 5;
const failedAttempts = new Map(); // email -> count (in-memory; đủ cho demo 1 tiến trình)

router.post("/login", asyncHandler(async (req, res) => {
  // Chấp nhận cả email đầy đủ lẫn mã nhân viên ngắn (vd "linh.tt") để khớp
  // với ô "Tên đăng nhập" đã có sẵn trên các form frontend.
  const { taiKhoan, email: emailField, matKhau } = req.body || {};
  const taiKhoanRaw = (taiKhoan || emailField || "").trim();
  if (!taiKhoanRaw || !matKhau) return res.status(400).json({ error: "Thiếu tài khoản hoặc mật khẩu" });

  const nv = await prisma.nhanVien.findFirst({
    where: { OR: [{ email: taiKhoanRaw }, { maNhanVien: taiKhoanRaw }] },
  });
  if (!nv || nv.trangThai !== "ACTIVE") {
    return res.status(401).json({ error: "Tài khoản không tồn tại hoặc đã bị khóa" });
  }

  const attempts = failedAttempts.get(nv.email) || 0;
  if (attempts >= MAX_SAI_MAT_KHAU) {
    return res.status(423).json({ error: "Tài khoản tạm khóa do nhập sai mật khẩu quá số lần quy định" });
  }

  const ok = await bcrypt.compare(matKhau, nv.matKhauHash);
  if (!ok) {
    failedAttempts.set(nv.email, attempts + 1);
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }
  failedAttempts.delete(nv.email);

  // REQ-050: chưa có cờ mustChange riêng trong schema — dùng lastLogin null làm
  // dấu hiệu "chưa từng đăng nhập" (đọc TRƯỚC khi ghi đè lastLogin bên dưới).
  const mustChangePassword = !nv.lastLogin;

  const payload = { id: nv.id, maNhanVien: nv.maNhanVien, hoTen: nv.hoTen, vaiTro: nv.vaiTro };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

  await prisma.nhanVien.update({ where: { id: nv.id }, data: { lastLogin: new Date() } });
  await ghiNhatKy({
    nguoiThucHienId: nv.id,
    loaiThaoTac: "DANG_NHAP",
    doiTuong: nv.maNhanVien,
    ketQua: "HOAN_TAT",
    ipThietBi: req.ip,
  });

  res.json({ token, nhanVien: payload, mustChangePassword });
}));

router.post("/doi-mat-khau", requireAuth, asyncHandler(async (req, res) => {
  const { matKhauCu, matKhauMoi } = req.body || {};
  if (!matKhauCu || !matKhauMoi) return res.status(400).json({ error: "Thiếu mật khẩu cũ/mới" });

  const nv = await prisma.nhanVien.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(matKhauCu, nv.matKhauHash);
  if (!ok) return res.status(401).json({ error: "Mật khẩu cũ không đúng" });

  const matKhauHash = await bcrypt.hash(matKhauMoi, 10);
  await prisma.nhanVien.update({ where: { id: nv.id }, data: { matKhauHash } });
  await ghiNhatKy({
    nguoiThucHienId: nv.id,
    loaiThaoTac: "DOI_MAT_KHAU",
    doiTuong: nv.maNhanVien,
    ketQua: "HOAN_TAT",
    ipThietBi: req.ip,
  });

  res.json({ ok: true });
}));

module.exports = router;
