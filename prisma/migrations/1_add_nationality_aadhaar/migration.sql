-- AlterTable: add nationality + Aadhaar verification fields to User
ALTER TABLE "User" ADD COLUMN "nationality" TEXT;
ALTER TABLE "User" ADD COLUMN "aadhaarBlobUrl" TEXT;
