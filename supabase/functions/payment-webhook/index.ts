import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");

    // Mercado Pago IPN notification
    if (topic === "payment" || topic === "merchant_order") {
      const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

      if (!dataId) {
        return new Response(JSON.stringify({ error: "Missing data.id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
      if (!mercadoPagoToken) {
        console.error("MERCADO_PAGO_ACCESS_TOKEN not configured");
        return new Response(JSON.stringify({ error: "Server configuration error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (topic === "payment") {
        // Fetch payment details from Mercado Pago
        const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
          headers: { Authorization: `Bearer ${mercadoPagoToken}` },
        });

        if (!paymentRes.ok) {
          console.error("Failed to fetch payment:", await paymentRes.text());
          return new Response(JSON.stringify({ error: "Failed to verify payment" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const payment = await paymentRes.json();
        let externalRef: { user_id: string; plan: string };

        try {
          externalRef = JSON.parse(payment.external_reference);
        } catch {
          console.error("Invalid external_reference:", payment.external_reference);
          return new Response(JSON.stringify({ error: "Invalid external reference" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { user_id, plan } = externalRef;

        if (payment.status === "approved") {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              plan,
              payment_provider: "mercadopago",
              payment_id: String(payment.id),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user_id);

          if (error) {
            console.error("Error updating subscription:", error);
            return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          console.log(`Subscription activated: user=${user_id} plan=${plan} payment=${payment.id}`);
        } else if (payment.status === "cancelled" || payment.status === "refunded") {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user_id);

          if (error) console.error("Error cancelling subscription:", error);
          console.log(`Subscription cancelled: user=${user_id}`);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Manual webhook (legacy format)
    const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
    if (webhookSecret) {
      const authHeader = req.headers.get("x-webhook-secret");
      if (authHeader !== webhookSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = await req.json();
    if (!payload.event || !payload.user_id) {
      return new Response(JSON.stringify({ error: "Missing event or user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (payload.event) {
      case "payment.approved":
        updateData = { ...updateData, status: "active", plan: payload.plan || "pro", payment_provider: payload.payment_provider || null, payment_id: payload.payment_id || null };
        break;
      case "subscription.renewed":
        updateData = { ...updateData, status: "active", payment_id: payload.payment_id || null };
        break;
      case "payment.cancelled":
      case "subscription.cancelled":
        updateData = { ...updateData, status: "cancelled" };
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown event: ${payload.event}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const { error } = await supabase.from("subscriptions").update(updateData).eq("user_id", payload.user_id);
    if (error) {
      console.error("Error updating subscription:", error);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
