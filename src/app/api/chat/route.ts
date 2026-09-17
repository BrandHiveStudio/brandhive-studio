import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processHiveMessage } from "@/lib/ai/hive";

type ChatPayload = {
  message: string;
  history?: Array<{ role: "assistant" | "user"; content: string }>;
  lead?: {
    name: string;
    email: string;
    company?: string;
  };
};

type ChatResponse = {
  reply: string;
  needsLeadCapture: boolean;
  suggestedAction?: string;
};
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function callOpenAI(payload: ChatPayload): Promise<ChatResponse> {
  return processHiveMessage({
    message: payload.message,
    history: payload.history,
    channel: "web",
  });
}

async function sendLeadEmail(lead: NonNullable<ChatPayload["lead"]>) {
  if (!resend) {
    return { success: true };
  }

  const { error } = await resend.emails.send({
    from: "BrandHive Studio <onboarding@resend.dev>",
    to: ["brandhive.studio.lk@gmail.com"],
    subject: `🤖 New qualified lead from Hive Assistant - ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto;">
        <h2 style="color:#16C7FF;">New Chat Lead</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Company:</strong> ${lead.company || "Not provided"}</p>
        <p>This lead was captured from the website chatbot and should be followed up promptly.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatPayload;

    if (body.lead) {
      await sendLeadEmail(body.lead);
      return NextResponse.json({
        reply: "Thanks for sharing that. Our team will follow up shortly with the right next step.",
        needsLeadCapture: false,
        suggestedAction: "We’ll reach out soon",
      });
    }

    const response = await callOpenAI(body);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        reply: "I’m here to help you with BrandHive Studio. Tell me what you need and I’ll guide you forward.",
        needsLeadCapture: false,
        suggestedAction: "Ask about services or the project planner",
      },
      { status: 500 }
    );
  }
}
