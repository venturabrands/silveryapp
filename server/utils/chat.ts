import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { chats, messages, config } from "../db/schema";
import { DEFAULT_SYSTEM_PROMPT, CHAT_TITLE_MAX_LENGTH, CHAT_TITLE_TRUNCATE_LENGTH } from "../constants/chat";
import type { RequestMessage } from "../types/chat";

export function extractTextFromMessage(message: RequestMessage): string | null {
  if (typeof message.content === "string" && message.content) {
    return message.content;
  }

  const textFromParts = (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");

  return textFromParts || null;
}

export function buildChatTitle(content: string): string {
  if (content.length <= CHAT_TITLE_MAX_LENGTH) return content;
  return content.slice(0, CHAT_TITLE_TRUNCATE_LENGTH) + "…";
}

export async function fetchSystemPrompt(db: DrizzleD1Database): Promise<string> {
  const row = await db.select().from(config).where(eq(config.key, "system_prompt")).get();
  return row?.value ?? DEFAULT_SYSTEM_PROMPT;
}

export async function ensureChatExists(db: DrizzleD1Database, chatId: string, userId: string): Promise<void> {
  await db.insert(chats).values({ id: chatId, userId }).onConflictDoNothing();
}

export async function createChat(db: DrizzleD1Database, userId: string): Promise<string> {
  const [chat] = await db.insert(chats).values({ userId }).returning();
  return chat.id;
}

export async function saveUserMessage(
  db: DrizzleD1Database,
  chatId: string,
  userMessages: RequestMessage[],
): Promise<void> {
  const lastUserMessage = userMessages.at(-1);
  if (!lastUserMessage) return;

  const content = extractTextFromMessage(lastUserMessage);
  if (!content) return;

  await db.insert(messages).values({ chatId, role: "user", content });

  if (userMessages.length === 1) {
    await db.update(chats).set({ title: buildChatTitle(content) }).where(eq(chats.id, chatId));
  }
}
