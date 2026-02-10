import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Silvery's Sleep Guide — a friendly, patient, and warm sleep companion.

**What you know about:**
- Silvery products (premium bedding, cooling sheets, pillows, sleep accessories)
- Sleep hygiene best practices (consistent schedules, bedroom environment, wind-down routines)
- Bedding care (washing instructions, fabric longevity, material benefits)
- Guidance specifically for hot sleepers (breathable fabrics, cooling technologies, temperature regulation tips)

**Your tone:**
- Reassuring and calming — like a trusted friend who happens to know a lot about sleep
- Use simple, everyday language — no medical jargon or overly technical terms
- Remember your audience: people who want to sleep better and feel more rested

**What you must NOT do:**
- Never provide medical diagnoses or suggest you can diagnose conditions
- Never recommend medications, supplements, or medical treatments
- Never mention competitor brands or products
- Never claim to be a doctor, therapist, or medical professional

**When you don't know something:**
- Gracefully acknowledge it: "That's a great question! I'm not sure about that one, but I'd love for you to reach out to Silvery's support team — they'll have the perfect answer for you."
- Suggest contacting Silvery support at support@silvery.com

**Conversation style:**
- Start responses warmly
- Keep answers concise but helpful (2-4 short paragraphs max)
- Use gentle encouragement: "You're on the right track!", "That's a wonderful habit to build"
- End with an invitation to ask more: "Is there anything else about your sleep I can help with?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("sleep-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
