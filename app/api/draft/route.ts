import { NextRequest, NextResponse } from "next/server";
import { demoRedirectEmail, loadRecipients } from "@/lib/config";
import { composeEmail } from "@/lib/compose";
import { gmailCreateDraft } from "@/lib/gmail";
import { notionFetch } from "@/lib/notion";
import { parseNewHire } from "@/lib/parse";
import { AmbiguousEntityError, route } from "@/lib/routing";

export async function POST(req: NextRequest) {
  let notionUrl: string;
  try {
    const body = await req.json();
    notionUrl = body.notionUrl?.trim();
    if (!notionUrl) throw new Error("notionUrl is required");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const props = await notionFetch(notionUrl);
    const hire = parseNewHire(props);

    if (hire.stage.trim().toLowerCase() !== "accepted") {
      return NextResponse.json(
        {
          error: `Stage is "${hire.stage}", not "Accepted". Confirm before preparing payroll.`,
          stage: hire.stage,
          hire: { name: hire.name },
        },
        { status: 422 }
      );
    }

    const recipients = loadRecipients();
    const recipient = route(hire, recipients);
    const email = composeEmail(hire, recipient, demoRedirectEmail());
    const draftId = await gmailCreateDraft(email.to, email.subject, email.body);

    return NextResponse.json({
      hire: {
        name: hire.name,
        legalEntity: hire.legalEntity,
        startDate: hire.startDate,
        missingFields: hire.missingFields,
      },
      email: {
        to: email.to,
        subject: email.subject,
        body: email.body,
        realRecipientFirm: email.realRecipientFirm,
      },
      draftUrl: draftId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof AmbiguousEntityError ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
