import { Metadata } from "next";
import PolicyLayout from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | BrandHive Studio",
  description: "Read the terms governing BrandHive Studio website use, services, payments and projects.",
  alternates: {
    canonical: "https://www.brandhivestudio.com.lk/terms",
  },
  openGraph: {
    title: "Terms & Conditions | BrandHive Studio",
    description: "Read the terms governing BrandHive Studio website use, services, payments and projects.",
    url: "https://www.brandhivestudio.com.lk/terms",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Terms governing your use of the BrandHive Studio website and engagement with our services."
      lastUpdated="July 2026"
    >
      {/* 1. Introduction */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          1. Introduction
        </h2>
        <p>
          Welcome to BrandHive Studio (&ldquo;BrandHive Studio,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operating via{" "}
          <strong className="text-white">www.brandhivestudio.com.lk</strong>. These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of our website, as well as the commercial terms governing our creative, design, software, and marketing engagements.
        </p>
        <p>
          By accessing or using our website, submitting an inquiry, or commissioning a project with BrandHive Studio, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please refrain from using our website or commissioning our services.
        </p>
      </section>

      {/* 2. Services */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          2. Services
        </h2>
        <p>
          BrandHive Studio provides premium creative and digital engineering services, including but not limited to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-white/75">
          <li><strong className="text-white">Brand Identity:</strong> Visual identity design, logo suites, brand strategy, design systems, and guidelines.</li>
          <li><strong className="text-white">Website Design &amp; Development:</strong> Custom responsive websites, web applications, corporate platforms, and CMS integration.</li>
          <li><strong className="text-white">UI/UX Design:</strong> Interface design, user experience architecture, mobile app interfaces, design audits, and interactive prototyping.</li>
          <li><strong className="text-white">Growth Marketing:</strong> Performance strategy, digital content design, campaign assets, and social media brand positioning.</li>
          <li><strong className="text-white">Software Development:</strong> Custom digital solutions, workflows, and business application architecture.</li>
        </ul>
        <p>
          All deliverables, specifications, and scope boundaries are established on an individual project agreement or quotation basis.
        </p>
      </section>

      {/* 3. Service Pricing */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          3. Service Pricing
        </h2>
        <p>
          Service rates and pricing tiers displayed on the website or communicated during preliminary consultations serve as general guides or starting rates. Because every business requirement is unique, final project costs are determined based on specific technical complexity, scope, deliverables, and timeline requirements.
        </p>
        <p>
          Project-specific quotations or written agreements take precedence over general website pricing where applicable.
        </p>
      </section>

      {/* 4. Quotations */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          4. Quotations
        </h2>
        <p>
          Written quotations issued by BrandHive Studio remain valid for <strong>30 days</strong> from the date of issuance unless otherwise stated in writing. After 30 days, BrandHive Studio reserves the right to review, modify, or reissue the quotation based on current scheduling and service availability.
        </p>
      </section>

      {/* 5. Payment Terms */}
      <section className="space-y-5 rounded-2xl bg-[#11161C]/60 p-6 sm:p-7 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#16C7FF] shadow-[0_0_10px_#16C7FF]" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            5. Payment Terms
          </h2>
        </div>
        <p>
          Standard project engagements operate on the following milestone structure:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16C7FF]">Milestone 1</span>
            <p className="text-lg font-extrabold text-white mt-1">50% Advance Payment</p>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">Required prior to project commencement, discovery, and design work.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16C7FF]">Milestone 2</span>
            <p className="text-lg font-extrabold text-white mt-1">50% Before Final Delivery</p>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">Required upon project approval and prior to release of final source files or live website deployment.</p>
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <p><strong className="text-white">Accepted Payment Methods:</strong></p>
          <ul className="list-disc pl-5 space-y-1 text-white/75">
            <li>Bank Transfer</li>
            <li>Cash</li>
          </ul>
        </div>
        <p className="text-xs text-white/50 pt-1">
          Work commences only after confirmation of the initial advance payment. Invoices must be settled within the time specified on the invoice.
        </p>
      </section>

      {/* 6. Project Scope */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          6. Project Scope
        </h2>
        <p>
          The scope of work for each engagement is explicitly outlined in the project quotation or agreement. Any requests for additional features, pages, integrations, design directions, or functional changes outside the agreed scope will be evaluated separately and may require an additional quotation and adjusted delivery timeline.
        </p>
      </section>

      {/* 7. Client Responsibilities */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          7. Client Responsibilities
        </h2>
        <p>
          Successful project delivery requires active collaboration. The client agrees to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-white/75">
          <li>Provide necessary brand assets, copywriting, photography, product specifications, and credentials in a timely manner.</li>
          <li>Designate an authorized representative with authority to approve milestones and design directions.</li>
          <li>Provide clear, consolidated feedback during review cycles.</li>
          <li>Ensure that all materials provided do not infringe on third-party intellectual property or copyright.</li>
        </ul>
      </section>

      {/* 8. Revisions */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          8. Revisions
        </h2>
        <p>
          Each project includes a structured number of review rounds specified in the quotation or proposal to refine concepts. Revisions apply to the agreed scope and concept direction. Substantial changes in project direction, complete conceptual pivots, or revision requests submitted after sign-off will be quoted as additional work.
        </p>
      </section>

      {/* 9. Project Timelines */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          9. Project Timelines
        </h2>
        <p>
          Project timelines communicated in proposals or estimates are estimated schedules based on typical project phases. Actual completion dates depend on prompt client feedback, timely provision of required assets, and approval turnaround. Delays in receiving client materials or review feedback will proportionally extend delivery schedules.
        </p>
      </section>

      {/* 10. Third-Party Costs */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          10. Third-Party Costs
        </h2>
        <p>
          Unless explicitly itemized as included in the written project proposal, project quotes do not include third-party expenses such as domain registration, web hosting, commercial font licenses, premium plugins, third-party software subscriptions, or paid API consumption. Such costs are the responsibility of the client.
        </p>
      </section>

      {/* 11. Ownership & Final Deliverables */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          11. Ownership &amp; Final Deliverables
        </h2>
        <p>
          Upon receipt of <strong className="text-white">100% full and final payment</strong>, all intellectual property rights to the final approved deliverables created specifically for the client are transferred to the client.
        </p>
        <p>
          BrandHive Studio retains ownership of preliminary concepts, unselected draft options, reusable code libraries, proprietary development tooling, and general design techniques developed during the engagement.
        </p>
      </section>

      {/* 12. Portfolio Usage */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          12. Portfolio Usage
        </h2>
        <p>
          BrandHive Studio reserves the right to showcase completed client work, screenshots, branding assets, and project outcomes in our portfolio, case studies, social media channels, and marketing presentations, unless a formal Non-Disclosure Agreement (NDA) stating otherwise was executed prior to project commencement.
        </p>
      </section>

      {/* 13. Website Content & Availability */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          13. Website Content &amp; Availability
        </h2>
        <p>
          All content, visual assets, text, photography, and code on <strong className="text-white">www.brandhivestudio.com.lk</strong> are the intellectual property of BrandHive Studio and protected by applicable copyright and trademark laws. You may not copy, reproduce, distribute, or create derivative works from website materials without our prior written consent.
        </p>
        <p>
          While we strive for 100% uptime, we do not warrant that our website will be uninterrupted or error-free at all times.
        </p>
      </section>

      {/* 14. Business Results */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          14. Business Results
        </h2>
        <p>
          BrandHive Studio is dedicated to delivering industry-leading creative craftsmanship, responsive engineering, and strategic execution. However, because commercial results are influenced by numerous variables outside our control—such as market conditions, client product-market fit, sales operations, and third-party advertising algorithms—we do not guarantee specific monetary returns, conversion rates, or sales figures.
        </p>
      </section>

      {/* 15. Promotional Offers */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          15. Promotional Offers
        </h2>
        <p>
          Promotional packages, discounts, or seasonal campaign pricing offered by BrandHive Studio are subject to stated availability, designated validity windows, and specific eligibility criteria. Offers cannot be combined or applied retroactively to previously contracted projects.
        </p>
      </section>

      {/* 16. Terms Changes */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          16. Terms Changes
        </h2>
        <p>
          BrandHive Studio reserves the right to modify these Terms &amp; Conditions at any time. Updated terms take effect immediately upon publication on this page. Your continued use of the website or engagement with our services following updates constitutes your acceptance of the revised Terms.
        </p>
      </section>

      {/* 17. Contact */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          17. Contact
        </h2>
        <p>
          If you have questions regarding these Terms &amp; Conditions or wish to discuss an engagement, please contact us:
        </p>
        <div className="rounded-2xl bg-[#11161C]/60 p-5 sm:p-6 space-y-2 border border-white/10 backdrop-blur-md text-sm text-white/80">
          <p><strong className="text-white">Agency:</strong> BrandHive Studio</p>
          <p><strong className="text-white">Location:</strong> Interceed Waththa, Kattuwa, Negombo, Sri Lanka</p>
          <p><strong className="text-white">Official Business Email:</strong> <a href="mailto:info@brandhivestudio.com.lk" className="text-[#16C7FF] hover:text-[#60D6FF] underline font-semibold">info@brandhivestudio.com.lk</a></p>
          <p><strong className="text-white">WhatsApp / Phone:</strong> <a href="tel:+94706410093" className="text-[#16C7FF] hover:text-[#60D6FF] underline font-semibold">+94 70 641 0093</a></p>
          <p><strong className="text-white">Website:</strong> <a href="https://www.brandhivestudio.com.lk" className="text-[#16C7FF] hover:text-[#60D6FF] underline font-semibold">www.brandhivestudio.com.lk</a></p>
        </div>
      </section>
    </PolicyLayout>
  );
}
