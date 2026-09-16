export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}

export const fallbackFaqs: PublicFaq[] = [
  {
    id: "faq_seed_01",
    question: "What services does BrandHive Studio specialize in?",
    answer:
      "BrandHive Studio specializes in comprehensive Brand Strategy & Visual Identity, Custom Website Design & Next.js Development, UI/UX Design Systems, and Growth Marketing & SEO engineered to scale modern luxury, tech, and enterprise businesses.",
    category: "Services",
    displayOrder: 1,
  },
  {
    id: "faq_seed_02",
    question: "How long does a typical branding or website project take?",
    answer:
      "Comprehensive brand identity projects generally require 2–4 weeks. Complete bespoke website design and Next.js development projects typically take 4–6 weeks, depending on project complexity, custom feature requirements, and client review cycles.",
    category: "Timeline",
    displayOrder: 2,
  },
  {
    id: "faq_seed_03",
    question: "How does your project collaboration and design process work?",
    answer:
      "We operate on a transparent 5-stage framework: Discovery, Strategy, Design, Development, and Launch. Clients receive dedicated sprint updates, interactive Figma walkthroughs, and clear milestone sign-offs at each phase.",
    category: "Process",
    displayOrder: 3,
  },
  {
    id: "faq_seed_04",
    question: "How do you structure project pricing and payment terms?",
    answer:
      "We provide clear, fixed-scope proposals tailored to your specific project goals. Payments are typically split into structured milestones: a project kick-off deposit, an intermediate review milestone, and a final launch sign-off.",
    category: "Pricing",
    displayOrder: 4,
  },
  {
    id: "faq_seed_05",
    question: "Can you redesign or migrate an existing website?",
    answer:
      "Yes. We specialize in transforming outdated websites into ultra-fast, modern Next.js web applications with responsive aesthetics, sub-second load times, technical SEO compliance, and modern headless CMS integration.",
    category: "Development",
    displayOrder: 5,
  },
  {
    id: "faq_seed_06",
    question: "Do you provide post-launch maintenance and technical support?",
    answer:
      "Absolutely. We offer dedicated post-launch support, managed cloud hosting maintenance, continuous security updates, and flexible monthly retainer agreements for ongoing feature iteration and growth marketing.",
    category: "Support",
    displayOrder: 6,
  },
];
