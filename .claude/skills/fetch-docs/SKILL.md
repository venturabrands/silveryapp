---
name: fetch-docs
description: When working with TanStack Start, TanStack Router, TanStack Query, Drizzle ORM, or Hono — fetch fresh documentation before answering. Use when the user asks how to use these libraries or when patterns seem uncertain.
allowed-tools: WebFetch, Read
---

# Fresh Documentation Lookup

Before answering questions about these libraries, fetch their llms.txt:

| Library               | URL                                         |
| --------------------- | ------------------------------------------- |
| TanStack Start/Router | https://tanstack.com/router/latest/llms.txt |
| TanStack Query        | https://tanstack.com/query/latest/llms.txt  |
| Drizzle ORM           | https://orm.drizzle.team/llms.txt           |
| Hono                  | https://hono.dev/llms.txt                   |
| Cloudflare            | https://developers.cloudflare.com/llms.txt  |
| AI SDK                | https://ai-sdk.dev/llms.txt                 |
| Better Auth           | https://www.better-auth.com/llms.txt        |
| Shadcn/UI             | https://ui.shadcn.com/llms.txt              |
| Shadcn/UI             | https://ui.shadcn.com/llms.txt              |

Steps:

1. Fetch the relevant `llms.txt`
2. Identify the specific doc pages for the question
3. Fetch those pages
4. Answer using current docs, not training knowledge
5. In case you can't find provided docs try to use Context7 MCP
