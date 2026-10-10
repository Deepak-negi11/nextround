-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "enrollmentNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_enrollmentNo_key" ON "Student"("enrollmentNo");

