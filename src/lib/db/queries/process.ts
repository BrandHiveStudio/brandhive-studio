import { db } from "@/lib/db";
import { processSteps } from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";
import type { ProcessStep, NewProcessStep } from "@/lib/db/schema";

export interface PublicProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  shortTitle: string;
  badge: string;
  shortDescription: string;
  description: string;
  icon: string;
  imageUrl: string;
  deliverables: string[];
  displayOrder: number;
  isPublished: boolean;
}

export const fallbackProcessSteps: PublicProcessStep[] = [
  {
    id: "step_seed_01",
    stepNumber: "01",
    shortTitle: "Discover",
    title: "Discovery & Audits",
    badge: "RESEARCH & COMPASS",
    shortDescription: "We learn about your business, audience, and goals.",
    description:
      "We start by learning about your business. We audit your visual style, study your target audience, identify competitor gaps, and build a strategic blueprint to guide all future steps.",
    icon: "search",
    imageUrl: "/images/process/discovery/process-discovery-workshop.webp",
    deliverables: [
      "Competitor Visual Audits",
      "Target Audience Profiles",
      "Strategic Strategy Blueprint",
      "Project Scope Mapping",
    ],
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "step_seed_02",
    stepNumber: "02",
    shortTitle: "Strategy",
    title: "Strategy & Creative Direction",
    badge: "BLUEPRINTING",
    shortDescription: "We create a solid plan and creative direction.",
    description:
      "We map out the core visuals and user journey. We choose corporate color palettes, typographies, design structures, moodboards, and build low-fidelity wireframes to finalize the direction.",
    icon: "strategy",
    imageUrl: "/images/process/strategy/process-brand-strategy.webp",
    deliverables: [
      "Moodboards & Aesthetics",
      "Bespoke Color Palettes",
      "User Journey Mapping",
      "Wireframe Architecture",
    ],
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "step_seed_03",
    stepNumber: "03",
    shortTitle: "Design",
    title: "Visual Design & Prototyping",
    badge: "CREATION PHASE",
    shortDescription: "We craft stunning designs that communicate.",
    description:
      "We design high-fidelity components, custom mockups, packaging structures, and corporate page layouts. We link them into interactive prototypes so you can click and test before coding starts.",
    icon: "design",
    imageUrl: "/images/process/design/process-ui-design-process.webp",
    deliverables: [
      "Corporate Layout Designs",
      "Packaging & Print Mockups",
      "Interactive Prototypes",
      "Design Systems Hand-off",
    ],
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "step_seed_04",
    stepNumber: "04",
    shortTitle: "Develop",
    title: "High Performance Web Development",
    badge: "ENGINEERING",
    shortDescription: "We build, refine and perfect every detail.",
    description:
      "We translate approved designs into clean code. We build using modern technologies, optimize assets, create fluid custom transitions, implement responsive sizing, and perform cross-browser tests.",
    icon: "code",
    imageUrl: "/images/process/development/process-development-workflow.webp",
    deliverables: [
      "Semantic Code structures",
      "Asset Optimizations Pass",
      "Subtle Custom Animations",
      "Cross-Browser Quality Checks",
    ],
    displayOrder: 4,
    isPublished: true,
  },
  {
    id: "step_seed_05",
    stepNumber: "05",
    shortTitle: "Launch",
    title: "Deployment & Quality Checks",
    badge: "LAUNCH TIME",
    shortDescription: "We launch your brand and help you grow.",
    description:
      "We run final page optimizations. We verify site loading speeds, audit Accessibility configurations, set up SEO tags, establish domain routing, and launch your brand platform safely.",
    icon: "launch",
    imageUrl: "/images/process/launch/process-launch-checklist.webp",
    deliverables: [
      "Cross-Device UI Verification",
      "SEO Metadata Final Checks",
      "Domain & DNS Routing",
      "Google Analytics & Tags Setups",
    ],
    displayOrder: 5,
    isPublished: true,
  },
];

/**
 * Public: Fetches all published process steps ordered by displayOrder.
 * Safely falls back to verified static data if database is empty or unreachable.
 */
export async function getPublishedProcessSteps(): Promise<PublicProcessStep[]> {
  try {
    const records = await db
      .select()
      .from(processSteps)
      .where(eq(processSteps.isPublished, true))
      .orderBy(asc(processSteps.displayOrder));

    if (!records || records.length === 0) {
      return fallbackProcessSteps;
    }

    return records.map((r) => {
      let deliverablesList: string[] = [];
      try {
        deliverablesList = r.deliverables ? JSON.parse(r.deliverables) : [];
      } catch {
        deliverablesList = [];
      }

      return {
        id: r.id,
        stepNumber: r.stepNumber || "01",
        title: r.title,
        shortTitle: r.shortTitle || r.title,
        badge: r.badge || "WORKFLOW",
        shortDescription: r.shortDescription || r.description.slice(0, 100),
        description: r.description,
        icon: r.icon || "search",
        imageUrl: r.imageUrl || "/images/process/discovery/process-discovery-workshop.webp",
        deliverables: deliverablesList,
        displayOrder: r.displayOrder ?? 0,
        isPublished: Boolean(r.isPublished),
      };
    });
  } catch (error) {
    console.warn("⚠️ Failed to load process steps from Turso. Using static fallbacks:", error);
    return fallbackProcessSteps;
  }
}

