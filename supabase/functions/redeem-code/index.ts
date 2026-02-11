import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token for auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Please enter a valid code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS for code operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if code exists and is not redeemed
    const { data: codeData, error: codeError } = await adminClient
      .from("claim_codes")
      .select("*")
      .eq("code", code.trim())
      .maybeSingle();

    if (codeError || !codeData) {
      return new Response(JSON.stringify({ error: "Invalid code. Please check and try again." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (codeData.is_redeemed) {
      return new Response(JSON.stringify({ error: "This code has already been redeemed." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has an active entitlement
    const { data: existingEnt } = await adminClient
      .from("entitlements")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (existingEnt && existingEnt.type === "LIFETIME_SILVERY_CUSTOMER") {
      return new Response(JSON.stringify({ error: "You already have lifetime access!" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark code as redeemed
    await adminClient
      .from("claim_codes")
      .update({ is_redeemed: true, redeemed_by: user.id, redeemed_at: new Date().toISOString() })
      .eq("code", code.trim());

    // Grant lifetime entitlement
    await adminClient.from("entitlements").insert({
      user_id: user.id,
      type: "LIFETIME_SILVERY_CUSTOMER",
      active: true,
      source: "claim_code",
      expires_at: null,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Lifetime access granted! Welcome to Silvery." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("redeem-code error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
