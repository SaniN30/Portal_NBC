-- Job posting details: engagement duration, hiring timeline, and CTC/package.
-- All optional free-text, mirroring location/engineeringField.
ALTER TABLE "Job" ADD COLUMN "duration" TEXT;
ALTER TABLE "Job" ADD COLUMN "timeline" TEXT;
ALTER TABLE "Job" ADD COLUMN "ctc" TEXT;
