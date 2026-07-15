const crypto = require("crypto");
const { prisma } = require("./prisma");

/* Nhật ký thao tác (NhatKyThaoTac) chỉ cho INSERT — không có route update/delete
   nào chạm vào bảng này. ma_bam băm luôn maBam của bản ghi liền trước để tạo
   thành 1 chuỗi: sửa/xóa 1 dòng bất kỳ sẽ làm đứt chuỗi và phát hiện được. */
async function ghiNhatKy({ nguoiThucHienId, loaiThaoTac, doiTuong, giaTriCu, giaTriMoi, tokenSuDung, ipThietBi, ketQua }) {
  const last = await prisma.nhatKyThaoTac.findFirst({ orderBy: { thoiGian: "desc" } });
  const thoiGian = new Date();
  const payload = JSON.stringify({
    thoiGian: thoiGian.toISOString(),
    nguoiThucHienId,
    loaiThaoTac,
    doiTuong,
    giaTriCu: giaTriCu ?? null,
    giaTriMoi: giaTriMoi ?? null,
    prevHash: last ? last.maBam : null,
  });
  const maBam = crypto.createHash("sha256").update(payload).digest("hex");

  return prisma.nhatKyThaoTac.create({
    data: {
      thoiGian,
      nguoiThucHienId,
      loaiThaoTac,
      doiTuong,
      giaTriCu: giaTriCu != null ? String(giaTriCu) : null,
      giaTriMoi: giaTriMoi != null ? String(giaTriMoi) : null,
      tokenSuDung: tokenSuDung ?? null,
      ipThietBi: ipThietBi ?? null,
      ketQua,
      maBam,
    },
  });
}

module.exports = { ghiNhatKy };
