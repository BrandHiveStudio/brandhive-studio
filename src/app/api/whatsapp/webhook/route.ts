import { NextResponse } from "next/server";
import crypto from "crypto";
import { processHiveMessage } from "@/lib/ai/hive";
import {
  sendWhatsAppTextMessage,
  markWhatsAppMessageAsRead,
  checkWhatsAppConfig,
} from "@/lib/whatsapp/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/whatsapp/webhook
 *
 * 1. Meta Webhook Verification Handshake:
 *    When registering this webhook URL in the Meta App Dashboard, Meta sends
 *    hub.mode, hub.verify_token, and hub.challenge. If hub.verify_token matches
 *    WHATSAPP_WEBHOOK_VERIFY_TOKEN, we echo hub.challenge with HTTP 200.
 *
 * 2. Status Diagnostic Check:
 *    If accessed directly in a browser or without hub parameters, returns
 *    operational status and configuration readiness.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  // Handle Meta Handshake
  if (mode || token) {
    if (!expectedVerifyToken) {
      console.warn(
        "[WhatsApp Webhook] Verification attempt received, but WHATSAPP_WEBHOOK_VERIFY_TOKEN is not set in environment."
      );
      return new Response("WHATSAPP_WEBHOOK_VERIFY_TOKEN is not configured on the server", {
        status: 403,
      });
    }

    if (mode === "subscribe" && token === expectedVerifyToken) {
      console.log("[WhatsApp Webhook] Meta subscription verified successfully.");
      return new Response(challenge || "", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("[WhatsApp Webhook] Token verification failed. Provided token did not match.");
    return new Response("Forbidden: Verification token mismatch", { status: 403 });
  }

  // Diagnostic status check
  const config = checkWhatsAppConfig();
  return NextResponse.json({
    service: "BrandHive Studio WhatsApp Webhook",
    status: "active",
    registeredNumber: "+94 70 641 0093",
    configuration: {
      isReadyForLiveMessaging: config.isConfigured,
      missingVariables: config.missingVariables,
      appSecretSecurityActive: config.appSecretConfigured,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Helper to verify Meta HMAC-SHA256 signature if WHATSAPP_APP_SECRET is set.
 */
function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    // If secret is not configured, pass through with a warning
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex")}`;

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const signatureBuffer = Buffer.from(signatureHeader, "utf8");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

interface MetaWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

interface MetaWebhookChangeValue {
  messaging_product: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: Array<{
    profile?: { name?: string };
    wa_id?: string;
  }>;
  messages?: MetaWebhookMessage[];
  statuses?: Array<{
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
  }>;
}

interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: MetaWebhookChangeValue;
    field: string;
  }>;
}

interface MetaWebhookPayload {
  object: string;
  entry?: MetaWebhookEntry[];
}

/**
 * POST /api/whatsapp/webhook
 *
 * Inbound webhook handler for Meta WhatsApp Cloud API.
 * Receives messages sent to BrandHive Studio WhatsApp line,
 * processes them with HIVE AI, and dispatches outbound replies.
 */
export async function POST(req: Request) {
  let rawBody: string;

  try {
    rawBody = await req.text();
  } catch (err) {
    console.error("[WhatsApp Webhook] Failed to read request body:", err);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature if app secret is provided
  const signatureHeader = req.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(rawBody, signatureHeader)) {
    console.warn("[WhatsApp Webhook] Invalid x-hub-signature-256 header. Rejecting payload.");
    return NextResponse.json({ error: "Unauthorized signature" }, { status: 401 });
  }

  let body: MetaWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error("[WhatsApp Webhook] JSON parse error on inbound payload.");
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  // Meta Cloud API payloads must have object === "whatsapp_business_account"
  if (body.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  // Process all inbound entries
  for (const entry of body.entry) {
    if (!Array.isArray(entry.changes)) continue;

    for (const change of entry.changes) {
      const val = change.value;
      if (!val) continue;

      // Handle delivery/read receipts gracefully without triggering outbound replies
      if (val.statuses && val.statuses.length > 0) {
        continue;
      }

      // Handle incoming messages
      if (val.messages && Array.isArray(val.messages)) {
        for (const msg of val.messages) {
          const sender = msg.from;
          if (!sender) continue;

          // Extract message text from text message or interactive selection
          let messageContent = "";
          if (msg.type === "text" && msg.text?.body) {
            messageContent = msg.text.body;
          } else if (msg.type === "interactive") {
            messageContent =
              msg.interactive?.button_reply?.title ||
              msg.interactive?.list_reply?.title ||
              "";
          }

          if (!messageContent.trim()) {
            continue;
          }

          // Mark message as read on WhatsApp
          if (msg.id) {
            markWhatsAppMessageAsRead(msg.id).catch(() => {});
          }

          const senderName = val.contacts?.[0]?.profile?.name;

          try {
            // Process message with HIVE AI knowledge engine
            const aiResponse = await processHiveMessage({
              message: messageContent,
              channel: "whatsapp",
              senderName,
            });

            // Send HIVE AI reply back through WhatsApp Cloud API
            await sendWhatsAppTextMessage(sender, aiResponse.reply);
          } catch (aiErr) {
            console.error("[WhatsApp Webhook] Error processing HIVE AI message:", aiErr);
            // Send fallback polite reply
            await sendWhatsAppTextMessage(
              sender,
              "Hello! I'm HIVE AI for BrandHive Studio. I received your message and will connect you with our creative team shortly. You can also reach us directly at brandhive.studio.lk@gmail.com."
            );
          }
        }
      }
    }
  }

  // Always respond with 200 OK immediately to acknowledge receipt
  return NextResponse.json({ status: "received" }, { status: 200 });
}
