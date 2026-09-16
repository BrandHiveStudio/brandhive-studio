import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createInquiry } from "@/lib/db/queries/inquiries";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, service, budget, message } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "A project description or message is required." },
        { status: 400 }
      );
    }

    // 2. Persist to Turso contact_inquiries table
    const inquiry = await createInquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : null,
      company: company ? String(company).trim() : null,
      service: service ? String(service).trim() : "General Inquiry",
      budget: budget ? String(budget).trim() : null,
      message: message.trim(),
      status: "new",
      notes: null,
    });

    // 3. Optional Email Dispatch via Resend (safe fail-soft)
    if (resend) {
      const escapeHtml = (str: string) =>
        str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      const safeName = escapeHtml(inquiry.name);
      const safeEmail = escapeHtml(inquiry.email);
      const safePhone = inquiry.phone ? escapeHtml(inquiry.phone) : "";
      const safeCompany = inquiry.company ? escapeHtml(inquiry.company) : "";
      const safeService = escapeHtml(inquiry.service || "General Inquiry");
      const safeBudget = inquiry.budget ? escapeHtml(inquiry.budget) : "";
      const safeMessage = escapeHtml(inquiry.message);

      try {
        await resend.emails.send({
          from: "BrandHive Studio <onboarding@resend.dev>",
          to: ["brandhive.studio.lk@gmail.com"],
          subject: `🚀 New Project Inquiry from ${safeName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; background-color:#0b0f14; color:#f0f4f8; padding:24px; border-radius:12px; border:1px solid #1c2633;">
              <h2 style="color:#16C7FF; margin-top:0;">New Project Inquiry</h2>
              <p style="color:#94a3b8; font-size:14px;">A new lead has been submitted on the BrandHive Studio website.</p>

              <table style="width:100%; border-collapse:collapse; margin-top:16px;">
                <tr>
                  <td style="padding:8px 0; color:#94a3b8; width:120px;"><strong>Client Name:</strong></td>
                  <td style="padding:8px 0; color:#ffffff; font-weight:bold;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;"><strong>Email:</strong></td>
                  <td style="padding:8px 0; color:#16C7FF;"><a href="mailto:${safeEmail}" style="color:#16C7FF; text-decoration:none;">${safeEmail}</a></td>
                </tr>
                ${safePhone ? `
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;"><strong>Phone:</strong></td>
                  <td style="padding:8px 0; color:#ffffff;">${safePhone}</td>
                </tr>` : ""}
                ${safeCompany ? `
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;"><strong>Company:</strong></td>
                  <td style="padding:8px 0; color:#ffffff;">${safeCompany}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;"><strong>Service:</strong></td>
                  <td style="padding:8px 0; color:#ffffff;">${safeService}</td>
                </tr>
                ${safeBudget ? `
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;"><strong>Budget:</strong></td>
                  <td style="padding:8px 0; color:#ffffff;">${safeBudget}</td>
                </tr>` : ""}
              </table>

              <hr style="margin:20px 0; border:none; border-top:1px solid #1c2633;" />

              <h4 style="color:#ffffff; margin-bottom:8px;">Project Message:</h4>
              <p style="line-height:1.6; color:#cbd5e1; white-space:pre-wrap; background:#11161f; padding:12px; border-radius:8px;">
                ${safeMessage}
              </p>

              <hr style="margin:24px 0; border:none; border-top:1px solid #1c2633;" />

              <p style="color:#64748b; font-size:12px; margin:0;">
                Inquiry ID: ${inquiry.id} • Managed in BrandHive Studio Admin Panel.
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Resend email dispatch notice (inquiry safely saved to Turso):", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: inquiry.id,
      message: "Thank you! Your inquiry has been received. Our team will contact you shortly.",
    });
  } catch (err: unknown) {
    console.error("Error processing contact submission:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit inquiry. Please try again or reach out directly at brandhive.studio.lk@gmail.com.",
      },
      { status: 500 }
    );
  }
}