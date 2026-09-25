import { Metadata } from "next";
import Link from "next/link";
import PolicyLayout from "@/components/legal/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | BrandHive Studio",
  description: "Learn how BrandHive Studio collects, uses, protects and manages personal information.",
  alternates: {
    canonical: "https://www.brandhivestudio.com.lk/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | BrandHive Studio",
    description: "Learn how BrandHive Studio collects, uses, protects and manages personal information.",
    url: "https://www.brandhivestudio.com.lk/privacy-policy",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How BrandHive Studio collects, uses, protects and manages personal information."
      lastUpdated="July 2026"
    >
      {/* 1. Introduction */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          1. Introduction
        </h2>
        <p>
          BrandHive Studio (&ldquo;BrandHive Studio,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a creative agency based in Negombo, Sri Lanka, operating the official website{" "}
          <strong className="text-white">www.brandhivestudio.com.lk</strong>. We provide premium branding, digital design, website development, UI/UX engineering, and growth marketing solutions for ambitious companies and organizations.
        </p>
        <p>
          We are committed to maintaining the highest standards of data confidentiality, digital integrity, and transparency. This Privacy Policy sets out how we collect, store, utilize, and protect personal information that you provide when visiting our website, contacting our team, or engaging with our creative services.
        </p>
      </section>

      {/* 2. Information We Collect */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          2. Information We Collect
        </h2>
        <p>
          We collect personal and technical information through our website and client communications in two ways: information you directly provide, and information collected automatically through standard website operations.
        </p>

        {/* 2.1 Information You Provide */}
        <div className="space-y-3 pl-4 border-l-2 border-[#16C7FF]">
          <h3 className="text-lg font-bold text-white">
            2.1 Information You Provide
          </h3>
          <p>
            When you interact with our website, request a consultation, submit a project inquiry, or correspond with us via contact forms, email, or messaging channels, you may voluntarily submit:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/75">
            <li><strong className="text-white">Contact Details:</strong> Your full name, business or personal email address, phone number, and WhatsApp contact.</li>
            <li><strong className="text-white">Business &amp; Project Details:</strong> Company or brand name, industry, current website URL, project scope, desired timelines, and approximate budget ranges.</li>
            <li><strong className="text-white">Communication Content:</strong> Project briefs, design reference materials, specific inquiries, and general correspondence shared with our team.</li>
          </ul>
        </div>

        {/* 2.2 Automatically Collected Information */}
        <div className="space-y-3 pl-4 border-l-2 border-white/20">
          <h3 className="text-lg font-bold text-white">
            2.2 Automatically Collected Information
          </h3>
          <p>
            When you navigate our website, our servers and privacy-compliant measurement tools may record certain standard diagnostic data, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-white/75">
            <li>Device type, screen resolution, operating system, and browser specifications.</li>
            <li>IP address and approximate geographic location (country/city level).</li>
            <li>Referring website or traffic source, pages viewed, time spent per section, and interaction paths.</li>
          </ul>
          <p className="text-xs text-white/50">
            Note: Analytics tracking scripts are strictly subject to your consent choices in accordance with our <Link href="/cookie-policy" className="text-[#16C7FF] hover:text-[#60D6FF] underline font-semibold">Cookie Policy</Link>.
          </p>
        </div>
      </section>

      {/* 3. How We Use Information */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          3. How We Use Information
        </h2>
        <p>
          BrandHive Studio uses collected information solely for legitimate operational and business purposes, specifically:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-white/75">
          <li><strong className="text-white">Project Consultation &amp; Scoping:</strong> Evaluating incoming project specifications, crafting accurate quotations, and preparing tailored proposals.</li>
          <li><strong className="text-white">Service Delivery:</strong> Designing, engineering, and delivering client projects according to agreed briefs.</li>
          <li><strong className="text-white">Client Communication:</strong> Responding to client enquiries, scheduling meetings, and sending milestone or administrative updates.</li>
          <li><strong className="text-white">Invoicing &amp; Records:</strong> Processing invoices, tracking milestone payments, and fulfilling accounting requirements.</li>
          <li><strong className="text-white">Website Performance:</strong> Analyzing traffic trends to diagnose technical issues, optimize loading speeds, and enhance overall user experience.</li>
          <li><strong className="text-white">Security &amp; Compliance:</strong> Protecting our website, assets, and visitors against fraudulent activity or unauthorized system abuse.</li>
        </ul>
      </section>

      {/* 4. Contact & Enquiry Forms */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          4. Contact &amp; Enquiry Forms
        </h2>
        <p>
          When you fill out our contact form at <strong className="text-white">/contact</strong>, the information you supply is transmitted securely to our designated communications channels.
        </p>
        <p>
          We do not sell, rent, lease, or distribute contact form submissions to third-party data brokers, advertising networks, or unauthorized third parties. Form data is used exclusively by BrandHive Studio team members to address your inquiries and manage your request.
        </p>
      </section>

      {/* 5. AI-Assisted Communication */}
      <section className="space-y-4 rounded-2xl bg-[#11161C]/60 p-6 sm:p-7 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#16C7FF] shadow-[0_0_10px_#16C7FF]" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            5. AI-Assisted Communication
          </h2>
        </div>
        <p>
          BrandHive Studio may use artificial intelligence and automation systems to assist with:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-white/75">
          <li>customer enquiries</li>
          <li>general service information</li>
          <li>lead qualification</li>
          <li>FAQs</li>
          <li>customer communication</li>
          <li>business workflows</li>
          <li>initial project discovery</li>
        </ul>
        <p>
          Information voluntarily provided during AI-assisted conversations may be processed by systems used to provide that communication.
        </p>
        <p>
          Human assistance may be requested for:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-white/75">
          <li>refund or cancellation disputes</li>
          <li>payment disputes</li>
          <li>complaints</li>
          <li>legal or contractual matters</li>
          <li>complex custom projects</li>
          <li>sensitive matters</li>
          <li>exceptions to standard policies</li>
          <li>requests requiring a human decision</li>
        </ul>
        <p className="text-sm font-semibold text-white/90 pt-1">
          AI must never falsely claim that a human reviewed or approved something when that has not actually occurred.
        </p>
      </section>

      {/* 6. Third-Party Services */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          6. Third-Party Services
        </h2>
        <p>
          To maintain high reliability, security, and performance, BrandHive Studio utilizes trusted third-party cloud infrastructure, database hosting, email dispatching, and analytical services.
        </p>
        <p>
          We do not claim third-party providers that are not actually implemented on our platform. Third-party infrastructure partners are contractually required to maintain high standards of security and confidentiality and may process technical data solely to facilitate the delivery of our website and services.
        </p>
      </section>

      {/* 7. Cookies & Similar Technologies */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          7. Cookies &amp; Similar Technologies
        </h2>
        <p>
          Our website utilizes cookies and similar local storage technologies to ensure essential site operation, remember your preferences, and anonymously measure website traffic.
        </p>
        <p>
          You have full control over non-essential cookies on our website. Please review our comprehensive{" "}
          <Link href="/cookie-policy" className="text-[#16C7FF] hover:text-[#60D6FF] underline font-semibold">
            Cookie Policy
          </Link>{" "}
          for detailed categorization, instructions on modifying preferences, or revoking consent at any time.
        </p>
      </section>

      {/* 8. Data Security */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          8. Data Security
        </h2>
        <p>
          We implement rigorous technical and organizational security measures to protect your personal information against unauthorized access, loss, alteration, or disclosure. All web traffic between your browser and our website is encrypted using industry-standard Transport Layer Security (TLS/HTTPS).
        </p>
        <p>
          Access to internal client records, briefs, and communication records is restricted strictly to authorized BrandHive Studio personnel who require the data to fulfill client agreements.
        </p>
      </section>

      {/* 9. Data Retention */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          9. Data Retention
        </h2>
        <p>
          Personal information is retained only for as long as necessary to fulfill the purposes for which it was originally collected, including the duration of our client relationship, project warranty periods, dispute resolution, and compliance with statutory financial and legal obligations. When information is no longer needed, it is deleted or permanently anonymized.
        </p>
      </section>

      {/* 10. Personal Data Requests */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          10. Personal Data Requests
        </h2>
        <p>
          You may request access to, correction of, or deletion of any personal data that BrandHive Studio holds regarding you. You may also object to or request restrictions on certain processing activities.
        </p>
        <p>
          To submit a personal data request, please email our administrative team at{" "}
          <a href="mailto:info@brandhivestudio.com.lk" className="text-[#16C7FF] hover:text-[#60D6FF] font-semibold underline">
            info@brandhivestudio.com.lk
          </a>
          . We verify the identity of requestors before fulfilling data requests and will respond promptly within reasonable legal timeframes.
        </p>
      </section>

      {/* 11. Third-Party Websites */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          11. Third-Party Websites
        </h2>
        <p>
          Our website and portfolio case studies may contain external links to client websites, third-party software, or partner platforms. BrandHive Studio has no control over the privacy practices, content, or policies of external sites. We encourage you to review the individual privacy policies of any third-party websites you visit.
        </p>
      </section>

      {/* 12. Children's Privacy */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          12. Children&apos;s Privacy
        </h2>
        <p>
          Our website and professional agency services are intended exclusively for commercial entities, business owners, and individuals of legal age. We do not knowingly collect, solicit, or maintain personal information from individuals under the age of 18.
        </p>
      </section>

      {/* 13. Changes to This Policy */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          13. Changes to This Policy
        </h2>
        <p>
          BrandHive Studio reserves the right to update or amend this Privacy Policy periodically to reflect technological advances, service modifications, or regulatory requirements. Any revisions will be published on this page with an updated &ldquo;Last Updated&rdquo; date. We encourage visitors to review this page periodically.
        </p>
      </section>

      {/* 14. Contact BrandHive Studio */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2.5">
          14. Contact BrandHive Studio
        </h2>
        <p>
          If you have questions, feedback, or concerns regarding this Privacy Policy or how your personal information is handled, please contact our team directly:
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
