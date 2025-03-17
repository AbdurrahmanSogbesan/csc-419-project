/*
  Warnings:

  - A unique constraint covering the columns `[reservationId]` on the table `BorrowedBook` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Reservation_userId_bookId_key";

-- AlterTable
ALTER TABLE "BorrowedBook" ADD COLUMN     "reservationId" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "BorrowedBook_reservationId_key" ON "BorrowedBook"("reservationId");

-- AddForeignKey
ALTER TABLE "BorrowedBook" ADD CONSTRAINT "BorrowedBook_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
