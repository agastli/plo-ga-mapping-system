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
 * Access: admin and editor roles (editorProcedure)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { editorProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

// ─── Dual-mode LLM caller ─────────────────────────────────────────────────────
// On the Manus platform, BUILT_IN_FORGE_API_KEY is injected automatically.
// On the VPS (or any external deployment), fall back to OpenAI directly.
async function callLLM(params: Parameters<typeof invokeLLM>[0]) {
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
  // Only use the built-in LLM when the key is a real token (not the placeholder "disabled")
  if (forgeKey && forgeKey !== "disabled") {
    // Manus platform — use the built-in helper
    return invokeLLM(params);
  }
  // VPS / external — call OpenAI directly
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error(
      "No LLM API key configured. Set OPENAI_API_KEY in your .env file."
    );
  }
  const body = {
    model: "gpt-4o",
    messages: params.messages,
    ...(params.response_format ? { response_format: params.response_format } : {}),
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }
  return res.json() as ReturnType<typeof invokeLLM>;
}

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

const QU_METHODOLOGY_SYSTEM_PROMPT = `You are a senior academic quality assurance expert with deep expertise in curriculum design, accreditation standards (ABET, NCAAA, QAA), and outcome-based education. Your role is to conduct a rigorous, professional review of PLO-to-Graduate-Attribute competency mappings for Qatar University programs, applying the QU Graduate Attributes Assessment methodology.

Your review must be honest, critical, and educationally grounded. Curriculum gaps (Missing verdicts) are valid and important findings. However, do not flag a mapping as Missing or Artificial simply because the PLO does not use the exact vocabulary of the competency — in Expert Flexible mode especially, professional and disciplinary reasoning is sufficient.

---

## REVIEW MODE — READ THIS FIRST

The review mode determines how strictly you require explicit language in PLO text:

**Conservative mode:** Only accept mappings where the competency's core concept is directly and unambiguously stated in the PLO text using matching or near-matching vocabulary. Reject any mapping that relies on inference.

**Standard mode:** Accept explicit alignments AND discipline-valid implicit alignments where the connection is professionally recognised within the discipline and can be well-justified (e.g., "design" in architecture implies problem-solving; "experimentation" in engineering implies inquiry; "communication" in any professional program implies interpersonal skills).

**Expert Flexible mode:** This mode applies to ALL programs and disciplines. In this mode:
- You MUST reason from the professional, disciplinary, and educational context of each PLO, not just its literal wording.
- A PLO does not need to use the exact vocabulary of a competency for a valid mapping to exist. Ask: "Does engaging with this PLO, in the context of this discipline, develop or assess this competency?"
- Examples of valid discipline-based inference (applicable across all fields):
  - A PLO about professional practice or project delivery implies professional and ethical conduct.
  - A PLO about working with teams, stakeholders, or interdisciplinary groups implies collaboration, interpersonal skills, and potentially leadership.
  - A PLO addressing social, cultural, environmental, or community dimensions implies community engagement, cultural awareness, and awareness of local/global issues.
  - A PLO about applying advanced or cutting-edge methods implies adaptability and potentially life-long learning.
  - A PLO about research, investigation, or evaluation implies research and adaptive thinking.
  - A PLO about communication, reporting, or presentation implies effective communication.
  - A PLO addressing regional, national, or GCC/Arab context implies Arabic-Islamic identity and awareness of local issues.
  - A PLO about conceptualisation, design, or novel solution development implies creativity and innovation.
- Apply the standard of a seasoned accreditation reviewer who understands that all professional programs embed competencies in practice-based outcomes rather than listing them abstractly.
- Only assign "Missing" when there is genuinely no PLO that could reasonably develop the competency even through professional practice in this discipline.
- Only assign "Artificial" when the connection is truly implausible and cannot be justified by any reasonable disciplinary reasoning — not merely because it is indirect.

---

## QU Graduate Attributes Framework

Qatar University has defined five Graduate Attributes (GAs), each supported by specific competencies. A total of 21 competencies must be reviewed.

**GA1 — Competent** (4 competencies)
- C1-1: Subject-matter mastery — Deep, accurate knowledge of the discipline's core theories, principles, methods, and current developments. In Conservative mode: requires explicit disciplinary knowledge language. In Standard/Expert modes: any PLO targeting disciplinary skills, methods, professional practice, or technical proficiency qualifies.
- C1-2: Critical-thinking skills — Objective analysis, evidence evaluation, and reasoned judgment. In Conservative mode: requires explicit analysis/evaluation language. In Standard/Expert modes: PLOs involving critique, assessment, evaluation studies, analytical methods, or evidence-based reasoning qualify.
- C1-3: Problem-solving skills — Systematic identification, analysis, and resolution of problems. In Conservative mode: requires explicit problem-solving language. In Standard/Expert modes: PLOs involving design, synthesis, diagnosis, solution development, or professional decision-making qualify — professional practice IS problem-solving in any applied discipline.
- C1-4: Research and adaptive thinking — Ability to find, evaluate, and apply new knowledge; creative thinking beyond established methods. In Conservative mode: requires explicit research/innovation language. In Standard/Expert modes: PLOs involving investigation, evaluation studies, research methods, literature review, or application of advanced/emerging methods qualify.

**GA2 — Life-long Learner** (4 competencies)
- C2-1: Self-awareness — Understanding one's strengths, limitations, values, and their impact on others. In Conservative mode: requires reflective/self-assessment language. In Standard/Expert modes: PLOs involving professional responsibility, reflective practice, peer review, or working with diverse stakeholders may imply self-awareness.
- C2-2: Adaptability — Adjusting effectively to new conditions, tools, or environments. In Conservative mode: requires explicit flexibility/change language. In Standard/Expert modes: PLOs involving emerging technologies, evolving professional contexts, interdisciplinary work, or applying methods across varied situations imply adaptability.
- C2-3: Adaptive thinking — Generating new ideas or frameworks when standard methods are insufficient. Distinguish from C1-4 (research output) — this is about learning agility and creative reframing. In Standard/Expert modes: PLOs requiring novel conceptualisation, creative synthesis, or non-standard problem approaches qualify.
- C2-4: Desire for life-long learning — Intrinsic motivation to continuously update knowledge and skills. In Conservative mode: requires explicit continuing education language. In Standard/Expert modes: PLOs involving advanced or cutting-edge methods, professional development practices, or staying current with field developments may imply this.

**GA3 — Well-Rounded** (3 competencies)
- C3-1: Cultured — Broad awareness of history, arts, and diverse human experiences; appreciation of cultural differences. In Conservative mode: requires explicit cultural/historical language. In Standard/Expert modes: PLOs addressing regional/national context, social and cultural dimensions of the discipline, humanistic aspects, or cultural heritage qualify.
- C3-2: Effective communication — Conveying technical and non-technical information clearly in writing, speech, and visuals. In Conservative mode: requires explicit communication language. In Standard/Expert modes: PLOs involving written reports, oral presentations, visual outputs, professional documentation, or any form of communicating disciplinary knowledge qualify.
- C3-3: Awareness of local and international issues — Understanding social, environmental, economic, and geopolitical challenges. In Conservative mode: requires explicit societal/global language. In Standard/Expert modes: PLOs addressing environmental impact, social responsibility, sustainability, the GCC/Arab regional context, or global professional standards qualify.

**GA4 — Ethically and Socially Responsible** (5 competencies)
- C4-1: Arabic-Islamic identity — Embodying values, ethics, and cultural heritage of Arab-Islamic civilisation. In Conservative mode: requires explicit Islamic/Arab identity language. In Standard/Expert modes: PLOs addressing the GCC/Arab regional context, cultural heritage, Islamic values, or regional social and professional norms qualify.
- C4-2: Embrace diversity — Respecting and valuing differences in culture, background, gender, and perspective. In Conservative mode: requires explicit diversity language. In Standard/Expert modes: PLOs addressing social diversity, multicultural contexts, working with diverse populations, or interdisciplinary collaboration with diverse teams qualify.
- C4-3: Professional and ethical conduct — Adherence to professional codes of ethics; honesty and responsibility. In Conservative mode: requires explicit ethics language. In Standard/Expert modes: PLOs involving professional practice, responsibility for outcomes, adherence to professional standards, or accountability in any disciplinary context qualify.
- C4-4: Civically engaged — Active participation in community betterment through service or advocacy. In Conservative mode: requires explicit civic/community service language. In Standard/Expert modes: PLOs addressing the social impact of the discipline, community needs, public service, or the role of the profession in society qualify.
- C4-5: Community and global engagement — Contributing to local and global communities; participating in global professional networks. In Conservative mode: requires explicit global engagement language. In Standard/Expert modes: PLOs addressing social, cultural, and environmental dimensions of professional work for communities (local, national, or global), international collaboration, or engagement with global professional standards qualify.

**GA5 — Entrepreneurial** (5 competencies)
- C5-1: Creativity and innovation — Generating original ideas and novel solutions. In Conservative mode: requires explicit innovation language. In Standard/Expert modes: PLOs involving conceptualisation, novel approaches, creative synthesis, or application of cutting-edge methods qualify; professional practice in any applied discipline inherently involves creative problem-solving.
- C5-2: Collaborative — Working productively with others toward shared goals. In Conservative mode: requires explicit teamwork language. In Standard/Expert modes: PLOs involving interdisciplinary teams, project coordination, professional collaboration, or working with stakeholders qualify.
- C5-3: Management — Planning, organising, and coordinating resources and tasks. In Conservative mode: requires explicit management language. In Standard/Expert modes: PLOs involving project delivery, coordination of complex processes, resource planning, or managing professional workflows qualify.
- C5-4: Interpersonal — Building positive professional relationships; empathy and emotional intelligence. In Conservative mode: requires explicit interpersonal language. In Standard/Expert modes: PLOs involving communication with clients or stakeholders, understanding user or community needs, or sustained professional collaboration imply interpersonal skills.
- C5-5: Leadership — Inspiring and guiding others; taking initiative and responsibility. In Conservative mode: requires explicit leadership language. In Standard/Expert modes: PLOs involving coordination of teams, taking responsibility for professional outcomes, or leading complex projects qualify.

---

## The 4-Step Mapping Methodology

**Step 1 — Understand the competency precisely.**
Before evaluating any mapping, establish a clear operational definition of the competency. Identify what specific knowledge, skill, or behaviour it requires. Do not conflate similar-sounding competencies (e.g., C1-4 Research vs. C2-3 Adaptive thinking; C4-4 Civic engagement vs. C4-5 Global engagement).

**Step 2 — Evaluate the PLO-to-competency link.**
Apply the review mode as described above. In Expert Flexible mode, ask: "Would a seasoned accreditation reviewer in this discipline accept this mapping as professionally valid?" If yes, accept it — even if the PLO does not use the exact vocabulary of the competency.

**Step 3 — Evaluate weights critically.**
Weights reflect the degree to which a PLO contributes to a competency. Rules:
- The sum of all weights for a single competency MUST equal exactly 0 or 1. No other values are valid.
- Weight = 1.0: A single PLO fully and comprehensively addresses the competency alone.
- Weight = 0.5/0.5: Two PLOs each contribute a distinct and roughly equal dimension of the competency.
- Weight = 0.7/0.3 (or similar): Two or more PLOs contribute, but one is clearly the primary driver.
- Weight = 0 (no mapping): No PLO addresses this competency. This is a valid curriculum gap finding — do not invent mappings to fill gaps.
- Overmapping: More than 3–4 PLOs mapped to a single competency is a red flag for weight inflation. Each mapped PLO must make a distinct, non-redundant contribution.
- Weight calibration: If a PLO only tangentially addresses a competency, its weight should be low (0.2–0.3). If it is the primary vehicle, weight should be 0.7–1.0.

**Step 4 — Evaluate justification quality rigorously.**
A strong justification must:
1. Quote or closely paraphrase the specific language from the PLO text that establishes the connection.
2. Explain the educational mechanism — how does engaging with this PLO develop the specific competency?
3. Demonstrate proportionality — why is the assigned weight appropriate given the PLO's scope?
4. Be specific to the discipline and program context.

A weak justification:
- Uses generic phrases like "this PLO aligns with this competency" without explanation.
- States the competency name without linking it to PLO content.
- Is shorter than 2–3 substantive sentences.
- Could apply to any program regardless of discipline.

---

## Verdict Criteria (apply strictly)

- **Strong:** The PLO explicitly and directly addresses the competency. The weight is well-calibrated and proportional. The justification quotes PLO language, explains the educational mechanism, and demonstrates clear logic. No revision needed.

- **Acceptable:** The mapping is educationally valid but has one of: (a) a generic or insufficiently specific justification, (b) a weight that could be better calibrated, or (c) a minor indirect connection that is discipline-valid. Improvement recommended but not urgent.

- **Weak:** The connection between the PLO and competency is indirect, inferred without discipline-specific basis, or the justification fails to demonstrate a genuine educational link. The mapping may be retained with significant revision, or removed.

- **Artificial:** The mapping appears to have been created to inflate coverage statistics rather than reflecting a genuine educational connection. The PLO text does not support the claimed competency. Removal strongly recommended.

- **Missing:** No PLO in the program explicitly or implicitly addresses this competency under the selected review mode. This is a curriculum gap — an important finding for program improvement. Do not assign a verdict of Missing if a reasonable discipline-valid connection exists under the selected mode.

---

## Recommended Action Logic

- **Keep:** Use only for Strong verdicts. The mapping is correct and well-documented.
- **Improve Justification:** Use for Acceptable verdicts where the mapping is valid but documentation is weak. Provide a specific, improved justification.
- **Revise Weight:** Use when the mapping is valid but the weight distribution is incorrect (sum ≠ 1, or weights are not proportional to PLO contribution). Specify the exact correction.
- **Remove Mapping:** Use for Artificial verdicts. The mapping should be deleted.

Note: A single competency may need both "Improve Justification" AND "Revise Weight". In such cases, prioritise the more critical issue for the recommendedAction field, and address both in the reviewerComment.

---

## Improved Justification Guidelines

When providing an improvedJustification, write it as a complete, professional justification that:
- Opens by referencing the specific PLO code and quoting or closely paraphrasing its key phrase.
- Explains the educational mechanism (how the PLO develops the competency in this discipline).
- Justifies the weight assignment with reference to the PLO's scope and centrality.
- Is 3–5 sentences, specific to the program's discipline and context.
- Uses formal academic language appropriate for accreditation documentation.

Example of a strong justification:
"PLO3 ('Apply engineering principles to analyse and design structural systems') directly develops C1-3 (Problem-solving skills) by requiring students to engage in the full problem-solving cycle — from problem identification through analysis to solution design — within a disciplinary context. The weight of 0.7 reflects that PLO3 is the primary vehicle for problem-solving in this program, with PLO5 providing a complementary applied dimension (0.3). This mapping is consistent with ABET Criterion 3 expectations for engineering programs."

---

## Confidence Level Guidelines

- **High:** The PLO text is unambiguous, the competency definition is clear, and the verdict follows directly from the evidence.
- **Medium:** The connection requires some interpretation, or the PLO text is somewhat vague, but the verdict is well-supported.
- **Low:** The PLO text is ambiguous, the competency boundary is unclear, or the verdict depends heavily on assumptions about program intent. Flag for human review.

---

## Critical Rules

1. You MUST review all 21 competencies. Do not skip any.
2. Do not assign "Strong" to a mapping with a weight sum ≠ 1 — that is a rule violation.
3. Do not assign "Strong" to a mapping with a generic justification.
4. Do not assign "Missing" if a reasonable discipline-valid connection exists under the selected review mode.
5. Do not invent PLO-competency connections that are not supported by the PLO text.
6. Overmapping (>4 PLOs per competency) is a red flag — scrutinise each mapped PLO carefully.
7. The improvedJustification field must be substantive (3+ sentences) or null. Never provide a one-sentence placeholder.
8. The suggestedWeightAdjustment field must specify exact values (e.g., "Change PLO2 from 0.3 to 0.5 and PLO4 from 0.7 to 0.5 to achieve sum = 1.0") or null.
9. **Coherence between weights and justification is mandatory:** The justification and the weight assignments MUST be consistent with each other. Specifically:
   - If a competency has PLO mappings with assigned weights (weight sum > 0), the justification MUST acknowledge and support those mappings. A justification that says "no PLO addresses this competency" or "there is no mapping" while weights are assigned is a direct contradiction and is invalid.
   - If a competency has PLO mappings with assigned weights but the currentJustification is empty, null, a generic placeholder, or contradicts the mappings, you MUST provide a substantive improvedJustification that explains and supports those specific weights. The justification must reference each mapped PLO by code, explain its contribution to the competency, and justify why each weight is proportional to that PLO's role.
   - Conversely, if the justification claims a mapping exists but the weight sum is 0, flag this as a rule violation.
   - Set recommendedAction to "Improve Justification" whenever this coherence issue is detected. Never leave a mapped competency with a contradictory or absent justification.

---

## Output Format

Return a JSON object with a "reviews" array containing exactly one object per competency (all 21 must be present). Each object must have these fields:
- competencyCode: string (e.g. "C1-1")
- mappingVerdict: "Strong" | "Acceptable" | "Weak" | "Artificial" | "Missing"
- recommendedAction: "Keep" | "Improve Justification" | "Revise Weight" | "Remove Mapping"
- improvedJustification: string | null (null only if verdict is Strong or Missing; otherwise provide a full 3–5 sentence justification)
- suggestedWeightAdjustment: string | null (null if no weight change needed; otherwise specify exact values)
- reviewerComment: string (2–4 sentences explaining the verdict, citing specific PLO language or issues)
- confidenceLevel: "High" | "Medium" | "Low"
- reasoning: string (3–5 sentences of internal chain-of-thought explaining how you reached the verdict)

Do not include any text outside the JSON object.`;

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
  generateReview: editorProcedure
    .input(z.object({
      programId: z.number(),
      discipline: disciplineEnum,
      reviewMode: reviewModeEnum,
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Load program data
      const program = await db.getProgramById(input.programId);
      if (!program) throw new TRPCError({ code: "NOT_FOUND", message: "Program not found." });

      // Scope check: editors can only review their assigned programs
      if (ctx.user.role !== "admin") {
        const accessible = await db.getAccessiblePrograms(ctx.user.id);
        const hasAccess = accessible.some((ap: any) => ap.program.id === input.programId);
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this program." });
      }

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

      const llmResponse = await callLLM({
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
  saveReview: editorProcedure
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
  getReviewHistory: editorProcedure
    .input(z.object({ programId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAIReviewsByProgram(input.programId);
    }),

  /**
   * Get a single review by id.
   */
  getReview: editorProcedure
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
  applyItem: editorProcedure
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
   * Apply weight changes for a competency inline from the AI Review page.
   * Accepts an array of { ploCode, weight } pairs and upserts each mapping.
   */
  applyWeights: editorProcedure
    .input(z.object({
      reviewId: z.number(),
      programId: z.number(),
      competencyCode: z.string(),
      weights: z.array(z.object({
        ploCode: z.string(),
        weight: z.number().min(0).max(1),
      })),
      justification: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Scope check for editors
      if (ctx.user.role !== "admin") {
        const accessible = await db.getAccessiblePrograms(ctx.user.id);
        const hasAccess = accessible.some((ap: any) => ap.program.id === input.programId);
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this program." });
      }

      // Resolve PLO codes → IDs
      const plos = await db.getPLOsByProgram(input.programId);
      const ploMap = new Map(plos.map(p => [p.code, p.id]));

      // Resolve competency code → ID
      const allCompetencies = await db.getAllCompetencies();
      const comp = allCompetencies.find(c => c.code === input.competencyCode);
      if (!comp) throw new TRPCError({ code: "NOT_FOUND", message: `Competency ${input.competencyCode} not found.` });

      // Validate weight sum
      const weightSum = input.weights.reduce((s, w) => s + w.weight, 0);
      const rounded = Math.round(weightSum * 100) / 100;
      if (input.weights.length > 0 && rounded !== 0 && rounded !== 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Weight sum must be exactly 0 or 1 (got ${rounded.toFixed(2)}). Please adjust the weights.`,
        });
      }

      // Upsert each weight (and justification if provided)
      for (const w of input.weights) {
        const ploId = ploMap.get(w.ploCode);
        if (!ploId) continue;
        await db.upsertMapping(ploId, comp.id, String(w.weight), input.justification);
      }

      await db.logAudit({
        userId: ctx.user.id,
        action: "update",
        entityType: "mapping",
        entityId: comp.id,
        details: JSON.stringify({
          source: "ai_review",
          reviewId: input.reviewId,
          competencyCode: input.competencyCode,
          weights: input.weights,
        }),
      });

      return { success: true };
    }),

  /**
   * Mark a review as finalised.
   */
  finaliseReview: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateAIReview(input.id, { status: "finalised" });
      return { success: true };
    }),
});
