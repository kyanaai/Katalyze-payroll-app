import type { Email, NewHire, Recipient } from "./types";

const UNSPECIFIED = "Not specified — confirm with hiring team";

function locationLine(hire: NewHire): string {
  if (hire.workplaceLocation) return hire.workplaceLocation;
  const arrangement = hire.workArrangement ?? "arrangement not on file";
  return `${hire.legalEntity} (${arrangement}) — inferred, no explicit location on file`;
}

export function composeEmail(hire: NewHire, recipient: Recipient, demoRedirect: string | null): Email {
  const to = demoRedirect ?? recipient.email;

  const lines = [
    `Hi ${recipient.name},`,
    "",
    `Please set up the following new hire on payroll for ${hire.legalEntity}.`,
    "",
    `  Name:               ${hire.name}`,
    `  Work email:         ${hire.workEmail}`,
    `  Wage / salary:      ${hire.compensation}`,
    `  Bonus:              ${hire.bonus ?? UNSPECIFIED}`,
    `  Commission:         ${hire.commission ?? UNSPECIFIED}`,
    `  Workplace location: ${locationLine(hire)}`,
    `  Supervisor:         ${hire.supervisor}`,
    `  Start date:         ${hire.startDate}`,
  ];

  if (hire.endDate) lines.push(`  End date:           ${hire.endDate}`);

  if (hire.missingFields.length > 0) {
    const items = hire.missingFields.map((f) => f.toLowerCase());
    const readable =
      items.length === 1 ? items[0] : items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
    const verb = items.length === 1 ? "is" : "are";
    lines.push("", `Note: ${readable} ${verb} not yet confirmed on our end; I'll follow up once finalized.`);
  }

  lines.push("", "Please let me know if you need anything else to complete setup.", "", "Thanks,", "[Your name]");

  let body = lines.join("\n");
  if (demoRedirect) {
    body = `[DEMO MODE — this draft would normally go to ${recipient.name} at ${recipient.firm} (${recipient.email})]\n\n${body}`;
  }

  return {
    to,
    subject: `New hire payroll setup — ${hire.name}, start date ${hire.startDate}`,
    body,
    realRecipientFirm: recipient.firm,
  };
}
