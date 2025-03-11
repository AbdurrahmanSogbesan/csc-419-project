/*
  Warnings:

  - The `category` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `fineStatus` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `position` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "copiesBorrowed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "pages" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fineStatus";

-- CreateTable
CREATE TABLE "Fine" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "bookId" BIGINT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "FineStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fine_uuid_key" ON "Fine"("uuid");

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
