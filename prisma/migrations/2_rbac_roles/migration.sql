-- RBAC: add recruiter / hiring_manager / super_admin roles.
-- Separate migration from the seed below so the new enum values are committed
-- before any row uses them (Postgres rule).
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'recruiter';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'hiring_manager';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'super_admin';
