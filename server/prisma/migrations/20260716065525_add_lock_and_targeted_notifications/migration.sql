-- AlterTable: khóa soạn thảo thật trên ho_so
ALTER TABLE "ho_so" ADD COLUMN     "dang_soan_boi_id" UUID,
ADD COLUMN     "dang_soan_tu" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_dang_soan_boi_id_fkey" FOREIGN KEY ("dang_soan_boi_id") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: thong_bao cho phép nhắm đúng 1 người (nhan_vien_id) thay vì chỉ
-- broadcast theo vai_tro, và thêm hanh_dong (gợi ý màn cần mở khi bấm vào)
ALTER TABLE "thong_bao" ALTER COLUMN "vai_tro" DROP NOT NULL;
ALTER TABLE "thong_bao" ADD COLUMN     "nhan_vien_id" UUID,
ADD COLUMN     "hanh_dong" TEXT;

-- AddForeignKey
ALTER TABLE "thong_bao" ADD CONSTRAINT "thong_bao_nhan_vien_id_fkey" FOREIGN KEY ("nhan_vien_id") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
