import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Validate UUID format
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Validate that a string is a safe numeric ID
function isNumericId(str: string): boolean {
  return /^\d{1,20}$/.test(str);
}

async function handlePreapproval(dataId: string, mercadoPagoToken: string): Promise<Response> {
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

  if (!userId || !isValidUUID(userId)) {
    console.error("Invalid or missing external_reference in preapproval");
    return new Response(JSON.stringify({ error: "Invalid subscription data" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateData: Record<string, unknown> = {
    mp_subscription_id: String(sub.id),
    updated_at: new Date().toISOString(),
  };

  switch (sub.status) {
    case "authorized":
      updateData.status = "active";
      updateData.plan = "mensal";
      updateData.payment_provider = "mercadopago";
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
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handlePayment(dataId: string, mercadoPagoToken: string): Promise<Response> {
  if (!isNumericId(dataId)) {
    return new Response(JSON.stringify({ error: "Invalid payment ID" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
  let userId = payment.external_reference;

  // If it's a JSON string (legacy), try to parse
  if (userId && typeof userId === "string" && userId.startsWith("{")) {
    try {
      const parsed = JSON.parse(userId);
      userId = parsed.user_id;
    } catch {
      // keep as-is
    }
  }

  if (!userId || !isValidUUID(userId)) {
    console.log("Payment without valid user reference, skipping");
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

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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

      if (!dataId || dataId.length > 50) {
        return new Response(JSON.stringify({ error: "Invalid data.id" }), {
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

      // Verify Mercado Pago webhook signature (HMAC-SHA256)
      const mpWebhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
      if (mpWebhookSecret) {
        const signatureHeader = req.headers.get("x-signature") || "";
        const requestId = req.headers.get("x-request-id") || "";
        const parts: Record<string, string> = {};
        for (const p of signatureHeader.split(",")) {
          const [k, v] = p.split("=").map((s) => s.trim());
          if (k && v) parts[k] = v;
        }
        const ts = parts["ts"];
        const v1 = parts["v1"];
        if (!ts || !v1) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(mpWebhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
        const expected = Array.from(new Uint8Array(sigBuf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (expected !== v1) {
          console.error("Invalid MP webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        console.warn("MERCADO_PAGO_WEBHOOK_SECRET not set — IPN signature unverified");
      }

      if (topic === "preapproval") {
        return await handlePreapproval(dataId, mercadoPagoToken);
      }

      if (topic === "payment") {
        return await handlePayment(dataId, mercadoPagoToken);
      }
    }

    // Manual webhook (legacy format)
    const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();

    // Validate payload
    if (!payload || typeof payload !== "object") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payload.event || typeof payload.event !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payload.user_id || !isValidUUID(payload.user_id)) {
      return new Response(JSON.stringify({ error: "Missing or invalid user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    const allowedEvents = ["payment.approved", "subscription.renewed", "payment.cancelled", "subscription.cancelled"];
    if (!allowedEvents.includes(payload.event)) {
      return new Response(JSON.stringify({ error: `Unknown event: ${payload.event}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (payload.event) {
      case "payment.approved":
        updateData = {
          ...updateData,
          status: "active",
          plan: "mensal",
          payment_provider: typeof payload.payment_provider === "string" ? payload.payment_provider.substring(0, 50) : null,
          payment_id: typeof payload.payment_id === "string" ? payload.payment_id.substring(0, 100) : null,
        };
        break;
      case "subscription.renewed":
        updateData = {
          ...updateData,
          status: "active",
          payment_id: typeof payload.payment_id === "string" ? payload.payment_id.substring(0, 100) : null,
        };
        break;
      case "payment.cancelled":
      case "subscription.cancelled":
        updateData = { ...updateData, status: "cancelled" };
        break;
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
