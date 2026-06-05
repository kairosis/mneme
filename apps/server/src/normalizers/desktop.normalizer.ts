interface AppPayload { appName: string; bundleId?: string; }
interface IdlePayload { idleSeconds?: number; }
interface BatteryPayload { charging: boolean; }

export const normalizeAppActivated = (payload: AppPayload): string =>
  `Switched to app "${payload.appName}"${payload.bundleId ? ` (${payload.bundleId})` : ''}`;

export const normalizeScreenLocked = (_payload: Record<string, unknown>): string =>
  'Screen locked';

export const normalizeScreenUnlocked = (_payload: Record<string, unknown>): string =>
  'Screen unlocked';

export const normalizeIdleStarted = (payload: IdlePayload): string =>
  `Idle started${payload.idleSeconds !== undefined ? ` after ${payload.idleSeconds}s` : ''}`;

export const normalizeIdleEnded = (_payload: Record<string, unknown>): string =>
  'Idle ended — activity resumed';

export const normalizeBatteryChanged = (payload: BatteryPayload): string =>
  payload.charging ? 'Device plugged in and charging' : 'Device unplugged, running on battery';
