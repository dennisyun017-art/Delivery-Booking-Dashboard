import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Best-effort transactional email. Never throws — a failed notification
 * should not roll back the booking/decision that triggered it. Callers
 * should still wrap calls in try/catch and log, since this also logs.
 */
export async function sendMail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping "${subject}" to ${to}`,
    );
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) console.error("[email] resend returned an error", error);
  } catch (err) {
    console.error("[email] failed to send", err);
  }
}
