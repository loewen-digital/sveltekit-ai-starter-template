import { dev } from '$app/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

const minLevel: LogLevel = dev ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
	return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel];
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
	if (dev) {
		const ctx = context ? ` ${JSON.stringify(context)}` : '';
		return `[${level.toUpperCase()}] ${message}${ctx}`;
	}
	return JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...context });
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
	if (!shouldLog(level)) return;
	const formatted = formatMessage(level, message, context);
	switch (level) {
		case 'debug':
			console.debug(formatted);
			break;
		case 'info':
			console.info(formatted);
			break;
		case 'warn':
			console.warn(formatted);
			break;
		case 'error':
			console.error(formatted);
			break;
	}
}

export const logger = {
	debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
	info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
	warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
	error: (message: string, context?: Record<string, unknown>) => log('error', message, context)
};
