export interface NewHire {
  name: string;
  workEmail: string;
  compensation: string;
  supervisor: string;
  startDate: string;
  legalEntity: string;
  stage: string;
  endDate?: string | null;
  workArrangement?: string | null;
  bonus?: string | null;
  commission?: string | null;
  workplaceLocation?: string | null;
  missingFields: string[];
}

export interface Recipient {
  name: string;
  firm: string;
  email: string;
  matchTokens: string[];
}

export interface Email {
  to: string;
  subject: string;
  body: string;
  realRecipientFirm: string;
}

export interface DraftResult {
  hire: NewHire;
  email: Email;
  draftId: string;
}
