/*
  Warnings:

  - The values [PICKUP_AVAILABLE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('RESERVATION_AVAILABLE', 'BOOK_DUE_SOON', 'BOOK_OVERDUE', 'FINE_ISSUED', 'FINE_PAYMENT_REMINDER', 'SYSTEM_ANNOUNCEMENT', 'BOOK_PICKED_UP', 'BOOK_RESERVED', 'BOOK_RETURNED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;
