import { useState, useRef, useEffect } from "react";
import { Moon, Send, ArrowLeft, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlement } from "@/hooks/useEntitlement";
import Paywall from "@/components/Paywall";

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
  if (resp.status === 403) {
    toast.error("You've used your free preview. Enter a Silvery code for full access.");
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

  // Final flush
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

const SleepChat = () => {
  const { user } = useAuth();
  const { entitled, loading: entitlementLoading } = useEntitlement();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [freeUsed, setFreeUsed] = useState<number>(0);
  const [previewExhausted, setPreviewExhausted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const FREE_MESSAGE_LIMIT = 1;

  // Load free message count and conversation history
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Load free_messages_used from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("free_messages_used")
        .eq("user_id", user.id)
        .maybeSingle();

      const used = profile?.free_messages_used ?? 0;
      setFreeUsed(used);

      if (!entitled && used >= FREE_MESSAGE_LIMIT) {
        setPreviewExhausted(true);
        setLoadingHistory(false);
        return;
      }

      // Load most recent conversation
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
  }, [user, entitled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show loading while checking entitlement
  if (entitlementLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show paywall if preview exhausted and not entitled
  if (!entitled && previewExhausted) {
    return <Paywall />;
  }

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
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading || text.length > 2000) {
      if (text.length > 2000) toast.error("Message too long (max 2000 characters)");
      return;
    }

    // Check free message limit for non-entitled users
    if (!entitled && freeUsed >= FREE_MESSAGE_LIMIT) {
      setPreviewExhausted(true);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Ensure conversation exists
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

    // Save user message
    await saveMessage(convId, "user", text);

    // Increment free_messages_used for non-entitled users
    if (!entitled) {
      const newCount = freeUsed + 1;
      setFreeUsed(newCount);
      await supabase
        .from("profiles")
        .update({ free_messages_used: newCount })
        .eq("user_id", user!.id);

      if (newCount >= FREE_MESSAGE_LIMIT) {
        // Will show paywall after this message completes
      }
    }

    // Update conversation timestamp
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
      // Send last 10 messages for context
      const contextMessages = [...messages, userMsg].slice(-10);
      await streamChat({
        messages: contextMessages,
        token,
        onDelta: upsert,
        onDone: async () => {
          setIsLoading(false);
          // Save assistant message
          if (assistantSoFar && convId) {
            await saveMessage(convId, "assistant", assistantSoFar);
          }
          // After response, if free limit reached, show paywall
          if (!entitled && freeUsed + 1 >= FREE_MESSAGE_LIMIT) {
            setPreviewExhausted(true);
          }
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const showPreviewBanner = !entitled && freeUsed < FREE_MESSAGE_LIMIT;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="section-container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
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
          {entitled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={startNewConversation}
              title="New conversation"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Free preview banner */}
      {showPreviewBanner && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center">
          <p className="text-sm text-foreground">
            🌙 Free preview — you have <strong>{FREE_MESSAGE_LIMIT - freeUsed}</strong> message{FREE_MESSAGE_LIMIT - freeUsed !== 1 ? "s" : ""} remaining.{" "}
            <Link to="/account" className="text-primary underline">Enter your Silvery code</Link> for full access.
          </p>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto py-6">
        <div className="section-container space-y-4">
          {loadingHistory ? (
            <div className="text-center py-12 text-muted-foreground">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 space-y-4">
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
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
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
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/50 py-4">
        <div className="section-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-3"
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
