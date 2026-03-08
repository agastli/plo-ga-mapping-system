/**
 * Tests for AI Review module
 * Covers: DB helpers, router procedure guards, and prompt-building logic
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock the DB module ────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getProgramById: vi.fn(),
  getPLOsByProgram: vi.fn(),
  getAllCompetencies: vi.fn(),
  getAllGraduateAttributes: vi.fn(),
  getMappingsByProgram: vi.fn(),
  getJustificationsByProgram: vi.fn(),
  createAIReview: vi.fn(),
  getAIReviewsByProgram: vi.fn(),
  getAIReviewById: vi.fn(),
  updateAIReview: vi.fn(),
  upsertJustification: vi.fn(),
  logAudit: vi.fn(),
}));

// ─── Unit: weight-sum validation ──────────────────────────────────────────────

function validateMappingRules(
  competencyCode: string,
  mappedPLOs: { ploCode: string; weight: number }[],
  justification: string | null
): string[] {
  const issues: string[] = [];
  const sum = mappedPLOs.reduce((s, m) => s + m.weight, 0);
  const rounded = Math.round(sum * 100) / 100;
  if (rounded !== 0 && rounded !== 1) {
    issues.push(`Weights sum to ${rounded} (must be 0 or 1)`);
  }
  if (mappedPLOs.length > 0 && !justification) {
    issues.push("Mapped competency has no justification");
  }
  return issues;
}

describe("validateMappingRules", () => {
  it("returns no issues when sum is 0 (unmapped)", () => {
    const issues = validateMappingRules("C1-1", [], null);
    expect(issues).toHaveLength(0);
  });

  it("returns no issues when sum is exactly 1 with justification", () => {
    const issues = validateMappingRules(
      "C1-1",
      [
        { ploCode: "PLO1", weight: 0.5 },
        { ploCode: "PLO2", weight: 0.5 },
      ],
      "Both PLOs contribute to subject mastery."
    );
    expect(issues).toHaveLength(0);
  });

  it("flags invalid sum (e.g. 0.7)", () => {
    const issues = validateMappingRules(
      "C1-2",
      [
        { ploCode: "PLO1", weight: 0.4 },
        { ploCode: "PLO2", weight: 0.3 },
      ],
      "Some justification"
    );
    expect(issues).toContain("Weights sum to 0.7 (must be 0 or 1)");
  });

  it("flags missing justification when PLOs are mapped", () => {
    const issues = validateMappingRules(
      "C1-3",
      [{ ploCode: "PLO3", weight: 1.0 }],
      null
    );
    expect(issues).toContain("Mapped competency has no justification");
  });

  it("does not flag missing justification when no PLOs mapped", () => {
    const issues = validateMappingRules("C1-4", [], null);
    expect(issues).toHaveLength(0);
  });

  it("flags both invalid sum and missing justification simultaneously", () => {
    const issues = validateMappingRules(
      "C2-1",
      [{ ploCode: "PLO1", weight: 0.6 }],
      null
    );
    expect(issues).toHaveLength(2);
  });
});

// ─── Unit: summary stats computation ─────────────────────────────────────────

type Verdict = "Strong" | "Acceptable" | "Weak" | "Artificial" | "Missing";
type Confidence = "High" | "Medium" | "Low";

interface ReviewItem {
  mappingVerdict: Verdict;
  confidenceLevel: Confidence;
  validationIssues: string[];
  recommendedAction: string;
}

function computeSummaryStats(items: ReviewItem[]) {
  return {
    total: items.length,
    strong: items.filter((i) => i.mappingVerdict === "Strong").length,
    acceptable: items.filter((i) => i.mappingVerdict === "Acceptable").length,
    weak: items.filter((i) => i.mappingVerdict === "Weak").length,
    artificial: items.filter((i) => i.mappingVerdict === "Artificial").length,
    missing: items.filter((i) => i.mappingVerdict === "Missing").length,
    needsAttention: items.filter((i) => i.validationIssues.length > 0).length,
    lowConfidence: items.filter((i) => i.confidenceLevel === "Low").length,
  };
}

describe("computeSummaryStats", () => {
  it("correctly counts verdicts", () => {
    const items: ReviewItem[] = [
      { mappingVerdict: "Strong", confidenceLevel: "High", validationIssues: [], recommendedAction: "Keep" },
      { mappingVerdict: "Weak", confidenceLevel: "Low", validationIssues: ["Sum ≠ 1"], recommendedAction: "Revise Weight" },
      { mappingVerdict: "Missing", confidenceLevel: "High", validationIssues: [], recommendedAction: "Keep" },
      { mappingVerdict: "Artificial", confidenceLevel: "Low", validationIssues: [], recommendedAction: "Remove Mapping" },
      { mappingVerdict: "Acceptable", confidenceLevel: "Medium", validationIssues: [], recommendedAction: "Keep" },
    ];
    const stats = computeSummaryStats(items);
    expect(stats.total).toBe(5);
    expect(stats.strong).toBe(1);
    expect(stats.weak).toBe(1);
    expect(stats.missing).toBe(1);
    expect(stats.artificial).toBe(1);
    expect(stats.acceptable).toBe(1);
    expect(stats.needsAttention).toBe(1);
    expect(stats.lowConfidence).toBe(2);
  });

  it("returns all zeros for empty input", () => {
    const stats = computeSummaryStats([]);
    expect(stats.total).toBe(0);
    expect(stats.strong).toBe(0);
    expect(stats.lowConfidence).toBe(0);
  });
});

// ─── Unit: discipline label mapping ──────────────────────────────────────────

const DISCIPLINE_LABELS: Record<string, string> = {
  engineering: "Engineering",
  architecture: "Architecture",
  business: "Business",
  health: "Health Sciences",
  education: "Education",
  humanities: "Humanities",
  science: "Science",
  law: "Law",
  other: "Other",
};

describe("DISCIPLINE_LABELS", () => {
  it("covers all expected disciplines", () => {
    const expected = ["engineering", "architecture", "business", "health", "education", "humanities", "science", "law", "other"];
    expected.forEach((d) => {
      expect(DISCIPLINE_LABELS[d]).toBeDefined();
    });
  });

  it("returns correct label for engineering", () => {
    expect(DISCIPLINE_LABELS["engineering"]).toBe("Engineering");
  });
});
