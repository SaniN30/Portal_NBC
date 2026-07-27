import { z } from "zod";

export const channelSchema = z.enum(["email", "phone"]);

const emailId = z.string().email();
const phoneId = z.string().regex(/^\+?[0-9\s()-]{7,20}$/, "Invalid phone number");

export const requestOtpSchema = z
  .object({ channel: channelSchema, identifier: z.string().min(1) })
  .superRefine((val, ctx) => {
    const check = val.channel === "email" ? emailId : phoneId;
    if (!check.safeParse(val.identifier).success) {
      ctx.addIssue({ code: "custom", path: ["identifier"], message: `Invalid ${val.channel}` });
    }
  });

export const verifyOtpSchema = requestOtpSchema.and(
  z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") }),
);

export const profileSchema = z.object({
  fullName: z.string().min(1).max(120),
  dob: z.coerce.date().max(new Date(), "DOB must be in the past"),
  phone: z.string().regex(/^\+?[0-9\s()-]{7,20}$/).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  nationality: z.string().max(60).optional().or(z.literal("")),
});

export const jobSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  location: z.string().max(120).optional().or(z.literal("")),
  engineeringField: z.string().max(120).optional().or(z.literal("")),
  status: z.enum(["live", "closed"]).default("live"),
});

// super_admin assigns any role by email (candidate demotes back to plain user).
export const assignRoleSchema = z.object({
  email: z.string().email(),
  role: z.enum(["candidate", "recruiter", "hiring_manager", "admin", "super_admin"]),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["applied", "reviewed", "shortlisted", "rejected"]),
});

export const contactSchema = z.object({
  userId: z.string().min(1),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});
