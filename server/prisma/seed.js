const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const MAT_KHAU_DEMO = "Vietan@2026";

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000001", ten: "VPCC Việt An" },
  });

  const noiLamViec = await prisma.noiLamViec.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000002", ten: "Trụ sở chính", loai: "Trụ sở chính", diaChi: "TP. Hồ Chí Minh", soDienThoai: "028 3822 1234" },
  });

  const matKhauHash = await bcrypt.hash(MAT_KHAU_DEMO, 10);

  const NHAN_VIEN = [
    { maNhanVien: "viet.nq", hoTen: "Nguyễn Quốc Việt", email: "viet.nq@vietan.vn", vaiTro: ["CCV"] },
    { maNhanVien: "hang.lt", hoTen: "Lê Thị Hằng", email: "hang.lt@vietan.vn", vaiTro: ["CCV"] },
    { maNhanVien: "phuc.td", hoTen: "Trần Đình Phúc", email: "phuc.td@vietan.vn", vaiTro: ["CCV"] },
    { maNhanVien: "linh.tt", hoTen: "Trần Thị Mỹ Linh", email: "linh.tt@vietan.vn", vaiTro: ["TKNV"] },
    { maNhanVien: "hai.pt", hoTen: "Phan Thanh Hải", email: "hai.pt@vietan.vn", vaiTro: ["TKNV"] },
    { maNhanVien: "han.vn", hoTen: "Võ Ngọc Hân", email: "han.vn@vietan.vn", vaiTro: ["TKNV"] },
    { maNhanVien: "ha.ptt", hoTen: "Phạm Thị Thu Hà", email: "ha.ptt@vietan.vn", vaiTro: ["THU_NGAN"] },
    { maNhanVien: "ke.dv", hoTen: "Đỗ Văn Kế", email: "ke.dv@vietan.vn", vaiTro: ["KE_TOAN"] },
    { maNhanVien: "tuan.hm", hoTen: "Hoàng Minh Tuấn", email: "tuan.hm@vietan.vn", vaiTro: ["LUU_TRU"] },
    { maNhanVien: "can.nv", hoTen: "Nguyễn Văn Cần", email: "can.nv@vietan.vn", vaiTro: ["QTHT"] },
    { maNhanVien: "gd.vpcc", hoTen: "Ban Lãnh đạo VPCC", email: "gd@vietan.vn", vaiTro: ["LANH_DAO"] },
  ];

  const nv = {};
  for (const u of NHAN_VIEN) {
    nv[u.maNhanVien] = await prisma.nhanVien.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, matKhauHash, noiLamViecId: noiLamViec.id },
    });
  }

  const KHACH_HANG = [
    { hoTen: "VŨ THỊ KIM ANH", soCccd: "079188001101" },
    { hoTen: "HOÀNG MINH ĐỨC", soCccd: "079190002202" },
    { hoTen: "ĐẶNG THU TRANG", soCccd: "079192003303" },
    { hoTen: "BÙI VĂN KHÔI", soCccd: "079185004404" },
    { hoTen: "LƯƠNG THẾ VINH", soCccd: "079183005505" },
    { hoTen: "PHẠM THỊ BÍCH HẰNG", soCccd: "079187006606" },
    { hoTen: "NGÔ GIA BẢO", soCccd: "079195007707" },
    { hoTen: "ĐỖ MẠNH CƯỜNG", soCccd: "079180008808" },
  ];
  const kh = {};
  for (const k of KHACH_HANG) {
    kh[k.hoTen] = await prisma.khachHang.upsert({
      where: { soCccd: k.soCccd },
      update: {},
      create: k,
    });
  }

  // Biểu mẫu hợp đồng chuẩn — thay cho VA_FEE_BY_TYPE trong sessions.jsx (mock cũ).
  // HoSo nối n-n tới đây để biết (những) loại hợp đồng cụ thể, vì loai_ho_so chỉ có
  // 3 giá trị thô, không đủ chi tiết (xem ghi chú trong schema.prisma).
  const BIEU_MAU = [
    { ten: "HĐ Chuyển nhượng QSDĐ", nhom: "Đất đai", phiMacDinh: 3200000, builtin: true },
    { ten: "HĐ Tặng cho QSDĐ", nhom: "Đất đai", phiMacDinh: 2800000, builtin: true },
    { ten: "HĐ Thế chấp QSDĐ", nhom: "Đất đai", phiMacDinh: 4500000, builtin: true },
    { ten: "HĐ Mua bán xe", nhom: "Động sản", phiMacDinh: 1200000, builtin: true },
    { ten: "Văn bản ủy quyền", nhom: "Ủy quyền", phiMacDinh: 800000, builtin: true },
  ];
  const bm = {};
  for (const b of BIEU_MAU) {
    let row = await prisma.bieuMau.findFirst({ where: { ten: b.ten, builtin: true } });
    if (!row) row = await prisma.bieuMau.create({ data: { ...b, noiDung: {} } });
    bm[b.ten] = row;
  }

  // Xóa hồ sơ demo cũ (nếu seed lại) để tránh trùng, giữ nguyên nhân viên/khách hàng
  await prisma.soCongChung.deleteMany({});
  await prisma.hoSo.deleteMany({});

  const HO_SO = [
    { khach: "VŨ THỊ KIM ANH", loaiHoSo: "HOP_DONG", trangThai: "CHO_CCV", tknv: "linh.tt", types: ["HĐ Chuyển nhượng QSDĐ"] },
    { khach: "HOÀNG MINH ĐỨC", loaiHoSo: "HOP_DONG", trangThai: "NHAP_LIEU", tknv: "hai.pt", types: ["Văn bản ủy quyền"] },
    { khach: "ĐẶNG THU TRANG", loaiHoSo: "HOP_DONG", trangThai: "CHO_THU_NGAN", tknv: "linh.tt", ccv: "viet.nq", types: ["HĐ Mua bán xe"] },
    { khach: "BÙI VĂN KHÔI", loaiHoSo: "HOP_DONG", trangThai: "DANG_LIEN_THONG", tknv: "hai.pt", ccv: "hang.lt", types: ["HĐ Tặng cho QSDĐ"], soCC: 1965 },
    { khach: "LƯƠNG THẾ VINH", loaiHoSo: "HOP_DONG", trangThai: "DANG_LIEN_THONG", tknv: "han.vn", types: ["HĐ Chuyển nhượng QSDĐ"], soCC: 1974 },
    { khach: "PHẠM THỊ BÍCH HẰNG", loaiHoSo: "HOP_DONG", trangThai: "DANG_LIEN_THONG", tknv: "linh.tt", ccv: "viet.nq", types: ["HĐ Chuyển nhượng QSDĐ"], soCC: 1972 },
    { khach: "NGÔ GIA BẢO", loaiHoSo: "HOP_DONG", trangThai: "DANG_LIEN_THONG", tknv: "han.vn", ccv: "hang.lt", types: ["Văn bản ủy quyền"], soCC: 1969 },
    { khach: "ĐỖ MẠNH CƯỜNG", loaiHoSo: "HOP_DONG", trangThai: "HOAN_TAT", tknv: "hai.pt", ccv: "viet.nq", types: ["HĐ Mua bán xe"], soCC: 1961 },
  ];

  const nam = new Date().getFullYear();
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const maPhienPrefix = `PGD-${today.getFullYear()}-${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
  let seq = 1;
  for (const h of HO_SO) {
    const phi = h.types.reduce((sum, t) => sum + Number(bm[t].phiMacDinh), 0);
    const hoSo = await prisma.hoSo.create({
      data: {
        maPhien: `${maPhienPrefix}-${String(seq++).padStart(3, "0")}`,
        loaiHoSo: h.loaiHoSo,
        trangThai: h.trangThai,
        khachHangId: kh[h.khach].id,
        tknvId: nv[h.tknv].id,
        ccvId: h.ccv ? nv[h.ccv].id : null,
        phiDichVu: phi,
        soCongChung: h.soCC ? `0036-${String(h.soCC).padStart(6, "0")}-${nam}` : null,
        createdById: nv[h.tknv].id,
        bieuMaus: { connect: h.types.map((t) => ({ id: bm[t].id })) },
      },
    });
    if (h.soCC) {
      await prisma.soCongChung.create({
        data: { soCc: hoSo.soCongChung, nam, thuTu: h.soCC, hoSoId: hoSo.id },
      });
    }
  }

  console.log("Seed xong:", NHAN_VIEN.length, "nhân viên,", KHACH_HANG.length, "khách hàng,", BIEU_MAU.length, "biểu mẫu,", HO_SO.length, "hồ sơ.");
  console.log(`Đăng nhập demo: <email> / mật khẩu "${MAT_KHAU_DEMO}" (vd viet.nq@vietan.vn, tuan.hm@vietan.vn...)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
