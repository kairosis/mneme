interface EmailPayload {
  from?: { name?: string; address: string };
  to?: Array<{ name?: string; address: string }>;
  subject?: string;
  snippet?: string;
  mailbox?: string;
}

const sender = (payload: EmailPayload): string =>
  payload.from?.name ?? payload.from?.address ?? 'unknown';

const recipient = (payload: EmailPayload): string =>
  payload.to?.map((a) => a.name ?? a.address).join(', ') ?? 'unknown';

export const normalizeEmailReceived = (payload: EmailPayload): string => {
  const snippet = payload.snippet ? `: "${payload.snippet}"` : '';
  return `Email received from ${sender(payload)} — "${payload.subject ?? '(no subject)'}"${snippet}`;
};

export const normalizeEmailSent = (payload: EmailPayload): string =>
  `Email sent to ${recipient(payload)} — "${payload.subject ?? '(no subject)'}"`;

export const normalizeEmailRead = (payload: EmailPayload): string =>
  `Email read — "${payload.subject ?? '(no subject)'}" from ${sender(payload)}`;
