import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface WebhookPayload {
  event: "payment.approved" | "payment.cancelled" | "subscription.cancelled" | "subscription.renewed";
  user_id: string;
  plan?: string;
  payment_provider?: string;
  payment_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify webhook secret if configured
    if (webhookSecret) {
      const authHeader = req.headers.get("x-webhook-secret");
      if (authHeader !== webhookSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload: WebhookPayload = await req.json();

    if (!payload.event || !payload.user_id) {
      return new Response(JSON.stringify({ error: "Missing event or user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (payload.event) {
      case "payment.approved":
        updateData = {
          ...updateData,
          status: "active",
          plan: payload.plan || "pro",
          payment_provider: payload.payment_provider || null,
          payment_id: payload.payment_id || null,
        };
        break;

      case "subscription.renewed":
        updateData = {
          ...updateData,
          status: "active",
          payment_id: payload.payment_id || null,
        };
        break;

      case "payment.cancelled":
      case "subscription.cancelled":
        updateData = {
          ...updateData,
          status: "cancelled",
        };
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown event: ${payload.event}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const { error } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", payload.user_id);

    if (error) {
      console.error("Error updating subscription:", error);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Subscription updated: ${payload.event} for user ${payload.user_id}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
