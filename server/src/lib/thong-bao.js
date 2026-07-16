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

module.exports = { taoThongBao };
