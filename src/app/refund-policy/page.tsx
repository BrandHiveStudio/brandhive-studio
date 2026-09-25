import { Metadata } from "next";
import PolicyLayout from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | BrandHive Studio",
  description: "Understand BrandHive Studio's project cancellation, refund and related payment policies.",
  alternates: {
    canonical: "https://www.brandhivestudio.com.lk/refund-policy",
  },
  openGraph: {
    title: "Refund & Cancellation Policy | BrandHive Studio",
    description: "Understand BrandHive Studio's project cancellation, refund and related payment policies.",
    url: "https://www.brandhivestudio.com.lk/refund-policy",
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      subtitle="Clear information about project cancellation, refunds and related costs."
      lastUpdated="July 2026"
    >
      {/* 1. General Policy */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          1. General Policy
        </h2>
        <p>
          At BrandHive Studio (&ldquo;BrandHive Studio,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we take pride in delivering meticulous craftsmanship across brand identity, digital design, UI/UX architecture, and web engineering.
        </p>
        <p>
          Because our services involve dedicated creative talent, customized technical development, and reserved studio scheduling, we maintain clear, fair, and transparent policies regarding cancellations, refunds, and associated expenses.
        </p>
      </section>

      {/* 2. Cancellation Before Work Begins */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          2. Cancellation Before Work Begins
        </h2>
        <p>
          If a client formally requests cancellation of an engagement prior to the commencement of any creative discovery, project briefing, research, design drafting, or technical setup, the unused portion of the advance deposit may qualify for a refund, subject to applicable deductions.
        </p>
        <p>
          Applicable deductions may include any unrecoverable administrative setup costs or external transaction handling fees incurred.
        </p>
      </section>

      {/* 3. Cancellation After Work Begins */}
      <section className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#12BDF7]" />
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            3. Cancellation After Work Begins
          </h2>
        </div>
        <p>
          Once project discovery, creative exploration, design prototyping, or development work has commenced, <strong>completed work is generally non-refundable</strong>.
        </p>
        <p>
          In the event of cancellation after work has begun, any refund consideration is strictly calculated based on the unused portion of fees after deducting:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
          <li>work already completed up to the cancellation notice date;</li>
          <li>non-refundable third-party costs committed on behalf of the project;</li>
          <li>external services, software licenses, or assets already purchased; and</li>
          <li>other previously agreed project-specific expenses.</li>
        </ul>
        <p className="text-sm text-slate-600">
          If the value of completed work and incurred third-party costs exceeds the advance deposit paid, the client will be invoiced for the balance due for work completed up to the date of formal cancellation.
        </p>
      </section>

      {/* 4. Custom Projects */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          4. Custom Projects
        </h2>
        <p>
          Certain enterprise projects, bespoke software development, or long-term retainer agreements may include project-specific milestone schedules or distinct termination provisions.
        </p>
        <p>
          Where custom terms are explicitly agreed and executed in a written contract or quotation signed by both parties, those project-specific terms take precedence over the general terms in this policy.
        </p>
      </section>

      {/* 5. Third-Party Services */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          5. Third-Party Services
        </h2>
        <p>
          Fees paid to third-party vendors—such as domain name registrars, web hosting providers, paid typography foundries, third-party API providers, or paid software plugins—are entirely non-refundable once ordered or registered. BrandHive Studio is not liable for refunds on any third-party products or services once purchased for your project.
        </p>
      </section>

      {/* 6. Refund Requests */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          6. Refund Requests
        </h2>
        <p>
          All cancellation and refund requests must be submitted in writing by the authorized project sponsor. To initiate a request, please contact our team via:
        </p>
        <div className="rounded-xl bg-slate-100/80 p-5 space-y-2 border border-slate-200 text-sm">
          <p><strong className="text-[#0F172A]">Email:</strong> <a href="mailto:info@brandhivestudio.com.lk" className="text-[#0284C7] underline font-semibold">info@brandhivestudio.com.lk</a></p>
          <p><strong className="text-[#0F172A]">WhatsApp / Phone:</strong> <a href="tel:+94706410093" className="text-[#0284C7] underline font-semibold">+94 70 641 0093</a></p>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          Your request must specify your project name, invoice number, reason for cancellation, and date of notification.
        </p>
      </section>

      {/* 7. Refund Review */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          7. Refund Review &amp; Human Approval
        </h2>
        <p>
          All refund and cancellation requests undergo careful, individual human review by BrandHive Studio management. We review the project milestones achieved, time invested, external expenditures committed, and deliverables shared.
        </p>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
          <strong>Important Notice:</strong> Artificial intelligence systems and automated chat agents used by BrandHive Studio must <strong>NEVER</strong> independently promise, decide, or approve refunds or payment exceptions. All refund decisions require direct review and formal approval from BrandHive Studio leadership.
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          Approved refunds will be processed via original bank transfer or agreed payment method within 14 business days of formal written confirmation.
        </p>
      </section>

      {/* 8. Policy Updates */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          8. Policy Updates
        </h2>
        <p>
          BrandHive Studio reserves the right to amend this Refund &amp; Cancellation Policy at any time. Changes become effective upon publication on this page with an updated &ldquo;Last Updated&rdquo; date. (Version: July 2026).
        </p>
      </section>

      {/* Contact Section */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          9. Contact BrandHive Studio
        </h2>
        <p>
          For any clarifications regarding cancellation or billing terms:
        </p>
        <div className="rounded-xl bg-slate-100/80 p-5 space-y-2 border border-slate-200 text-sm">
          <p><strong className="text-[#0F172A]">Agency:</strong> BrandHive Studio</p>
          <p><strong className="text-[#0F172A]">Location:</strong> Interceed Waththa, Kattuwa, Negombo, Sri Lanka</p>
          <p><strong className="text-[#0F172A]">Official Business Email:</strong> <a href="mailto:info@brandhivestudio.com.lk" className="text-[#0284C7] underline font-semibold">info@brandhivestudio.com.lk</a></p>
          <p><strong className="text-[#0F172A]">WhatsApp / Phone:</strong> <a href="tel:+94706410093" className="text-[#0284C7] underline font-semibold">+94 70 641 0093</a></p>
          <p><strong className="text-[#0F172A]">Website:</strong> <a href="https://www.brandhivestudio.com.lk" className="text-[#0284C7] underline font-semibold">www.brandhivestudio.com.lk</a></p>
        </div>
      </section>
    </PolicyLayout>
  );
}
