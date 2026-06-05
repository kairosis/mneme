interface BrowserPagePayload { url: string; title?: string; }

export const normalizeBrowserPageVisited = (payload: BrowserPagePayload): string =>
  `Visited page${payload.title ? ` "${payload.title}"` : ''}: ${payload.url}`;

export const normalizeBrowserTabActivated = (payload: BrowserPagePayload): string =>
  `Switched to tab${payload.title ? ` "${payload.title}"` : ''}: ${payload.url}`;

export const normalizeBrowserTabOpened = (payload: BrowserPagePayload): string =>
  `Opened new tab${payload.title ? ` "${payload.title}"` : ''}: ${payload.url}`;

export const normalizeBrowserTabClosed = (payload: BrowserPagePayload): string =>
  `Closed tab${payload.title ? ` "${payload.title}"` : ''}: ${payload.url}`;
