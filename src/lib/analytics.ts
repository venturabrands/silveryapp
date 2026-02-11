import { supabase } from "@/integrations/supabase/client";

type EventName = 
  | "login"
  | "signup"
  | "message_sent"
  | "conversation_created"
  | "conversation_deleted"
  | "error_shown"
  | "pwa_install_prompted"
  | "pwa_installed"
  | "page_view";

export async function trackEvent(
  userId: string | undefined,
  eventName: EventName,
  metadata?: Record<string, unknown>
) {
  if (!userId) return;
  try {
    await supabase.from("analytics_events" as any).insert({
      user_id: userId,
      event_name: eventName,
      metadata: metadata || {},
    } as any);
  } catch (e) {
    // Silently fail — analytics should never break the app
    console.warn("Analytics event failed:", e);
  }
}
