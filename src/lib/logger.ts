/**
 * Pino structured logger for Aura Living.
 *
 * Phase 14: Replaces scattered console.warn/console.error with structured
 * JSON logging that includes request IDs, timestamps, and log levels.
 *
 * In production: logs as JSON for Vercel log drain / Datadog / Logflare.
 * In development: pretty-prints for readability.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info({ userId, action: "login" }, "User logged in");
 *   logger.error({ error, route: "/api/orders" }, "Order creation failed");
 */

import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  base: {
    service: "aura-living",
    environment: process.env.NODE_ENV || "development",
    ...(isVercel && { region: process.env.VERCEL_REGION }),
  },
  ...(isProduction
    ? {
        // Production: JSON output for log drains
        serializers: {
          err: pino.stdSerializers.err,
          req: (req: unknown) => ({
            method: (req as { method?: string })?.method,
            url: (req as { url?: string })?.url,
          }),
        },
      }
    : {
        // Development: pretty print
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname,service,environment",
          },
        },
      }),
});

export default logger;
