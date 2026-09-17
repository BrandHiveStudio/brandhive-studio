/**
 * Meta WhatsApp Cloud API Client
 *
 * Handles outbound messaging and read receipts for BrandHive Studio's
 * registered WhatsApp business number (+94 70 641 0093).
 *
 * Official Meta Graph API endpoint:
 * POST https://graph.facebook.com/{GRAPH_VERSION}/{PHONE_NUMBER_ID}/messages
 */

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: unknown;
}

export interface WhatsAppConfigStatus {
  isConfigured: boolean;
  missingVariables: string[];
  phoneNumberIdConfigured: boolean;
  apiTokenConfigured: boolean;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
}

const GRAPH_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";

/**
 * Checks WhatsApp Cloud API environment configuration status.
 */
export function checkWhatsAppConfig(): WhatsAppConfigStatus {
  const missing: string[] = [];

  if (!process.env.WHATSAPP_CLOUD_API_TOKEN) {
    missing.push("WHATSAPP_CLOUD_API_TOKEN");
  }
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
    missing.push("WHATSAPP_PHONE_NUMBER_ID");
  }
  if (!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    missing.push("WHATSAPP_WEBHOOK_VERIFY_TOKEN");
  }

  return {
    isConfigured: missing.length === 0,
    missingVariables: missing,
    phoneNumberIdConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    apiTokenConfigured: Boolean(process.env.WHATSAPP_CLOUD_API_TOKEN),
    verifyTokenConfigured: Boolean(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
    appSecretConfigured: Boolean(process.env.WHATSAPP_APP_SECRET),
  };
}

/**
 * Sends a plain text message reply back to a user on WhatsApp.
 */
export async function sendWhatsAppTextMessage(
  to: string,
  text: string
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    const errorMsg =
      "[WhatsApp Cloud API] Outbound message aborted: WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured in environment variables.";
    console.warn(errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;

  // Sanitize recipient phone number (remove +, spaces, or dashes)
  const cleanRecipient = to.replace(/[^0-9]/g, "");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanRecipient,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp Cloud API] Meta API Error Response:", data);
      return {
        success: false,
        error: data?.error?.message || `Meta API returned HTTP status ${response.status}`,
        details: data,
      };
    }

    const messageId = data?.messages?.[0]?.id;
    return {
      success: true,
      messageId,
      details: data,
    };
  } catch (error) {
    console.error("[WhatsApp Cloud API] Network or fetch error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown network error",
    };
  }
}

/**
 * Marks an incoming WhatsApp message as read.
 */
export async function markWhatsAppMessageAsRead(messageId: string): Promise<boolean> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId || !messageId) {
    return false;
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });

    return response.ok;
  } catch {
    // Non-critical operation, suppress errors
    return false;
  }
}
