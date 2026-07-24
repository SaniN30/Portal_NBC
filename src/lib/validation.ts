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
