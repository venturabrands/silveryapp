import type { DrizzleD1Database } from "drizzle-orm/d1";

export type MsgPart = { type: string; text?: string };

export type RequestMessage = {
  role: string;
  content?: unknown;
  parts?: MsgPart[];
};

export type HonoVariables = { db: DrizzleD1Database };
