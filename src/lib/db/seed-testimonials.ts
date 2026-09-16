import { db } from "./index";
import { testimonials } from "./schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const initialTestimonials = [
  {
    id: "testi_uzee_tech",
    clientName: "Umar Farook",
    company: "UZEE TECH",
    role: "Founder",
    review: "BrandHive Studio completely transformed our brand. Their creativity, professionalism and attention to detail are unmatched.",
    logoUrl: "/images/portfolio/UZEE TECH/01 Logo/logo-icon.png",
    avatarUrl: null,
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "testi_leo_villas",
    clientName: "Ajay Kumar",
    company: "Leo Villas",
    role: "Owner",
    review: "They understood our vision perfectly and delivered a brand identity that truly represents who we are.",
    logoUrl: "/images/portfolio/Leo Villas/01 Logo Design/Leo_Villas_Official_Logo.png",
    avatarUrl: null,
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "testi_seya_beauty",
    clientName: "Natasha Silva",
    company: "Seya Beauty Studio",
    role: "Founder",
    review: "Amazing team, great communication and outstanding results. Highly recommended!",
    logoUrl: "/images/portfolio/Seya Beauty Studio/01 Logo Design/Seya_Beauty_Studio_Logo_Light.png",
    avatarUrl: null,
    displayOrder: 3,
    isPublished: true,
  },
];

async function seedTestimonials() {
  console.log("🌱 Seeding initial testimonials into Turso database...");
  for (const t of initialTestimonials) {
    const existing = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(eq(testimonials.id, t.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(testimonials).values(t);
      console.log(`  ✓ Inserted testimonial: "${t.clientName}" (${t.company})`);
    } else {
      console.log(`  - Testimonial for "${t.clientName}" already exists.`);
    }
  }
  console.log("✅ Testimonials seeding complete.");
}

seedTestimonials().catch(console.error);
