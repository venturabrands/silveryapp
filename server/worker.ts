import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAiGateway } from "ai-gateway-provider";
import { createOpenAI } from "ai-gateway-provider/providers/openai";
import { streamText, convertToModelMessages } from "ai";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc, isNull, and } from "drizzle-orm";
import { chats, messages, config } from "./db/schema";
import type { HonoVariables, RequestMessage } from "./types/chat";
import { fetchSystemPrompt, ensureChatExists, createChat, saveUserMessage } from "./utils/chat";

// --- App ---

const app = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

app.use("*", cors());

app.use("*", async (c, next) => {
  const clientIp = c.req.header("CF-Connecting-IP");
  if (!clientIp) return c.text("Forbidden", 403);

  const { success } = await c.env.RATE_LIMIT.limit({ key: clientIp });
  if (!success) return c.text("Rate limit exceeded", 429);

  await next();
});

app.use("*", async (c, next) => {
  c.set("db", drizzle(c.env.DB));
  await next();
});

// --- Config routes ---

app.get("/api/config/:key", async (c) => {
  const db = c.get("db");
  const key = c.req.param("key");
  const row = await db.select().from(config).where(eq(config.key, key)).get();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ key: row.key, value: row.value });
});

// --- Chat CRUD routes ---

app.post("/api/chats", async (c) => {
  const db = c.get("db");
  const { userId } = await c.req.json<{ userId: string }>();
  const [chat] = await db.insert(chats).values({ userId }).returning();
  return c.json(chat);
});

app.get("/api/chats", async (c) => {
  const db = c.get("db");
  const userId = c.req.query("userId");
  if (!userId) return c.json({ error: "userId required" }, 400);

  const activeChats = await db
    .select()
    .from(chats)
    .where(and(eq(chats.userId, userId), isNull(chats.deletedAt)))
    .orderBy(desc(chats.updatedAt));

  return c.json(activeChats);
});

app.get("/api/chats/:id/messages", async (c) => {
  const db = c.get("db");
  const chatId = c.req.param("id");
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);
  return c.json(rows);
});

app.delete("/api/chats/:id", async (c) => {
  const db = c.get("db");
  const chatId = c.req.param("id");
  await db.update(chats).set({ deletedAt: new Date() }).where(eq(chats.id, chatId));
  return c.json({ success: true });
});

// --- Streaming chat endpoint ---

app.post("/api/chat", async (c) => {
  const db = c.get("db");
  const body = await c.req.json<{
    messages: unknown[];
    chatId?: string;
    userId?: string;
  }>();

  const userId = body.userId ?? "anonymous";
  const requestMessages = body.messages as RequestMessage[];

  let chatId = body.chatId;
  if (chatId) {
    await ensureChatExists(db, chatId, userId);
  } else {
    chatId = await createChat(db, userId);
  }

  const systemPrompt = await fetchSystemPrompt(db);

  const userMessages = requestMessages.filter((m) => m.role === "user");
  await saveUserMessage(db, chatId, userMessages);

  const aiGateway = createAiGateway({
    binding: c.env.AI.gateway(c.env.AI_GATEWAY_ID),
    apiKey: c.env.API_GATEWAY_KEY.get(),
  });
  const openai = createOpenAI();

  const streamResult = streamText({
    model: aiGateway(openai("gpt-4o-mini")),
    system: systemPrompt,
    messages: await convertToModelMessages(
      requestMessages as Parameters<typeof convertToModelMessages>[0],
    ),
    onFinish: async ({ text }) => {
      await db.insert(messages).values({ chatId, role: "assistant", content: text });
      await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));
    },
  });

  const response = streamResult.toUIMessageStreamResponse();
  const headers = new Headers(response.headers);
  headers.set("X-Chat-Id", chatId);
  return new Response(response.body, { status: response.status, headers });
});

export default app;
