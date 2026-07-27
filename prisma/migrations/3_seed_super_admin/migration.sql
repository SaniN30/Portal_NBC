-- Bootstrap the first super_admin so someone can assign roles from day one.
-- Upsert: works whether or not the account has logged in yet.
INSERT INTO "User" ("id", "email", "role", "emailVerified", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'neevbridgeconsultancy@gmail.com', 'super_admin', false, now(), now())
ON CONFLICT ("email") DO UPDATE SET "role" = 'super_admin';
