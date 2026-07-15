-- AlterTable
ALTER TABLE "bieu_mau" ADD COLUMN     "phi_mac_dinh" DECIMAL(15,0);

-- CreateTable
CREATE TABLE "_BieuMauToHoSo" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BieuMauToHoSo_AB_unique" ON "_BieuMauToHoSo"("A", "B");

-- CreateIndex
CREATE INDEX "_BieuMauToHoSo_B_index" ON "_BieuMauToHoSo"("B");

-- AddForeignKey
ALTER TABLE "_BieuMauToHoSo" ADD CONSTRAINT "_BieuMauToHoSo_A_fkey" FOREIGN KEY ("A") REFERENCES "bieu_mau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BieuMauToHoSo" ADD CONSTRAINT "_BieuMauToHoSo_B_fkey" FOREIGN KEY ("B") REFERENCES "ho_so"("id") ON DELETE CASCADE ON UPDATE CASCADE;
