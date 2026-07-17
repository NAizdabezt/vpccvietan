const { prisma } = require("./prisma");
const wsHub = require("./ws-hub");

// Thông báo broadcast theo VAI TRÒ (vaiTro) hoặc nhắm đúng 1 người
// (nhanVienId — vd báo cho người soạn ban đầu khi bị giành khóa). Đẩy ngay qua
// WebSocket (nếu người nhận đang mở kết nối) NGOÀI việc lưu DB để chuông vẫn
// đọc lại đúng khi tải trang/rớt kết nối.
async function taoThongBao({ vaiTro, nhanVienId, tieuDe, noiDung, hoSoId, hanhDong }) {
  const row = await prisma.thongBao.create({
    data: {
      vaiTro: vaiTro || null,
      nhanVienId: nhanVienId || null,
      tieuDe,
      noiDung: noiDung || null,
      hanhDong: hanhDong || null,
      hoSoId: hoSoId || null,
    },
  });
  if (nhanVienId) wsHub.notifyUser(nhanVienId, row);
  else if (vaiTro) wsHub.notifyRole(vaiTro, row);
  return row;
}

// Kiểm tra Thiết kế luồng (Quản trị hệ thống) có tắt thông báo cho bước NÀY
// hay không — mỗi bước "Cấp số & thu phí"/"Số hóa & đẩy CMC" có tickbox
// "Hiện thông báo" riêng theo từng NHÓM biểu mẫu. Hồ sơ có thể gồm nhiều nhóm
// (nhiều biểu mẫu khác nhóm) — chỉ tắt thông báo khi TẤT CẢ nhóm liên quan đều
// tắt; nhóm chưa cấu hình luồng nào thì mặc định vẫn bật (an toàn, không âm
// thầm mất thông báo).
async function thongBaoBatBuoc(hoSoId, buocId) {
  const hoSo = await prisma.hoSo.findUnique({ where: { id: hoSoId }, include: { bieuMaus: true } });
  if (!hoSo) return true;
  const nhoms = [...new Set((hoSo.bieuMaus || []).map((b) => b.nhom).filter(Boolean))];
  if (!nhoms.length) return true;
  const flows = await prisma.luongNghiepVu.findMany({ where: { ten: { in: nhoms }, trangThai: "DANG_AP_DUNG" } });
  if (!flows.length) return true;
  return flows.some((f) => {
    const buoc = f.danhSachBuoc && f.danhSachBuoc.buoc;
    const b = Array.isArray(buoc) && buoc.find((x) => x.id === buocId);
    return !b || b.thongBao !== false;
  });
}

module.exports = { taoThongBao, thongBaoBatBuoc };
