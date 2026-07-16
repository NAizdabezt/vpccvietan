-- Vá lệch giữa migration history và schema.prisma: "loai" và "so_dien_thoai"
-- đã có trong schema (và trong database dev local, được thêm ngoài luồng
-- migration) nhưng chưa từng có migration nào tạo ra — khiến database MỚI
-- (vd Render) chạy migrate deploy xong vẫn thiếu 2 cột này, seed.js lỗi P2022.
-- AlterTable
ALTER TABLE "noi_lam_viec" ADD COLUMN "loai" TEXT,
ADD COLUMN "so_dien_thoai" TEXT;
