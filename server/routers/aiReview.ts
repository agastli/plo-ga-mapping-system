/**
 * AI Mapping Review Assistant — tRPC Router
 *
 * Provides procedures for:
 *  - generateReview  : reads program data from DB, calls LLM, returns per-competency proposals
 *  - saveReview      : persists a review session (draft or finalised)
 *  - getReviewHistory: lists past reviews for a program
 *  - getReview       : retrieves a single review by id
 *  - applyItem       : accepts one AI proposal and writes it to mappings/justifications tables
 *  - finaliseReview  : marks a review as finalised
 *
 * Access: admin only (adminProcedure)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

// ─── Shared Zod schemas ────────────────────────────────────────────────────────

const disciplineEnum = z.enum([
  "engineering", "architecture", "business", "health",
  "education", "humanities", "science", "law", "other",
]);

const reviewModeEnum = z.enum(["conservative", "standard", "expert"]);

const verdictEnum = z.enum(["Strong", "Acceptable", "Weak", "Artificial", "Missing"]);
const actionEnum = z.enum(["Keep", "Improve Justification", "Revise Weight", "Remove Mapping"]);
const confidenceEnum = z.enum(["High", "Medium", "Low"]);

const reviewItemSchema = z.object({
  competencyCode: z.string(),
  competencyName: z.string(),
  gaCode: z.string(),
  currentMappedPLOs: z.array(z.object({
    ploCode: z.string(),
    weight: z.number(),
  })),
  currentWeightSum: z.number(),
  currentJustification: z.string().nullable(),
  // Validation layer results (deterministic, pre-LLM)
  validationIssues: z.array(z.string()),
  // AI-generated proposals
  mappingVerdict: verdictEnum,
  recommendedAction: actionEnum,
  improvedJustification: z.string().nullable(),
  suggestedWeightAdjustment: z.string().nullable(), // e.g. "Change PLO2 from 0.3 to 0.5"
  reviewerComment: z.string(),
  confidenceLevel: confidenceEnum,
  reasoning: z.string(), // internal chain-of-thought, stored but not shown in UI
});

export type ReviewItem = z.infer<typeof reviewItemSchema>;

// ─── QU Methodology system prompt (embedded from the guide) ───────────────────

const QU_METHODOLOGY_SYSTEM_PROMPT = `You are an expert academic quality assurance reviewer specialising in mapping Program Learning Outcomes (PLOs) to Qatar University's Graduate Attributes (GAs) and their 21 supporting competencies.

## QU Graduate Attributes Framework

**GA1 — Competent** (4 competencies)
- C1-1: Subject-matter mastery — Deep and accurate knowledge of the discipline's core theories, principles, and methods.
- C1-2: Critical-thinking skills — The ability to analyse information objectively, evaluate evidence, and form reasoned judgments.
- C1-3: Problem-solving skills — The systematic process of identifying a problem, generating potential solutions, and implementing the most effective one.
- C1-4: Research and adaptive thinking — The ability to find, evaluate, and apply new knowledge, and to think creatively beyond established methods.

**GA2 — Life-long Learner** (4 competencies)
- C2-1: Self-awareness — Understanding one's own strengths, limitations, values, and their impact on others.
- C2-2: Adaptability — The ability to adjust effectively to new conditions, tools, requirements, or changing environments.
- C2-3: Adaptive thinking — Generating new ideas, frameworks, or approaches when standard methods are insufficient.
- C2-4: Desire for life-long learning — The intrinsic motivation to continuously update knowledge and skills throughout one's career.

**GA3 — Well-Rounded** (3 competencies)
- C3-1: Cultured — A broad awareness of history, arts, and diverse human experiences, and an appreciation of cultural differences.
- C3-2: Effective communication — The ability to convey technical and non-technical information clearly and persuasively in writing, speech, and visuals.
- C3-3: Awareness of local and international issues — Understanding the social, environmental, economic, and geopolitical challenges at both local and global scales.

**GA4 — Ethically and Socially Responsible** (5 competencies)
- C4-1: Arabic-Islamic identity — Embodying the values, ethics, and cultural heritage of the Arab-Islamic civilisation.
- C4-2: Embrace diversity — Respecting and valuing differences in culture, background, gender, and perspective within a professional environment.
- C4-3: Professional and ethical conduct — Adherence to professional codes of ethics and demonstrating honesty and responsibility in all professional contexts.
- C4-4: Civically engaged — Active participation in the betterment of one's community through professional or voluntary contributions.
- C4-5: Community and global engagement — Contributing to the well-being of local and global communities and participating in global professional networks.

**GA5 — Entrepreneurial** (5 competencies)
- C5-1: Creativity and innovation — Generating original ideas and novel solutions that add value or solve problems in new ways.
- C5-2: Collaborative — Working productively with others toward a shared goal, respecting the contributions and expertise of all team members.
- C5-3: Management — The ability to plan, organise, and coordinate resources and tasks to achieve objectives efficiently.
- C5-4: Interpersonal — Building and maintaining positive and effective professional relationships, demonstrating empathy and emotional intelligence.
- C5-5: Leadership — Inspiring and guiding others toward a shared vision, taking initiative, and accepting responsibility for outcomes.

## The 4-Step Mapping Methodology

**Step 1 — Understand the competency.** You must have a clear, practical understanding of the competency's meaning before evaluating any mapping.

**Step 2 — Identify explicit links.** The connection between a PLO and a competency must be direct and obvious from the text of the PLO. Do not infer weak or indirect connections.

**Step 3 — Evaluate weights.** The weight reflects how strongly and directly a PLO contributes to a competency. The sum of all weights for a single competency must equal exactly 0 or 1. No other sums are permitted.
- Weight = 1.0: A single PLO fully and comprehensively addresses the competency on its own.
- Weight = 0.5/0.5: Two PLOs each contribute a distinct and roughly equal dimension.
- Weight = 0.7/0.3 (or other unequal splits): Two or more PLOs contribute, but one is clearly the primary driver.
- Weight = 0: No PLO explicitly addresses the competency. This is a valid finding (curriculum gap), not an error.

**Step 4 — Evaluate justifications.** A strong justification must:
- Quote the specific language from the PLO text as evidence.
- Explain how the selected PLO(s) develop the competency.
- Show clear educational logic.
- Avoid generic language like "this PLO aligns with this competency."

## Review Modes

**Conservative:** Accept only explicit, unambiguous alignments. Reject any mapping where the connection is not stated directly in the PLO text.

**Standard (default):** Accept explicit alignments and discipline-valid implicit alignments when well justified. For example, in engineering, "experimentation" may imply inquiry; in architecture, "design" may imply problem solving.

**Expert Flexible:** Allow broader discipline-based interpretation for design-heavy or interdisciplinary programs where competencies may be embedded in practice.

## Verdict Categories

- **Strong:** The PLO explicitly and directly addresses the competency. The weight is well-proportioned. The justification quotes PLO language and explains the connection clearly.
- **Acceptable:** The mapping is valid but the justification is generic or the weight could be better calibrated. Improvement recommended.
- **Weak:** The connection between the PLO and competency is indirect, inferred, or poorly justified. Revision required.
- **Artificial:** The mapping appears to have been created to inflate coverage rather than reflecting a genuine educational connection. Removal recommended.
- **Missing:** No PLO in the program explicitly addresses this competency. This is a curriculum gap finding.

## Output Format

Return a JSON array with exactly one object per competency (all 21 competencies must be present). Each object must have these fields:
- competencyCode: string (e.g. "C1-1")
- mappingVerdict: "Strong" | "Acceptable" | "Weak" | "Artificial" | "Missing"
- recommendedAction: "Keep" | "Improve Justification" | "Revise Weight" | "Remove Mapping"
- improvedJustification: string | null (null if verdict is Strong or Missing)
- suggestedWeightAdjustment: string | null (null if no weight change needed)
- reviewerComment: string (1-3 sentences explaining the verdict)
- confidenceLevel: "High" | "Medium" | "Low"
- reasoning: string (your internal chain-of-thought, 2-5 sentences)

Do not include any text outside the JSON array.`;

// ─── Deterministic validation (no LLM) ────────────────────────────────────────

function validateMappingRules(
  competencyCode: string,
  mappedPLOs: { ploCode: string; weight: number }[],
  justification: string | null,
): string[] {
  const issues: string[] = [];
  const weightSum = mappedPLOs.reduce((s, m) => s + m.weight, 0);
  const rounded = Math.round(weightSum * 100) / 100;

  if (mappedPLOs.length > 0 && rounded !== 0 && rounded !== 1) {
    issues.push(`Weight sum is ${rounded.toFixed(2)} — must be exactly 0 or 1.`);
  }
  if (mappedPLOs.length > 0 && rounded > 0 && (!justification || justification.trim().length < 20)) {
    issues.push("Mapping exists but justification is missing or too short.");
  }
  if (mappedPLOs.length === 0 && justification && justification.trim().length > 0) {
    issues.push("Justification exists but no PLO is mapped to this competency.");
  }
  if (mappedPLOs.length > 4) {
    issues.push(`${mappedPLOs.length} PLOs mapped — possible overmapping (more than 4 PLOs for one competency).`);
  }
  return issues;
}

// ─── Build the user message from DB data ──────────────────────────────────────

function buildUserMessage(
  programName: string,
  discipline: string,
  reviewMode: string,
  language: string,
  plos: { code: string; descriptionEn: string | null; descriptionAr: string | null }[],
  competencyData: {
    competencyCode: string;
    competencyName: string;
    gaCode: string;
    mappedPLOs: { ploCode: string; weight: number }[];
    justification: string | null;
  }[],
): string {
  const ploList = plos
    .map(p => `${p.code}: ${language === "ar" ? (p.descriptionAr || p.descriptionEn || "") : (p.descriptionEn || p.descriptionAr || "")}`)
    .join("\n");

  const mappingList = competencyData
    .map(c => {
      const mappingStr = c.mappedPLOs.length > 0
        ? c.mappedPLOs.map(m => `${m.ploCode}=${m.weight}`).join(", ")
        : "No mapping (weight sum = 0)";
      const justStr = c.justification ? `"${c.justification}"` : "No justification provided.";
      return `${c.competencyCode} (${c.competencyName}):\n  Mapped PLOs: ${mappingStr}\n  Justification: ${justStr}`;
    })
    .join("\n\n");

  return `Program: ${programName}
Discipline: ${discipline}
Review Mode: ${reviewMode}
Language: ${language === "ar" ? "Arabic" : "English"}

## Program Learning Outcomes (PLOs)
${ploList}

## Current Mappings and Justifications
${mappingList}

Please review all 21 competencies above against the QU methodology guide and return the JSON array as instructed.`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const aiReviewRouter = router({

  /**
   * Generate a new AI review for a program.
   * Reads all data from DB, runs validation, calls LLM, returns structured proposals.
   * Does NOT save to DB — the client calls saveReview after the user reviews.
   */
  generateReview: adminProcedure
    .input(z.object({
      programId: z.number(),
      discipline: disciplineEnum,
      reviewMode: reviewModeEnum,
    }))
    .mutation(async ({ input }) => {
      // 1. Load program data
      const program = await db.getProgramById(input.programId);
      if (!program) throw new TRPCError({ code: "NOT_FOUND", message: "Program not found." });

      const plos = await db.getPLOsByProgram(input.programId);
      if (plos.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This program has no PLOs. Please add PLOs before running an AI review." });
      }

      // 2. Load all competencies with their GA codes
      const allCompetencies = await db.getAllCompetencies();
      const allGAs = await db.getAllGraduateAttributes();
      const gaMap = new Map(allGAs.map(g => [g.id, g.code]));

      // 3. Load all mappings for this program
      const allMappings = await db.getMappingsByProgram(input.programId);
      const allJustifications = await db.getJustificationsByProgram(input.programId);

      // Build lookup maps
      const ploMap = new Map(plos.map(p => [p.id, p]));
      // getJustificationsByProgram returns { justification, ga, competency } objects
      const justMap = new Map(
        allJustifications.map(j => [`${j.justification.competencyId}`, j.justification])
      );

      // 4. Build per-competency data + run validation
      const competencyData: ReviewItem[] = [];

      for (const comp of allCompetencies) {
        const gaCode = gaMap.get(comp.gaId) ?? "GA?";
        // getMappingsByProgram returns { mapping, plo, competency } objects
        const compMappings = allMappings.filter(m => m.mapping.competencyId === comp.id);
        const mappedPLOs = compMappings.map(m => ({
          ploCode: m.plo.code,
          weight: m.mapping.weight,
        }));
        const weightSum = mappedPLOs.reduce((s, m) => s + m.weight, 0);
        const jKey = `${comp.id}`;
        const justRow = justMap.get(jKey);
        const justification = justRow?.textEn ?? justRow?.textAr ?? null;

        const validationIssues = validateMappingRules(comp.code, mappedPLOs, justification);

        competencyData.push({
          competencyCode: comp.code,
          competencyName: comp.nameEn,
          gaCode,
          currentMappedPLOs: mappedPLOs,
          currentWeightSum: Math.round(weightSum * 100) / 100,
          currentJustification: justification,
          validationIssues,
          // Placeholders — will be filled by LLM
          mappingVerdict: "Acceptable",
          recommendedAction: "Keep",
          improvedJustification: null,
          suggestedWeightAdjustment: null,
          reviewerComment: "",
          confidenceLevel: "Medium",
          reasoning: "",
        });
      }

      // 5. Build prompt and call LLM
      const userMessage = buildUserMessage(
        program.nameEn,
        input.discipline,
        input.reviewMode,
        program.language,
        plos,
        competencyData.map(c => ({
          competencyCode: c.competencyCode,
          competencyName: c.competencyName,
          gaCode: c.gaCode,
          mappedPLOs: c.currentMappedPLOs,
          justification: c.currentJustification,
        })),
      );

      const llmResponse = await invokeLLM({
        messages: [
          { role: "system", content: QU_METHODOLOGY_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "mapping_review",
            strict: true,
            schema: {
              type: "object",
              properties: {
                reviews: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      competencyCode: { type: "string" },
                      mappingVerdict: { type: "string", enum: ["Strong", "Acceptable", "Weak", "Artificial", "Missing"] },
                      recommendedAction: { type: "string", enum: ["Keep", "Improve Justification", "Revise Weight", "Remove Mapping"] },
                      improvedJustification: { type: ["string", "null"] },
                      suggestedWeightAdjustment: { type: ["string", "null"] },
                      reviewerComment: { type: "string" },
                      confidenceLevel: { type: "string", enum: ["High", "Medium", "Low"] },
                      reasoning: { type: "string" },
                    },
                    required: ["competencyCode", "mappingVerdict", "recommendedAction", "improvedJustification", "suggestedWeightAdjustment", "reviewerComment", "confidenceLevel", "reasoning"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["reviews"],
              additionalProperties: false,
            },
          },
        },
      });

      // 6. Parse LLM response and merge with competency data
      let llmData: { reviews: { competencyCode: string; mappingVerdict: string; recommendedAction: string; improvedJustification: string | null; suggestedWeightAdjustment: string | null; reviewerComment: string; confidenceLevel: string; reasoning: string }[] };
      try {
        const rawContent = llmResponse.choices[0].message.content;
        const raw = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        llmData = JSON.parse(raw);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned an invalid response. Please try again." });
      }

      const llmMap = new Map(llmData.reviews.map(r => [r.competencyCode, r]));

      const finalItems: ReviewItem[] = competencyData.map(c => {
        const llm = llmMap.get(c.competencyCode);
        if (!llm) return c;
        return {
          ...c,
          mappingVerdict: llm.mappingVerdict as ReviewItem["mappingVerdict"],
          recommendedAction: llm.recommendedAction as ReviewItem["recommendedAction"],
          improvedJustification: llm.improvedJustification,
          suggestedWeightAdjustment: llm.suggestedWeightAdjustment,
          reviewerComment: llm.reviewerComment,
          confidenceLevel: llm.confidenceLevel as ReviewItem["confidenceLevel"],
          reasoning: llm.reasoning,
        };
      });

      // 7. Build summary stats
      const stats = {
        total: finalItems.length,
        strong: finalItems.filter(i => i.mappingVerdict === "Strong").length,
        acceptable: finalItems.filter(i => i.mappingVerdict === "Acceptable").length,
        weak: finalItems.filter(i => i.mappingVerdict === "Weak").length,
        artificial: finalItems.filter(i => i.mappingVerdict === "Artificial").length,
        missing: finalItems.filter(i => i.mappingVerdict === "Missing").length,
        needsAttention: finalItems.filter(i => i.validationIssues.length > 0).length,
        lowConfidence: finalItems.filter(i => i.confidenceLevel === "Low").length,
      };

      return {
        programId: input.programId,
        programName: program.nameEn,
        discipline: input.discipline,
        reviewMode: input.reviewMode,
        items: finalItems,
        summaryStats: stats,
      };
    }),

  /**
   * Save a review session to the database (creates a draft record).
   */
  saveReview: adminProcedure
    .input(z.object({
      programId: z.number(),
      discipline: disciplineEnum,
      reviewMode: reviewModeEnum,
      reviewData: z.string(), // JSON string of ReviewItem[]
      summaryStats: z.string(), // JSON string of stats
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createAIReview({
        programId: input.programId,
        reviewedBy: ctx.user.id,
        discipline: input.discipline,
        reviewMode: input.reviewMode,
        reviewData: input.reviewData,
        summaryStats: input.summaryStats,
        status: "draft",
        acceptedItems: "[]",
        rejectedItems: "[]",
      });
      return { id };
    }),

  /**
   * Get review history for a program (most recent first).
   */
  getReviewHistory: adminProcedure
    .input(z.object({ programId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAIReviewsByProgram(input.programId);
    }),

  /**
   * Get a single review by id.
   */
  getReview: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const review = await db.getAIReviewById(input.id);
      if (!review) throw new TRPCError({ code: "NOT_FOUND", message: "Review not found." });
      return review;
    }),

  /**
   * Apply a single accepted AI proposal to the database.
   * Updates the justification text for the given competency.
   * Weight adjustments require manual editing via the existing mapping interface.
   */
  applyItem: adminProcedure
    .input(z.object({
      reviewId: z.number(),
      programId: z.number(),
      competencyCode: z.string(),
      improvedJustification: z.string(),
      // Track accept/reject in the review record
      action: z.enum(["accept", "reject"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const review = await db.getAIReviewById(input.reviewId);
      if (!review) throw new TRPCError({ code: "NOT_FOUND", message: "Review not found." });

      // Update accepted/rejected lists
      const accepted: string[] = JSON.parse(review.acceptedItems ?? "[]");
      const rejected: string[] = JSON.parse(review.rejectedItems ?? "[]");

      if (input.action === "accept") {
        if (!accepted.includes(input.competencyCode)) accepted.push(input.competencyCode);
        const idx = rejected.indexOf(input.competencyCode);
        if (idx !== -1) rejected.splice(idx, 1);

        // Write improved justification to the justifications table
        const allCompetencies = await db.getAllCompetencies();
        const comp = allCompetencies.find(c => c.code === input.competencyCode);
        if (comp) {
          await db.upsertJustification({
            programId: input.programId,
            gaId: comp.gaId,
            competencyId: comp.id,
            textEn: input.improvedJustification,
          });
          await db.logAudit({
            userId: ctx.user.id,
            action: "update",
            entityType: "justification",
            entityId: comp.id,
            details: JSON.stringify({
              source: "ai_review",
              reviewId: input.reviewId,
              competencyCode: input.competencyCode,
            }),
          });
        }
      } else {
        if (!rejected.includes(input.competencyCode)) rejected.push(input.competencyCode);
        const idx = accepted.indexOf(input.competencyCode);
        if (idx !== -1) accepted.splice(idx, 1);
      }

      await db.updateAIReview(input.reviewId, {
        acceptedItems: JSON.stringify(accepted),
        rejectedItems: JSON.stringify(rejected),
      });

      return { success: true };
    }),

  /**
   * Mark a review as finalised.
   */
  finaliseReview: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateAIReview(input.id, { status: "finalised" });
      return { success: true };
    }),
});
