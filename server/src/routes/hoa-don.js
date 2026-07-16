const express = require("express");
const { prisma } = require("../lib/prisma");
const { ghiNhatKy } = require("../lib/audit");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { asyncHandler } = require("../lib/asyncHandler");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.hoaDon.findMany({
    include: { hoSos: { select: { id: true, maPhien: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(rows);
}));

// Mốc 6: REQ-021/022/023 — nhận mảng hoSoIds để tương thích khi có gom nhóm tự
// động thật sau này (màn Kế toán hiện tại chỉ gọi với 1 phần tử/lần). Không có
// kết nối EasyInvoice thật (REQ-047, thiếu thông tin xác thực) nên coi "phát
// hành" thành công ngay, giống cách /cap-so không gọi cơ quan nhà nước thật.
router.post("/", requireRole("KE_TOAN"), asyncHandler(async (req, res) => {
  const { hoSoIds, issueDate, mst } = req.body || {};
  if (!Array.isArray(hoSoIds) || !hoSoIds.length) return res.status(400).json({ error: "Thiếu danh sách hồ sơ để xuất hóa đơn" });

  const hoSos = await prisma.hoSo.findMany({ where: { id: { in: hoSoIds } }, include: { khachHang: true } });
  if (hoSos.length !== hoSoIds.length) return res.status(404).json({ error: "Có hồ sơ không tồn tại trong danh sách" });
  if (hoSos.some((h) => h.hoaDonId)) return res.status(409).json({ error: "Có hồ sơ đã được xuất hóa đơn trước đó" });

  const tongTien = hoSos.reduce((sum, h) => sum + Number(h.soTienThucThu ?? h.phiDichVu ?? 0), 0);
  const first = hoSos[0];

  const hoaDon = await prisma.$transaction(async (tx) => {
    const row = await tx.hoaDon.create({
      data: {
        tenKhach: (first.khachHang && first.khachHang.hoTen) || "Khách lẻ",
        diaChi: (first.khachHang && (first.khachHang.diaChiLienLac || first.khachHang.diaChiThuongTru)) || null,
        maSoThue: mst || null,
        tongTien,
        ngayGiaoDich: first.ngayTao,
        ngayXuat: issueDate ? new Date(issueDate) : new Date(),
        trangThai: "DA_PHAT_HANH",
      },
    });
    await tx.hoSo.updateMany({ where: { id: { in: hoSoIds } }, data: { hoaDonId: row.id } });
    return row;
  });

  await ghiNhatKy({
    nguoiThucHienId: req.user.id, loaiThaoTac: "XUAT_HOA_DON", doiTuong: hoaDon.id,
    giaTriMoi: String(tongTien), ketQua: "HOAN_TAT", tokenSuDung: "Token cá nhân",
  });

  res.status(201).json(hoaDon);
}));

module.exports = router;
