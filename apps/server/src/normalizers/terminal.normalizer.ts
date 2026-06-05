interface CommandPayload { command: string; cwd?: string; exitCode?: number; user?: string; hostname?: string; }
interface DirectoryPayload { cwd: string; hostname?: string; user?: string; }

export const normalizeCommandExecuted = (payload: CommandPayload): string => {
  const exit = payload.exitCode !== undefined ? ` (exit ${payload.exitCode})` : '';
  const dir = payload.cwd ? ` in ${payload.cwd}` : '';
  return `Terminal command executed${dir}: \`${payload.command}\`${exit}`;
};

export const normalizeDirectoryChanged = (payload: DirectoryPayload): string =>
  `Changed directory to ${payload.cwd}`;
