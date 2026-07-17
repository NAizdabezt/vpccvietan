-- AlterEnum: thêm 2 loại file mới cho FileScan — giấy tờ chụp ở bước "Bóc
-- tách giấy tờ" và ảnh chụp ở bước "Tra cứu ngăn chặn" (trước đây chỉ có
-- VB/HS dành cho Lưu trữ và ANH_CHUP_HIEN_TRUONG dành cho CCV).
ALTER TYPE "LoaiFile" ADD VALUE 'GIAY_TO_DINH_KEM';
ALTER TYPE "LoaiFile" ADD VALUE 'ANH_TRA_CUU';
