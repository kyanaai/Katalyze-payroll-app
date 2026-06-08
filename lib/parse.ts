import type { NewHire } from "./types";

function cleanDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (["not applicable", "n/a", "na", "none", ""].includes(trimmed)) return null;
  return value.trim();
}

// Notion property values come back as nested objects. This normalizer pulls
// the plain scalar out of whatever shape Notion returns.
export function normalizeNotionProps(raw: Record<string, unknown>): Record<string, string | null> {
  const out: Record<string, string | null> = {};

  for (const [key, val] of Object.entries(raw)) {
    if (val === null || val === undefined) {
      out[key] = null;
      continue;
    }
    if (typeof val === "string") {
      out[key] = val;
      continue;
    }
    if (typeof val !== "object") {
      out[key] = String(val);
      continue;
    }

    const v = val as Record<string, unknown>;

    // title / rich_text
    if (Array.isArray(v.title)) {
      out[key] = (v.title as Array<{ plain_text: string }>).map((t) => t.plain_text).join("") || null;
    } else if (Array.isArray(v.rich_text)) {
      out[key] = (v.rich_text as Array<{ plain_text: string }>).map((t) => t.plain_text).join("") || null;
    } else if (v.type === "email" || typeof v.email === "string") {
      out[key] = (v.email as string) ?? null;
    } else if (v.type === "select" && v.select && typeof (v.select as Record<string, unknown>).name === "string") {
      out[key] = (v.select as Record<string, string>).name;
    } else if (v.type === "date" || (v.date && typeof v.date === "object")) {
      const d = (v.date ?? v) as Record<string, unknown>;
      out[key] = (d.start as string) ?? null;
      // Also expose date:Key:start for the start-date fallback in parse_new_hire
      out[`date:${key}:start`] = (d.start as string) ?? null;
    } else if (typeof v.number === "number") {
      out[key] = String(v.number);
    } else if (typeof v.checkbox === "boolean") {
      out[key] = String(v.checkbox);
    } else if (v.type === "formula" && v.formula) {
      const f = v.formula as Record<string, unknown>;
      out[key] = f.string != null ? String(f.string) : f.number != null ? String(f.number) : null;
    } else {
      // last resort: JSON so we at least see the shape in errors
      out[key] = JSON.stringify(val);
    }
  }

  return out;
}

export function parseNewHire(props: Record<string, string | null>): NewHire {
  const required = ["Candidate Full Name", "Work Email", "Compensation", "Manager Name", "Legal Entity", "Stage"];
  for (const key of required) {
    if (!props[key]) throw new Error(`Required field missing from Notion row: "${key}"`);
  }

  const startDate = props["date:Start Date:start"] ?? props["Start Date"];
  if (!startDate) throw new Error('Required field missing from Notion row: "Start Date"');

  const missingFields: string[] = [];
  const bonus = props["Bonus"] ?? null;
  const commission = props["Commission"] ?? null;
  const workplaceLocation = props["Workplace Location"] ?? null;
  if (!bonus) missingFields.push("Bonus");
  if (!commission) missingFields.push("Commission");
  if (!workplaceLocation) missingFields.push("Workplace Location");

  return {
    name: props["Candidate Full Name"]!,
    workEmail: props["Work Email"]!,
    compensation: props["Compensation"]!,
    supervisor: props["Manager Name"]!,
    startDate,
    legalEntity: props["Legal Entity"]!,
    stage: props["Stage"]!,
    endDate: cleanDate(props["End Date"]),
    workArrangement: props["Work Arrangement"] ?? null,
    bonus,
    commission,
    workplaceLocation,
    missingFields,
  };
}
