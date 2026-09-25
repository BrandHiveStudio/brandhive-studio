import { Metadata } from "next";
import PolicyLayout from "@/components/legal/PolicyLayout";
import OpenCookieSettingsButton from "@/components/privacy/OpenCookieSettingsButton";

export const metadata: Metadata = {
  title: "Cookie Policy | BrandHive Studio",
  description: "Learn how BrandHive Studio uses cookies and similar technologies on its website.",
  alternates: {
    canonical: "https://www.brandhivestudio.com.lk/cookie-policy",
  },
  openGraph: {
    title: "Cookie Policy | BrandHive Studio",
    description: "Learn how BrandHive Studio uses cookies and similar technologies on its website.",
    url: "https://www.brandhivestudio.com.lk/cookie-policy",
    type: "website",
  },
};

export default function CookiePolicyPage() {
  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle="How BrandHive Studio may use cookies and similar technologies."
      lastUpdated="July 2026"
    >
      {/* 1. What Are Cookies? */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          1. What Are Cookies?
        </h2>
        <p>
          Cookies are small text files placed on your computer, tablet, or mobile phone by websites that you visit. They are widely used across the internet to allow websites to function properly, remember user preferences, facilitate navigation, and provide analytical insights to website owners.
        </p>
        <p>
          In addition to standard HTTP cookies, similar storage technologies—such as browser local storage and session storage—may be used to maintain your selected website preferences without transmitting tracking identifiers.
        </p>
      </section>

      {/* 2. Types of Technologies */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          2. Types of Technologies &amp; Cookie Categories
        </h2>
        <p>
          BrandHive Studio categorizes cookies and browser technologies into the following four distinct classifications:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Essential */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-[#0F172A]">Essential Cookies</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  Always Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Essential for core website operation, security, network routing, and load balancing. The website cannot function correctly without these technologies, and they do not store personally identifiable marketing information.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Retention: Session / Persistent
            </div>
          </div>

          {/* Analytics */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-[#0F172A]">Analytics Cookies</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-[#0284C7] border border-cyan-200 text-[10px] font-bold uppercase tracking-wider">
                  Consent Gated (ON / OFF)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Help us understand how visitors interact with our pages, identify popular portfolio case studies, and measure page load speeds. They are loaded strictly after you give explicit consent.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Provider: Google Analytics (G-S2Z1B36031)
            </div>
          </div>

          {/* Preferences */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-[#0F172A]">Preferences</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  Optional (ON / OFF)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Remember your specific interaction choices (such as UI sound toggles, animations, or cookie banner choices) so your preferred experience is maintained on return visits.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Retention: Local Browser Storage
            </div>
          </div>

          {/* Marketing */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-[#0F172A]">Marketing Cookies</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  Optional (ON / OFF)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Used to track visitors across websites to display relevant promotional material. Marketing cookies are not claimed as active unless specifically implemented and enabled.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Status: Inactive by Default
            </div>
          </div>
        </div>
      </section>

      {/* 3. Google Analytics */}
      <section className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#12BDF7]" />
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            3. Google Analytics Integration
          </h2>
        </div>
        <p>
          The production BrandHive Studio website utilizes Google Analytics with Measurement ID: <strong className="font-mono text-xs bg-slate-200/80 px-2 py-0.5 rounded text-[#0F172A]">G-S2Z1B36031</strong>.
        </p>
        <p>
          In accordance with international privacy principles, <strong>Google Analytics MUST NOT load and does not execute before you provide explicit Analytics consent</strong>. When analytics consent is refused or not yet provided, no analytics tracking scripts or measurement requests are transmitted to Google servers.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Google Analytics collects aggregate, anonymized metrics including page views, visit duration, device characteristics, and referral channels to help us improve the layout and technical performance of our website.
        </p>
      </section>

      {/* 4. Third-Party Cookies */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          4. Third-Party Cookies
        </h2>
        <p>
          Some third-party tools embedded on or linked from our website (such as external video embeds, font libraries, or social network sharing buttons) may independently set cookies. We do not control these third-party cookies directly; their use is governed by the respective third-party provider&apos;s privacy and cookie policies.
        </p>
      </section>

      {/* 5. Managing Your Preferences */}
      <section className="space-y-5 rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
          5. Managing Your Cookie Preferences
        </h2>
        <p>
          You have complete autonomy over optional cookies. You can review, modify, or revoke your cookie choices at any time using our preference interface below:
        </p>
        
        <div className="pt-2">
          <OpenCookieSettingsButton />
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
          Additionally, you can configure your web browser (Chrome, Safari, Firefox, Edge) to block or delete cookies across all websites. Please refer to your browser&apos;s official help documentation for browser-level cookie management.
        </p>
      </section>

      {/* 6. Changes to This Cookie Policy */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          6. Changes to This Cookie Policy
        </h2>
        <p>
          We may update this Cookie Policy from time to time to accommodate technical developments or legal standards. Revisions will be published on this page with an updated &ldquo;Last Updated&rdquo; date.
        </p>
      </section>

      {/* 7. Contact */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight border-b border-slate-200 pb-2">
          7. Contact
        </h2>
        <p>
          If you have questions regarding our use of cookies or tracking technologies, please contact:
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
