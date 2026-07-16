-- CreateTable
CREATE TABLE "thong_bao" (
    "id" UUID NOT NULL,
    "vai_tro" "VaiTro" NOT NULL,
    "tieu_de" TEXT NOT NULL,
    "noi_dung" TEXT,
    "ho_so_id" UUID,
    "da_doc" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thong_bao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "thong_bao" ADD CONSTRAINT "thong_bao_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE SET NULL ON UPDATE CASCADE;