export interface GetAllProcessStepsFilter {
  search?: string;
  isPublished?: boolean;
}

/**
 * Admin: Fetches all process steps with optional search & publish filter.
 */
export async function getAllProcessSteps(
  filter?: GetAllProcessStepsFilter
): Promise<ProcessStep[]> {
  try {
    const conditions = [];

    if (filter?.search && filter.search.trim()) {
      const term = `%${filter.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${processSteps.title})`, term),
          like(sql`lower(${processSteps.shortTitle})`, term),
          like(sql`lower(${processSteps.badge})`, term),
          like(sql`lower(${processSteps.description})`, term),
          like(sql`lower(${processSteps.stepNumber})`, term)
        )
      );
    }

    if (filter?.isPublished !== undefined) {
      conditions.push(eq(processSteps.isPublished, filter.isPublished));
    }

    let query = db.select().from(processSteps);

    if (conditions.length > 0) {
      // @ts-expect-error Drizzle multiple conditions
      query = query.where(and(...conditions));
    }

    const records = await query.orderBy(asc(processSteps.displayOrder));
    return records;
  } catch (error) {
    console.error("Error in getAllProcessSteps query:", error);
    throw error;
  }
}

/**
 * Admin: Get single process step by ID.
 */
export async function getProcessStepById(id: string): Promise<ProcessStep | null> {
  const [item] = await db
    .select()
    .from(processSteps)
    .where(eq(processSteps.id, id))
    .limit(1);

  return item || null;
}

/**
 * Admin: Create a new process step.
 */
export async function createProcessStep(
  data: Omit<NewProcessStep, "id" | "createdAt" | "updatedAt">
): Promise<ProcessStep> {
  const id = `proc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const [item] = await db
    .insert(processSteps)
    .values({
      id,
      stepNumber: data.stepNumber.trim(),
      title: data.title.trim(),
      shortTitle: data.shortTitle ? data.shortTitle.trim() : data.title.trim(),
      badge: data.badge ? data.badge.trim() : "WORKFLOW",
      shortDescription: data.shortDescription ? data.shortDescription.trim() : null,
      description: data.description.trim(),
      icon: data.icon ? data.icon.trim() : "search",
      imageUrl: data.imageUrl ? data.imageUrl.trim() : null,
      deliverables: Array.isArray(data.deliverables)
        ? JSON.stringify(data.deliverables)
        : typeof data.deliverables === "string"
        ? data.deliverables.trim()
        : "[]",
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished ?? true,
      createdAt: sql`(unixepoch())`,
      updatedAt: sql`(unixepoch())`,
    })
    .returning();

  return item;
}

/**
 * Admin: Update an existing process step.
 */
export async function updateProcessStep(
  id: string,
  data: Partial<NewProcessStep>
): Promise<ProcessStep | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: sql`(unixepoch())`,
  };

  if (data.stepNumber !== undefined) updatePayload.stepNumber = data.stepNumber.trim();
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.shortTitle !== undefined) updatePayload.shortTitle = data.shortTitle?.trim() || null;
  if (data.badge !== undefined) updatePayload.badge = data.badge?.trim() || null;
  if (data.shortDescription !== undefined) updatePayload.shortDescription = data.shortDescription?.trim() || null;
  if (data.description !== undefined) updatePayload.description = data.description.trim();
  if (data.icon !== undefined) updatePayload.icon = data.icon?.trim() || "search";
  if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl?.trim() || null;
  if (data.deliverables !== undefined) {
    updatePayload.deliverables = Array.isArray(data.deliverables)
      ? JSON.stringify(data.deliverables)
      : typeof data.deliverables === "string"
      ? data.deliverables.trim()
      : "[]";
  }
  if (data.displayOrder !== undefined) updatePayload.displayOrder = data.displayOrder;
  if (data.isPublished !== undefined) updatePayload.isPublished = data.isPublished;

  const [updated] = await db
    .update(processSteps)
    .set(updatePayload)
    .where(eq(processSteps.id, id))
    .returning();

  return updated || null;
}

/**
 * Admin: Delete a process step.
 */
export async function deleteProcessStep(id: string): Promise<boolean> {
  const result = await db.delete(processSteps).where(eq(processSteps.id, id));
  return Boolean(result);
}

/**
 * Admin: Quick toggle publish status.
 */
export async function toggleProcessStepPublished(id: string): Promise<ProcessStep | null> {
  const existing = await getProcessStepById(id);
  if (!existing) return null;

  const [updated] = await db
    .update(processSteps)
    .set({
      isPublished: !existing.isPublished,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(processSteps.id, id))
    .returning();

  return updated || null;
}
