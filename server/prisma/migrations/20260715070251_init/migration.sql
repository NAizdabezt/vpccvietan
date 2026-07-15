-- CreateEnum
CREATE TYPE "VaiTro" AS ENUM ('TKNV', 'CCV', 'THU_NGAN', 'KE_TOAN', 'LUU_TRU', 'QTHT', 'LANH_DAO');

-- CreateEnum
CREATE TYPE "TrangThaiTaiKhoan" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "OcrSource" AS ENUM ('VNEID', 'CCCD_CHIP', 'MANUAL', 'IMPORT');

-- CreateEnum
CREATE TYPE "LoaiHoSo" AS ENUM ('HOP_DONG', 'CHUNG_THUC', 'SAO_Y');

-- CreateEnum
CREATE TYPE "TrangThaiHoSo" AS ENUM ('NHAP_LIEU', 'CHO_CCV', 'CHO_THU_NGAN', 'DA_CAP_SO', 'DANG_LIEN_THONG', 'HOAN_TAT', 'LOI', 'CHO_BO_SUNG');

-- CreateEnum
CREATE TYPE "LoaiFile" AS ENUM ('VB', 'HS', 'ANH_GHI_CHU_NGOAI_LE', 'ANH_CHUP_HIEN_TRUONG');

-- CreateEnum
CREATE TYPE "TrangThaiCmc" AS ENUM ('CHO_DAY', 'DANG_DAY', 'THANH_CONG', 'LOI', 'RETRY');

-- CreateEnum
CREATE TYPE "TrangThaiSoCC" AS ENUM ('HOAT_DONG', 'DA_HUY', 'THAY_THE');

-- CreateEnum
CREATE TYPE "LoaiHieuChinh" AS ENUM ('SUA_TT', 'SUA_SO_CC', 'HUY_SO', 'IN_KY_LAI');

-- CreateEnum
CREATE TYPE "TrangThaiYeuCau" AS ENUM ('CHO_DUYET', 'DA_DUYET', 'TU_CHOI');

-- CreateEnum
CREATE TYPE "KetQuaAudit" AS ENUM ('HOAN_TAT', 'DA_DONG_BO_CMC', 'CHO_DUYET', 'TU_CHOI');

-- CreateEnum
CREATE TYPE "TrangThaiUyThac" AS ENUM ('CON_HIEU_LUC', 'DA_THU_HOI');

-- CreateEnum
CREATE TYPE "TrangThaiWorkflow" AS ENUM ('NHAP', 'DANG_AP_DUNG', 'DA_LUU_TRU');

-- CreateEnum
CREATE TYPE "TrangThaiHoaDon" AS ENUM ('CHO_PHAT_HANH', 'DA_PHAT_HANH', 'LOI');

