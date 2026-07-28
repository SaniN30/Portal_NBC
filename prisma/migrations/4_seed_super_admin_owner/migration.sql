-- Second super_admin: the Resend account owner, the only address that can
-- receive OTP codes while the domain is unverified (test mode). Lets us into
-- /admin now; drop/rotate once a real domain is verified.
INSERT INTO "User" ("id", "email", "role", "emailVerified", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'nautiyalsanidhya30@gmail.com', 'super_admin', false, now(), now())
ON CONFLICT ("email") DO UPDATE SET "role" = 'super_admin';
