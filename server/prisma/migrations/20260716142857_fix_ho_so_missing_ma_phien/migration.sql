-- Cùng dạng lệch migration-history như "noi_lam_viec" ở migration trước:
-- "ma_phien" đã có trong schema.prisma (và trong dev DB local, thêm ngoài
-- luồng migration khi build tính năng Mã phiên) nhưng chưa từng có migration
-- nào tạo cột này — database mới (Render) tạo bảng ho_so xong vẫn thiếu cột,
-- seed.js lỗi P2022 ngay câu insert đầu tiên.
-- AlterTable
ALTER TABLE "ho_so" ADD COLUMN "ma_phien" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ho_so_ma_phien_key" ON "ho_so"("ma_phien");