-- CreateTable
CREATE TABLE "tenant" (
    "id" UUID NOT NULL,
    "ten" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "noi_lam_viec" (
    "id" UUID NOT NULL,
    "ten" TEXT NOT NULL,
    "dia_chi" TEXT,
    "trang_thai" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "noi_lam_viec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhan_vien" (
    "id" UUID NOT NULL,
    "ma_nhan_vien" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "vai_tro" "VaiTro"[],
    "mat_khau_hash" TEXT NOT NULL,
    "trang_thai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT NOT NULL,
    "last_login" TIMESTAMP(3),
    "noi_lam_viec_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhan_vien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khach_hang" (
    "id" UUID NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "so_cccd" TEXT,
    "ngay_sinh" DATE,
    "dia_chi_thuong_tru" TEXT,
    "dia_chi_lien_lac" TEXT,
    "so_dien_thoai" TEXT,
    "email" TEXT,
    "ocr_source" "OcrSource",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "khach_hang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ho_so" (
    "id" UUID NOT NULL,
    "loai_ho_so" "LoaiHoSo" NOT NULL,
    "so_cong_chung" TEXT,
    "so_chung_thuc" TEXT,
    "so_sao_y" TEXT,
    "trang_thai" "TrangThaiHoSo" NOT NULL DEFAULT 'NHAP_LIEU',
    "tknv_id" UUID NOT NULL,
    "ccv_id" UUID,
    "khach_hang_id" UUID,
    "ngay_tao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cong_chung_thuc_te" DATE,
    "no_ho_so" BOOLEAN NOT NULL DEFAULT false,
    "no_tien_thu" BOOLEAN NOT NULL DEFAULT false,
    "phi_dich_vu" DECIMAL(15,0) NOT NULL,
    "so_tien_thuc_thu" DECIMAL(15,0),
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hoa_don_id" UUID,

    CONSTRAINT "ho_so_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_scan" (
    "id" UUID NOT NULL,
    "ho_so_id" UUID,
    "loai_file" "LoaiFile" NOT NULL,
    "ten_file" TEXT NOT NULL,
    "duong_dan" TEXT NOT NULL,
    "dung_luong_kb" INTEGER NOT NULL,
    "dinh_dang" TEXT NOT NULL DEFAULT 'PDF',
    "do_phan_giai_dpi" INTEGER,
    "trang_thai_cmc" "TrangThaiCmc" NOT NULL DEFAULT 'CHO_DAY',
    "so_lan_retry" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kho_vat_ly" (
    "id" UUID NOT NULL,
    "phong_kho" TEXT NOT NULL,
    "day_ke" TEXT NOT NULL,
    "tang_ke" TEXT NOT NULL,
    "hop_cap_so" TEXT NOT NULL,
    "ho_so_id" UUID,

    CONSTRAINT "kho_vat_ly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "so_cong_chung" (
    "so_cc" TEXT NOT NULL,
    "nam" INTEGER NOT NULL,
    "thu_tu" INTEGER NOT NULL,
    "trang_thai" "TrangThaiSoCC" NOT NULL DEFAULT 'HOAT_DONG',
    "so_thay_the" TEXT,
    "ngay_cap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ho_so_id" UUID NOT NULL,

    CONSTRAINT "so_cong_chung_pkey" PRIMARY KEY ("so_cc")
);

-- CreateTable
CREATE TABLE "yeu_cau_hieu_chinh" (
    "id" UUID NOT NULL,
    "ho_so_id" UUID NOT NULL,
    "loai" "LoaiHieuChinh" NOT NULL,
    "gia_tri_cu" TEXT,
    "gia_tri_moi" TEXT,
    "ly_do" TEXT NOT NULL,
    "nguoi_gui_id" UUID NOT NULL,
    "nguoi_duyet_id" UUID,
    "trang_thai" "TrangThaiYeuCau" NOT NULL DEFAULT 'CHO_DUYET',
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yeu_cau_hieu_chinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhat_ky_thao_tac" (
    "id" UUID NOT NULL,
    "thoi_gian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoi_thuc_hien_id" UUID NOT NULL,
    "loai_thao_tac" TEXT NOT NULL,
    "doi_tuong" TEXT NOT NULL,
    "gia_tri_cu" TEXT,
    "gia_tri_moi" TEXT,
    "token_su_dung" TEXT,
    "ip_thiet_bi" TEXT,
    "ket_qua" "KetQuaAudit" NOT NULL,
    "ma_bam" TEXT NOT NULL,

    CONSTRAINT "nhat_ky_thao_tac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uy_thac" (
    "id" UUID NOT NULL,
    "nguoi_duoc_uy_thac_id" UUID NOT NULL,
    "ccv_chu_token_id" UUID NOT NULL,
    "pham_vi" JSONB NOT NULL,
    "thoi_han" DATE NOT NULL,
    "trang_thai" "TrangThaiUyThac" NOT NULL DEFAULT 'CON_HIEU_LUC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uy_thac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luong_nghiep_vu" (
    "id" UUID NOT NULL,
    "ten" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "phien_ban" INTEGER NOT NULL DEFAULT 1,
    "trang_thai" "TrangThaiWorkflow" NOT NULL DEFAULT 'NHAP',
    "danh_sach_buoc" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "luong_nghiep_vu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bieu_mau" (
    "id" UUID NOT NULL,
    "ten" TEXT NOT NULL,
    "nhom" TEXT,
    "loai" TEXT,
    "builtin" BOOLEAN NOT NULL DEFAULT false,
    "noi_dung" JSONB NOT NULL,
    "tao_boi_id" UUID,
    "ten_file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bieu_mau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hoa_don" (
    "id" UUID NOT NULL,
    "ten_khach" TEXT NOT NULL,
    "dia_chi" TEXT,
    "ma_so_thue" TEXT,
    "tong_tien" DECIMAL(15,0) NOT NULL,
    "ngay_giao_dich" DATE NOT NULL,
    "ngay_xuat" DATE NOT NULL,
    "trang_thai" "TrangThaiHoaDon" NOT NULL DEFAULT 'CHO_PHAT_HANH',
    "loi_chi_tiet" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hoa_don_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nhan_vien_ma_nhan_vien_key" ON "nhan_vien"("ma_nhan_vien");

-- CreateIndex
CREATE UNIQUE INDEX "nhan_vien_email_key" ON "nhan_vien"("email");

-- CreateIndex
CREATE UNIQUE INDEX "khach_hang_so_cccd_key" ON "khach_hang"("so_cccd");

-- CreateIndex
CREATE UNIQUE INDEX "ho_so_so_cong_chung_key" ON "ho_so"("so_cong_chung");

-- CreateIndex
CREATE UNIQUE INDEX "ho_so_so_chung_thuc_key" ON "ho_so"("so_chung_thuc");

-- CreateIndex
CREATE UNIQUE INDEX "ho_so_so_sao_y_key" ON "ho_so"("so_sao_y");

-- CreateIndex
CREATE UNIQUE INDEX "kho_vat_ly_phong_kho_day_ke_tang_ke_hop_cap_so_key" ON "kho_vat_ly"("phong_kho", "day_ke", "tang_ke", "hop_cap_so");

-- CreateIndex
CREATE UNIQUE INDEX "so_cong_chung_nam_thu_tu_key" ON "so_cong_chung"("nam", "thu_tu");

-- CreateIndex
CREATE UNIQUE INDEX "nhat_ky_thao_tac_ma_bam_key" ON "nhat_ky_thao_tac"("ma_bam");

-- AddForeignKey
ALTER TABLE "nhan_vien" ADD CONSTRAINT "nhan_vien_noi_lam_viec_id_fkey" FOREIGN KEY ("noi_lam_viec_id") REFERENCES "noi_lam_viec"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_tknv_id_fkey" FOREIGN KEY ("tknv_id") REFERENCES "nhan_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_ccv_id_fkey" FOREIGN KEY ("ccv_id") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_khach_hang_id_fkey" FOREIGN KEY ("khach_hang_id") REFERENCES "khach_hang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nhan_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_hoa_don_id_fkey" FOREIGN KEY ("hoa_don_id") REFERENCES "hoa_don"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_scan" ADD CONSTRAINT "file_scan_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kho_vat_ly" ADD CONSTRAINT "kho_vat_ly_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_cong_chung" ADD CONSTRAINT "so_cong_chung_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_hieu_chinh" ADD CONSTRAINT "yeu_cau_hieu_chinh_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_hieu_chinh" ADD CONSTRAINT "yeu_cau_hieu_chinh_nguoi_gui_id_fkey" FOREIGN KEY ("nguoi_gui_id") REFERENCES "nhan_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yeu_cau_hieu_chinh" ADD CONSTRAINT "yeu_cau_hieu_chinh_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_thao_tac" ADD CONSTRAINT "nhat_ky_thao_tac_nguoi_thuc_hien_id_fkey" FOREIGN KEY ("nguoi_thuc_hien_id") REFERENCES "nhan_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uy_thac" ADD CONSTRAINT "uy_thac_nguoi_duoc_uy_thac_id_fkey" FOREIGN KEY ("nguoi_duoc_uy_thac_id") REFERENCES "nhan_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uy_thac" ADD CONSTRAINT "uy_thac_ccv_chu_token_id_fkey" FOREIGN KEY ("ccv_chu_token_id") REFERENCES "nhan_vien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luong_nghiep_vu" ADD CONSTRAINT "luong_nghiep_vu_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bieu_mau" ADD CONSTRAINT "bieu_mau_tao_boi_id_fkey" FOREIGN KEY ("tao_boi_id") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
