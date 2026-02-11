import { useState, useRef, useEffect } from "react";
import { Moon, Send, ArrowLeft, Plus, Loader2, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sleep-chat`;

async function streamChat({
  messages,
  token,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  token: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (resp.status === 429) {
    toast.error("Too many messages — please wait a moment and try again.");
    onDone();
    return;
  }
  if (resp.status === 402) {
    toast.error("Service temporarily unavailable. Please try again later.");
    onDone();
    return;
  }
  if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

interface Conversation {
  id: string;
  title: string | null;
  updated_at: string;
}

const SleepChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load most recent conversation on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (conv) {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from("messages")
          .select("role, content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });
        if (msgs) {
          setMessages(msgs.filter((m: any) => m.role !== "system") as Msg[]);
        }
      }
      setLoadingHistory(false);
    };
    load();
  }, [user]);

  // Load conversation list for sidebar
  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    setConversations((data || []) as Conversation[]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConversation = async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "Sleep Chat" })
      .select("id")
      .single();
    if (error || !data) {
      console.error("Failed to create conversation:", error);
      return null;
    }
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowSidebar(false);
  };

  const switchConversation = async (convId: string) => {
    setLoadingHistory(true);
    setConversationId(convId);
    const { data: msgs } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(msgs ? (msgs.filter((m: any) => m.role !== "system") as Msg[]) : []);
    setLoadingHistory(false);
    setShowSidebar(false);
  };

  const deleteConversation = async (convId: string) => {
    await supabase.from("conversations").delete().eq("id", convId);
    if (convId === conversationId) {
      startNewConversation();
    }
    loadConversations();
    toast.success("Conversation deleted");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading || text.length > 2000) {
      if (text.length > 2000) toast.error("Message too long (max 2000 characters)");
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let convId = conversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        toast.error("Failed to start conversation");
        setIsLoading(false);
        return;
      }
      setConversationId(convId);
    }

    await saveMessage(convId, "user", text);
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const contextMessages = [...messages, userMsg].slice(-10);
      await streamChat({
        messages: contextMessages,
        token,
        onDelta: upsert,
        onDone: async () => {
          setIsLoading(false);
          if (assistantSoFar && convId) {
            await saveMessage(convId, "assistant", assistantSoFar);
          }
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-foreground">Silvery's Sleep Guide</p>
                <p className="text-xs text-muted-foreground">Your friendly sleep companion</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setShowSidebar(!showSidebar); loadConversations(); }}
              title="Conversations"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={startNewConversation}
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
              <Button onClick={startNewConversation} className="w-full rounded-xl" size="sm">
                <Plus className="w-4 h-4 mr-2" /> New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer ${c.id === conversationId ? "bg-muted" : ""}`}
                >
                  <button
                    onClick={() => switchConversation(c.id)}
                    className="flex-1 text-left text-sm text-foreground truncate"
                  >
                    {c.title || "Untitled"}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
              )}
            </div>
          </div>
          <div className="flex-1 bg-background/50" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto py-4">
        <div className="section-container space-y-4">
          {loadingHistory ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Moon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground">Hi there! 🌙</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm Silvery's Sleep Guide. Ask me about sleep tips, bedding care, cooling solutions for hot sleepers, or anything to help you rest better.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {["How can I fall asleep faster?", "Best sheets for hot sleepers?", "Tips for a bedtime routine"].map(
                  (q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-sm px-4 py-2 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      {q}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : null}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-card"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none text-foreground [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <div className="bg-background/80 backdrop-blur-md border-t border-border/50 py-3 pb-[env(safe-area-inset-bottom,12px)]">
        <div className="section-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sleep, bedding, or routines..."
              maxLength={2000}
              className="flex-1 bg-muted border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl px-4 bg-primary text-primary-foreground hover:bg-primary/90"
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
