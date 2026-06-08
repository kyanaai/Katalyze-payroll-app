import type { Recipient } from "./types";

export function loadRecipients(): Recipient[] {
  return [
    {
      name: "Peachy",
      firm: "SR Brooks",
      email: process.env.US_PAYROLL_EMAIL ?? "pbryant@srbrooks.com",
      matchTokens: ["united states", "u.s.", " us", "- us", "usa"],
    },
    {
      name: "Sherilee",
      firm: "BrightIron",
      email: process.env.CA_PAYROLL_EMAIL ?? "sherilee.vlooswyk@brightiron.com",
      matchTokens: ["canada", "canadian"],
    },
  ];
}

export function demoRedirectEmail(): string | null {
  return process.env.DEMO_REDIRECT_EMAIL ?? null;
}
