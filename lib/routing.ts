import type { NewHire, Recipient } from "./types";

export class AmbiguousEntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AmbiguousEntityError";
  }
}

export function route(hire: NewHire, recipients: Recipient[]): Recipient {
  const entity = hire.legalEntity.toLowerCase();
  const matches = recipients.filter((r) => r.matchTokens.some((tok) => entity.includes(tok)));

  if (matches.length === 1) return matches[0];
  if (matches.length === 0) {
    throw new AmbiguousEntityError(
      `Legal entity "${hire.legalEntity}" matched no known country. Resolve before drafting.`
    );
  }
  throw new AmbiguousEntityError(
    `Legal entity "${hire.legalEntity}" matched multiple firms (${matches.map((m) => m.firm).join(", ")}). Resolve before drafting.`
  );
}
