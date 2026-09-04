// Plain-text logger per AGENTS.md logging convention: human-readable
// "[LEVEL] message" records emitted via the matching console method.
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function emit(level: LogLevel, message: string): void {
  const line = `[${level}] ${message}`;
  switch (level) {
    case 'DEBUG':
      console.debug(line);
      break;
    case 'INFO':
      console.info(line);
      break;
    case 'WARN':
      console.warn(line);
      break;
    case 'ERROR':
      console.error(line);
      break;
  }
}

export const log = {
  debug: (message: string): void => emit('DEBUG', message),
  info: (message: string): void => emit('INFO', message),
  warn: (message: string): void => emit('WARN', message),
  error: (message: string): void => emit('ERROR', message),
};
