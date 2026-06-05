interface CalendarEventPayload {
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  organizer?: { email: string; displayName?: string };
  status?: string;
  description?: string;
}

const formatDateTime = (iso: string, allDay?: boolean): string => {
  const d = new Date(iso);
  return allDay ? d.toLocaleDateString() : d.toLocaleString();
};

const base = (payload: CalendarEventPayload): string => {
  const organizer = payload.organizer?.displayName ?? payload.organizer?.email;
  const location = payload.location ? ` at ${payload.location}` : '';
  const org = organizer ? ` (organized by ${organizer})` : '';
  return `"${payload.title}" on ${formatDateTime(payload.start, payload.allDay)}${location}${org}`;
};

export const normalizeCalendarEventCreated = (payload: CalendarEventPayload): string =>
  `Calendar event created: ${base(payload)}`;

export const normalizeCalendarEventUpdated = (payload: CalendarEventPayload): string =>
  `Calendar event updated: ${base(payload)}`;

export const normalizeCalendarEventDeleted = (payload: CalendarEventPayload): string =>
  `Calendar event deleted: "${payload.title}" on ${formatDateTime(payload.start, payload.allDay)}`;
