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
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

    // Handle Mercado Pago IPN notifications
    if (topic === "payment" || topic === "preapproval") {
      const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

      if (!dataId) {
        return new Response(JSON.stringify({ error: "Missing data.id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!mercadoPagoToken) {
        console.error("MERCADO_PAGO_ACCESS_TOKEN not configured");
        return new Response(JSON.stringify({ error: "Server configuration error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (topic === "preapproval") {
        // Fetch subscription details from Mercado Pago
        const subRes = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
          headers: { Authorization: `Bearer ${mercadoPagoToken}` },
        });

        if (!subRes.ok) {
          console.error("Failed to fetch preapproval:", await subRes.text());
          return new Response(JSON.stringify({ error: "Failed to verify subscription" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const sub = await subRes.json();
        const userId = sub.external_reference;

        if (!userId) {
          console.error("No external_reference in preapproval");
          return new Response(JSON.stringify({ error: "Invalid subscription data" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        let updateData: Record<string, unknown> = {
          mp_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        };

        // Map MP subscription status to our status
        // MP statuses: pending, authorized, paused, cancelled
        switch (sub.status) {
          case "authorized":
            updateData.status = "active";
            updateData.plan = "mensal";
            updateData.payment_provider = "mercadopago";
            // next_payment_date from MP
            if (sub.next_payment_date) {
              updateData.current_period_end = sub.next_payment_date;
            }
            break;
          case "paused":
            updateData.status = "defaulting";
            break;
          case "cancelled":
            updateData.status = "cancelled";
            break;
          case "pending":
            // Keep current status
            break;
          default:
            console.log(`Unknown preapproval status: ${sub.status}`);
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating subscription:", error);
          return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Subscription updated: user=${userId} status=${sub.status} mp_id=${sub.id}`);
      }

      if (topic === "payment") {
        // Fetch payment details
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

        // For subscription payments, external_reference is user_id directly
        let userId = payment.external_reference;

        // If it's a JSON string (legacy), try to parse
        if (userId && userId.startsWith("{")) {
          try {
            const parsed = JSON.parse(userId);
            userId = parsed.user_id;
          } catch {
            // keep as-is
          }
        }

        if (!userId) {
          console.log("Payment without user reference, skipping");
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (payment.status === "approved") {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              plan: "mensal",
              payment_provider: "mercadopago",
              payment_id: String(payment.id),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (error) console.error("Error updating subscription:", error);
          console.log(`Payment approved: user=${userId} payment=${payment.id}`);
        } else if (payment.status === "rejected" || payment.status === "cancelled") {
          // Mark as defaulting if payment fails
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "defaulting",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (error) console.error("Error updating subscription:", error);
          console.log(`Payment failed: user=${userId} status=${payment.status}`);
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
        updateData = { ...updateData, status: "active", plan: payload.plan || "mensal", payment_provider: payload.payment_provider || null, payment_id: payload.payment_id || null };
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
