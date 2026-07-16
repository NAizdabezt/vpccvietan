-- CreateEnum
CREATE TYPE "HinhThucThanhToan" AS ENUM ('TIEN_MAT', 'CHUYEN_KHOAN');

-- AlterTable
ALTER TABLE "ho_so" ADD COLUMN "hinh_thuc_thanh_toan" "HinhThucThanhToan";
