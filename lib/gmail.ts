// Gmail API adapter — creates a DRAFT only, never sends.
// Uses a service-account access token or a user OAuth token from GMAIL_ACCESS_TOKEN.

function buildMimeMessage(to: string, subject: string, body: string): string {
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "MIME-Version: 1.0",
    "",
    body,
  ].join("\r\n");

  // base64url encode (URL-safe, no padding)
  return Buffer.from(mime)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function gmailCreateDraft(to: string, subject: string, body: string): Promise<string> {
  const token = process.env.GMAIL_ACCESS_TOKEN;
  if (!token) throw new Error("GMAIL_ACCESS_TOKEN env var is not set.");

  const raw = buildMimeMessage(to, subject, body);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: { raw } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return `https://mail.google.com/mail/#drafts/${data.id}`;
}
