import { supabase } from "@/integrations/supabase/client";

export interface Entitlement {
  id: string;
  user_id: string;
  type: string;
  active: boolean;
  source: string;
  expires_at: string | null;
  created_at: string;
}

export async function getUserEntitlement(userId: string): Promise<Entitlement | null> {
  const { data } = await supabase
    .from("entitlements")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  // Check expiry for subscribers
  if (data.type === "SUBSCRIBER" && data.expires_at) {
    if (new Date(data.expires_at) < new Date()) {
      return null;
    }
  }

  return data as Entitlement;
}

export function hasAccess(entitlement: Entitlement | null): boolean {
  if (!entitlement || !entitlement.active) return false;
  if (entitlement.type === "LIFETIME_SILVERY_CUSTOMER") return true;
  if (entitlement.type === "SUBSCRIBER") {
    if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) return false;
    return true;
  }
  return false;
}
