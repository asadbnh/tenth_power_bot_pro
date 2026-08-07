/**
 * WebTaky Structured Logger & Diagnostic Service
 * Handles unified logging, error reporting, and security alerts across Next.js and Telegram Bot.
 */

type LogLevel = "info" | "warn" | "error" | "security";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  error?: string | Error;
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  formatAndPrint({ level: "info", message, context, timestamp: new Date().toISOString() });
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  formatAndPrint({ level: "warn", message, context, timestamp: new Date().toISOString() });
}

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  const errDetail = error instanceof Error ? error.stack || error.message : String(error);
  formatAndPrint({
    level: "error",
    message,
    error: errDetail,
    context,
    timestamp: new Date().toISOString(),
  });
}

export function logSecurity(message: string, context?: Record<string, unknown>) {
  formatAndPrint({ level: "security", message, context, timestamp: new Date().toISOString() });
}

function formatAndPrint(entry: LogEntry) {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  if (entry.level === "error") {
    console.error(`🚨 ${prefix} ${entry.message}`, entry.context || "", entry.error || "");
  } else if (entry.level === "warn") {
    console.warn(`⚠️ ${prefix} ${entry.message}`, entry.context || "");
  } else if (entry.level === "security") {
    console.warn(`🛡️ ${prefix} ${entry.message}`, entry.context || "");
  } else {
    console.log(`ℹ️ ${prefix} ${entry.message}`, entry.context || "");
  }
}
