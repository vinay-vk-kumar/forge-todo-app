-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyEmailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastEmailDate" TIMESTAMP(3);
