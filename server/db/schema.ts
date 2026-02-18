import { sqliteTable, text, integer, index, } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
};

export const chats = sqliteTable(
  "chats",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    title: text("title"),
    ...timestamps,
  },
  (table) => ([
    index("idx_chats_user_id").on(table.userId),
  ])
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    chatId: text("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["user", "assistant", "system"],
    }).notNull(),
    content: text("content").notNull(),
    ...timestamps,
  },
  (table) => ([
    index("idx_messages_chat_id").on(table.chatId),
  ])
);

export const config = sqliteTable("config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  ...timestamps,
});
