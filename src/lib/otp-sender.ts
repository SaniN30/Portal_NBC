// Sends the OTP over the chosen channel. Falls back to console in dev so the
// flow works with no Resend/Twilio account. ponytail: swap in real providers
// by setting the env vars — no code change needed.

export async function sendOtp(channel: "email" | "phone", to: string, code: string): Promise<void> {
  if (channel === "email") return sendEmail(to, code);
  return sendSms(to, code);
}

async function sendEmail(to: string, code: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return devLog("email", to, code);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.OTP_FROM_EMAIL ?? "noreply@neevbridge.example",
      to,
      subject: "Your Neev Bridge login code",
      text: `Your login code is ${code}. It expires in 10 minutes.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

async function sendSms(to: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return devLog("phone", to, code);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: `Your Neev Bridge login code is ${code}` }),
  });
  if (!res.ok) throw new Error(`Twilio failed: ${res.status} ${await res.text()}`);
}

function devLog(channel: string, to: string, code: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`No ${channel} provider configured in production`);
  }
  console.log(`\n[DEV OTP] ${channel} → ${to}: ${code}\n`);
}
