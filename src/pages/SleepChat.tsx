import { useState, useRef, useEffect } from "react";
import { Moon, Send, Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/lib/userId";

const SERVER_URL = import.meta.env.VITE_SERVER_URL as string;
if (!SERVER_URL) throw new Error("VITE_SERVER_URL is not set — cannot reach AI backend");
const userId = getOrCreateUserId();

const WELCOME_MESSAGE = `Welcome to Silvery Sleep Assistant! I'm here to help you sleep better using science-backed advice and tips tailored just for you. First — what should I call you?`;

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant" as const,
    parts: [{ type: "text" as const, text: WELCOME_MESSAGE }],
    createdAt: new Date(0),
  },
];

interface Chat {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string | number;
  updatedAt: string | number | null;
  deletedAt: string | number | null;
}

interface StoredMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

const SleepChat = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [input, setInput] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isWelcomeGenerating, setIsWelcomeGenerating] = useState(true);
  const chatIdRef = useRef<string | null>(null);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const triggerWelcomeAnimation = () => {
    setIsWelcomeGenerating(true);
    if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
    welcomeTimerRef.current = setTimeout(() => setIsWelcomeGenerating(false), 1500);
  };

  useEffect(() => {
    triggerWelcomeAnimation();
    return () => {
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
    };
  }, []);

  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery<Chat[]>({
    queryKey: ["chats", userId],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}api/chats?userId=${userId}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (chatId: string) => {
      await fetch(`${SERVER_URL}api/chats/${chatId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", userId] });
    },
  });

  // Transport is initialized once; body fn reads chatIdRef dynamically each request
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: `${SERVER_URL}api/chat`,
        body: () => ({ userId, chatId: chatIdRef.current }),
      }),
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
    messages: INITIAL_MESSAGES,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", userId] });
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    chatIdRef.current = null;
    setCurrentChatId(null);
    setShowSidebar(false);
    triggerWelcomeAnimation();
  };

  const loadConversation = async (chatId: string) => {
    const res = await fetch(`${SERVER_URL}api/chats/${chatId}/messages`);
    const stored: StoredMessage[] = await res.json();
    chatIdRef.current = chatId;
    setCurrentChatId(chatId);
    setMessages(
      stored.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
        createdAt: new Date(m.createdAt * 1000),
      })),
    );
    setIsWelcomeGenerating(false);
    setShowSidebar(false);
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-x-hidden pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-foreground">
                  Silvery's Sleep Guide
                </p>
                <p className="text-xs text-muted-foreground">Your friendly sleep companion</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              title="Conversations"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={startNewChat}
              title="New conversation"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conversation sidebar */}
      {showSidebar && (
        <div className="absolute inset-0 z-40 flex">
          <div className="w-72 bg-background border-r border-border/50 flex flex-col h-full pt-14">
            <div className="p-4 border-b border-border/50">
              <Button onClick={startNewChat} className="w-full rounded-xl" size="sm">
                <Plus className="w-4 h-4 mr-2" /> New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer ${
                    conv.id === currentChatId ? "bg-muted/30" : ""
                  }`}
                >
                  <button
                    onClick={() => loadConversation(conv.id)}
                    className="flex-1 text-left text-sm text-foreground truncate"
                  >
                    {conv.title ?? new Date(conv.createdAt).toLocaleDateString()}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(conv.id);
                      if (conv.id === currentChatId) startNewChat();
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 bg-background/50" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto py-4">
        <div className="section-container space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.id === "welcome" && isWelcomeGenerating ? (
                <div className="glass-card rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"
                  }`}
                >
                  {msg.parts.map((part, j) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div key={`${msg.id}-${j}`}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm prose-invert max-w-none text-foreground [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                                <ReactMarkdown>{part.text}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm">{part.text}</p>
                            )}
                          </div>
                        );
                    }
                  })}
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="bg-background/80 backdrop-blur-md border-t border-border/50 py-3 pb-[env(safe-area-inset-bottom,12px)]">
        <div className="section-container pb-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatIdRef.current) {
                const newId = crypto.randomUUID();
                chatIdRef.current = newId;
                setCurrentChatId(newId);
              }
              sendMessage({ text: input });
              setInput("");
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sleep, bedding, or routines..."
              maxLength={2000}
              className="flex-1 h-12 bg-muted border border-border/50 rounded-xl px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SleepChat;
