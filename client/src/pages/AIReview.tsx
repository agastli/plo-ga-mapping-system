import { useState, useMemo } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  ArrowLeft,
  History,
  RefreshCw,
  ShieldCheck,
  Lightbulb,
  Home,
  Scale,
  BookOpen,
  Microscope,
  Zap,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import PageFooter from "@/components/PageFooter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Verdict = "Strong" | "Acceptable" | "Weak" | "Artificial" | "Missing";
type ReviewAction = "Keep" | "Improve Justification" | "Revise Weight" | "Remove Mapping";
type Confidence = "High" | "Medium" | "Low";

interface ReviewItem {
  competencyCode: string;
  competencyName: string;
  gaCode: string;
  currentMappedPLOs: { ploCode: string; weight: number }[];
  currentWeightSum: number;
  currentJustification: string | null;
  validationIssues: string[];
  mappingVerdict: Verdict;
  recommendedAction: ReviewAction;
  improvedJustification: string | null;
  suggestedWeightAdjustment: string | null;
  reviewerComment: string;
  confidenceLevel: Confidence;
  reasoning: string;
}

interface ReviewResult {
  programId: number;
  programName: string;
  discipline: string;
  reviewMode: string;
  items: ReviewItem[];
  summaryStats: {
    total: number;
    strong: number;
    acceptable: number;
    weak: number;
    artificial: number;
    missing: number;
    needsAttention: number;
    lowConfidence: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  Strong: {
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    label: "Strong",
  },
  Acceptable: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <Info className="w-4 h-4 text-blue-600" />,
    label: "Acceptable",
  },
  Weak: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    label: "Weak",
  },
  Artificial: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-4 h-4 text-red-600" />,
    label: "Artificial",
  },
  Missing: {
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    icon: <XCircle className="w-4 h-4 text-gray-400" />,
    label: "Missing",
  },
};

const CONFIDENCE_BADGE: Record<Confidence, string> = {
  High: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-red-100 text-red-800",
};

const ACTION_BADGE: Record<ReviewAction, string> = {
  Keep: "bg-green-100 text-green-800",
  "Improve Justification": "bg-blue-100 text-blue-800",
  "Revise Weight": "bg-amber-100 text-amber-800",
  "Remove Mapping": "bg-red-100 text-red-800",
};

// ─── ReviewItemCard ───────────────────────────────────────────────────────────

function ReviewItemCard({
  item,
  reviewId,
  programId,
  accepted,
  rejected,
  weightsSaved,
  onAccept,
  onReject,
  onApplyWeights,
}: {
  item: ReviewItem;
  reviewId: number;
  programId: number;
  accepted: string[];
  rejected: string[];
  weightsSaved: string[];
  onAccept: (code: string, justification: string) => void;
  onReject: (code: string) => void;
  onApplyWeights: (code: string, weights: { ploCode: string; weight: number }[], justification: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editedJustification, setEditedJustification] = useState(
    item.improvedJustification ?? item.currentJustification ?? ""
  );
  // Inline weight editing state: map of ploCode -> weight string
  const [editedWeights, setEditedWeights] = useState<Record<string, string>>(
    Object.fromEntries(item.currentMappedPLOs.map(m => [m.ploCode, String(m.weight)]))
  );
  const [savingWeights, setSavingWeights] = useState(false);

  const isAccepted = accepted.includes(item.competencyCode);
  const isRejected = rejected.includes(item.competencyCode);
  const isWeightSaved = weightsSaved.includes(item.competencyCode);
  const cfg = VERDICT_CONFIG[item.mappingVerdict];

  const canAccept =
    item.recommendedAction !== "Keep" &&
    item.mappingVerdict !== "Missing" &&
    item.mappingVerdict !== "Strong";

  // Always show weight editor when there are mapped PLOs
  const showWeightEditor = item.currentMappedPLOs.length > 0;

  // Compute current weight sum from edited values
  const editedWeightSum = Object.values(editedWeights).reduce((s, v) => {
    const n = parseFloat(v);
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const weightSumRounded = Math.round(editedWeightSum * 100) / 100;
  const weightSumValid = weightSumRounded === 0 || weightSumRounded === 1;

  const handleSaveWeights = async () => {
    const weights = item.currentMappedPLOs.map(m => ({
      ploCode: m.ploCode,
      weight: parseFloat(editedWeights[m.ploCode] ?? String(m.weight)),
    }));
    setSavingWeights(true);
    try {
      await onApplyWeights(item.competencyCode, weights, editedJustification);
    } finally {
      setSavingWeights(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${cfg.bg} transition-all`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {cfg.icon}
          <span className="font-semibold text-sm text-gray-900">
            {item.competencyCode} — {item.competencyName}
          </span>
          <Badge variant="outline" className="text-xs font-normal text-gray-500">
            {item.gaCode}
          </Badge>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ACTION_BADGE[item.recommendedAction]}`}>
            {item.recommendedAction}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CONFIDENCE_BADGE[item.confidenceLevel]}`}>
            {item.confidenceLevel} confidence
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAccepted && (
            <span className="text-xs text-green-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Justification Accepted
            </span>
          )}
          {isRejected && (
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Rejected
            </span>
          )}
          {isWeightSaved && (
            <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <Scale className="w-3 h-3" /> Weights Saved
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Validation issues (always visible if present) */}
      {item.validationIssues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.validationIssues.map((issue, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">
              <AlertTriangle className="w-3 h-3" /> {issue}
            </span>
          ))}
        </div>
      )}

      {/* Reviewer comment (always visible) */}
      <p className="mt-2 text-sm text-gray-700">{item.reviewerComment}</p>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
          {/* Current state */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Mappings</p>
              {item.currentMappedPLOs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No PLOs mapped</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {item.currentMappedPLOs.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border text-xs font-mono">
                      {m.ploCode} = {m.weight}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono text-gray-600">
                    Σ = {item.currentWeightSum}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Justification</p>
              <p className="text-sm text-gray-700 italic">
                {item.currentJustification ?? <span className="text-gray-400">None</span>}
              </p>
            </div>
          </div>

          {/* Inline weight + justification editor */}
          {showWeightEditor && (
            <div className="rounded bg-amber-50 border border-amber-200 p-3 space-y-3">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <Scale className="w-3 h-3" /> Edit Weights &amp; Justification
              </p>
              {item.suggestedWeightAdjustment && (
                <p className="text-xs text-amber-700 italic">
                  AI weight suggestion: {item.suggestedWeightAdjustment}
                </p>
              )}
              {/* Weight inputs */}
              <div className="flex flex-wrap gap-3">
                {item.currentMappedPLOs.map((m) => (
                  <div key={m.ploCode} className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold text-gray-700 w-12">{m.ploCode}</span>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editedWeights[m.ploCode] ?? String(m.weight)}
                      onChange={(e) => setEditedWeights(prev => ({ ...prev, [m.ploCode]: e.target.value }))}
                      className="w-20 h-7 text-xs font-mono bg-white"
                    />
                  </div>
                ))}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                  weightSumValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  Σ = {weightSumRounded.toFixed(2)}
                  {weightSumValid ? " ✓" : " ✗ (must be 0 or 1)"}
                </div>
              </div>
              {/* Justification editor */}
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Justification
                </p>
                <Textarea
                  value={editedJustification}
                  onChange={(e) => setEditedJustification(e.target.value)}
                  rows={4}
                  className="text-sm bg-white border-amber-200"
                  placeholder="Enter or edit the justification for this mapping. It should reference each PLO by code, explain its contribution to the competency, and justify the assigned weights."
                />
                <p className="text-xs text-amber-600 mt-1">
                  The justification must be consistent with the weights above. Reference each PLO by code and explain why the weight is proportional to its contribution.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  disabled={!weightSumValid || savingWeights || isWeightSaved}
                  onClick={handleSaveWeights}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                >
                  {savingWeights ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving…</>
                  ) : isWeightSaved ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Saved</>
                  ) : (
                    <><Scale className="w-3 h-3 mr-1" /> Apply Weights &amp; Justification</>  
                  )}
                </Button>
                <p className="text-xs text-amber-600">
                  Weight sum must equal exactly 1.0 (or 0 to remove all mappings).
                </p>
              </div>
            </div>
          )}

          {/* AI-improved justification editor */}
          {canAccept && item.improvedJustification && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Brain className="w-3 h-3" /> AI-Improved Justification
              </p>
              <Textarea
                value={editedJustification}
                onChange={(e) => setEditedJustification(e.target.value)}
                rows={4}
                className="text-sm bg-white"
                placeholder="Edit the improved justification before accepting..."
              />
              <p className="text-xs text-gray-400 mt-1">
                You can edit the text above before accepting. This will be saved to the database.
              </p>
            </div>
          )}

          {/* AI reasoning (collapsible) */}
          <Collapsible>
            <CollapsibleTrigger className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <ChevronDown className="w-3 h-3" /> Show AI reasoning
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 rounded p-2">
                {item.reasoning}
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Accept / Reject buttons */}
          {!isAccepted && !isRejected && canAccept && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onAccept(item.competencyCode, editedJustification)}
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Accept Justification
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onReject(item.competencyCode)}
              >
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            </div>
          )}
          {(isAccepted || isRejected) && canAccept && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="text-gray-500"
                onClick={() =>
                  isAccepted
                    ? onReject(item.competencyCode)
                    : onAccept(item.competencyCode, editedJustification)
                }
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Undo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIReview() {
  const params = useParams<{ programId: string }>();
  const programId = parseInt(params.programId ?? "0");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Guard: admin or editor only
  if (user && user.role !== "admin" && user.role !== "editor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">This feature is available to administrators and editors only.</p>
      </div>
    );
  }

  const [reviewMode, setReviewMode] = useState<string>("standard");
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [savedReviewId, setSavedReviewId] = useState<number | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [weightsSaved, setWeightsSaved] = useState<string[]>([]);
  const [filterVerdict, setFilterVerdict] = useState<string>("all");
  const [showHistory, setShowHistory] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Load program info
  const { data: program } = trpc.programs.getById.useQuery({ id: programId }, { enabled: !!programId });

  // Review history
  const { data: history, refetch: refetchHistory } = trpc.aiReview.getReviewHistory.useQuery(
    { programId },
    { enabled: !!programId }
  );

  // Mutations
  const generateReview = trpc.aiReview.generateReview.useMutation();
  const saveReview = trpc.aiReview.saveReview.useMutation();
  const applyItem = trpc.aiReview.applyItem.useMutation();
  const applyWeights = trpc.aiReview.applyWeights.useMutation();
  const finaliseReview = trpc.aiReview.finaliseReview.useMutation();

  // Auto-detect discipline from program's stored discipline field, fallback to "other"
  const detectedDiscipline = (program as any)?.discipline ?? "other";

  const DISCIPLINE_LABELS: Record<string, string> = {
    engineering: "Engineering",
    architecture: "Architecture",
    business: "Business",
    health: "Health Sciences",
    education: "Education",
    humanities: "Humanities",
    science: "Science",
    law: "Law",
    other: "General / Other",
  };

  const handleGenerate = async () => {
    try {
      const result = await generateReview.mutateAsync({
        programId,
        discipline: detectedDiscipline as Parameters<typeof generateReview.mutateAsync>[0]["discipline"],
        reviewMode: reviewMode as Parameters<typeof generateReview.mutateAsync>[0]["reviewMode"],
      });
      setReviewResult(result);
      setAccepted([]);
      setRejected([]);
      setWeightsSaved([]);
      setSavedReviewId(null);

      // Auto-save as draft
      const saved = await saveReview.mutateAsync({
        programId,
        discipline: detectedDiscipline as Parameters<typeof saveReview.mutateAsync>[0]["discipline"],
        reviewMode: reviewMode as Parameters<typeof saveReview.mutateAsync>[0]["reviewMode"],
        reviewData: JSON.stringify(result.items),
        summaryStats: JSON.stringify(result.summaryStats),
      });
      setSavedReviewId(saved.id);
      refetchHistory();
      toast.success("AI review generated and saved as draft.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate review.";
      toast.error(msg);
    }
  };

  const handleAccept = async (code: string, justification: string) => {
    if (!savedReviewId) return;
    try {
      await applyItem.mutateAsync({
        reviewId: savedReviewId,
        programId,
        competencyCode: code,
        improvedJustification: justification,
        action: "accept",
      });
      setAccepted(prev => [...prev.filter(c => c !== code), code]);
      setRejected(prev => prev.filter(c => c !== code));
      toast.success(`Justification for ${code} accepted and saved to database.`);
    } catch {
      toast.error("Failed to apply change.");
    }
  };

  const handleReject = async (code: string) => {
    if (!savedReviewId) return;
    try {
      await applyItem.mutateAsync({
        reviewId: savedReviewId,
        programId,
        competencyCode: code,
        improvedJustification: "",
        action: "reject",
      });
      setRejected(prev => [...prev.filter(c => c !== code), code]);
      setAccepted(prev => prev.filter(c => c !== code));
      toast.info(`${code} marked as rejected.`);
    } catch {
      toast.error("Failed to record rejection.");
    }
  };

  const handleApplyWeights = async (code: string, weights: { ploCode: string; weight: number }[], justification: string) => {
    if (!savedReviewId) {
      toast.error("Please run the review first before applying weights.");
      return;
    }
    try {
      await applyWeights.mutateAsync({
        reviewId: savedReviewId,
        programId,
        competencyCode: code,
        weights,
        justification: justification.trim() || undefined,
      });
      setWeightsSaved(prev => [...prev.filter(c => c !== code), code]);
      toast.success(`Weights & justification for ${code} updated in database.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply weights.";
      toast.error(msg);
    }
  };

  const handleFinalise = async () => {
    if (!savedReviewId) return;
    try {
      await finaliseReview.mutateAsync({ id: savedReviewId });
      refetchHistory();
      toast.success("Review finalised.");
    } catch {
      toast.error("Failed to finalise review.");
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!reviewResult) return [];
    if (filterVerdict === "all") return reviewResult.items;
    if (filterVerdict === "issues") return reviewResult.items.filter(i => i.validationIssues.length > 0);
    if (filterVerdict === "attention") return reviewResult.items.filter(i =>
      i.mappingVerdict === "Weak" || i.mappingVerdict === "Artificial" || i.recommendedAction !== "Keep"
    );
    return reviewResult.items.filter(i => i.mappingVerdict === filterVerdict);
  }, [reviewResult, filterVerdict]);

  const stats = reviewResult?.summaryStats;

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 max-w-7xl">
      {/* ── Standard Header ── */}
        <div className="pt-4">
        <header className="bg-white rounded-lg shadow-md mb-4">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src="/qu-logo.png" alt="Qatar University" className="h-12 w-auto" />
                <div className="border-l-2 border-[#8B1538] pl-4">
                  <h2 className="text-lg font-bold text-[#8B1538] flex items-center gap-2">
                    <Brain className="w-5 h-5" /> AI Mapping Review
                  </h2>
                  <p className="text-sm text-slate-600">Academic Planning & Quality Assurance Office</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" asChild className="text-[#8B1538] hover:bg-[#8B1538]/10">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-[#8B1538] hover:bg-[#8B1538]/10"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </header>
        </div>
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-4"
          items={[
            { label: "Programs", href: "/programs" },
            { label: program?.nameEn ?? "Program", href: `/programs/${programId}` },
            { label: "AI Review" },
          ]}
        />

        {/* Page title row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#8B1A1A]">
              {program?.nameEn ?? "Loading…"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Discipline: <span className="font-medium text-gray-700">{DISCIPLINE_LABELS[detectedDiscipline] ?? detectedDiscipline}</span>
              {" · "}
              {user?.role === "admin" ? "Admin" : "Editor"} access
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1"
          >
            <History className="w-4 h-4" />
            {showHistory ? "Hide" : "Show"} History ({history?.length ?? 0})
          </Button>
        </div>

        {/* ── Explanation Panel ── */}
        <Card className="mb-5 bg-white border-[#8B1A1A]/20">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-[#8B1A1A] flex items-center gap-2">
              <Info className="w-4 h-4" /> About the AI Mapping Review Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <p className="text-sm text-gray-700 mb-3">
              This tool reads all PLOs, mappings, and justifications for this program directly from the database and evaluates them against the <strong>QU Graduate Attributes methodology</strong> (4-step process). It reviews all 21 competencies across 5 Graduate Attributes, identifies rule violations, assesses justification quality, and proposes improvements. Reviews typically take 30–60 seconds.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              <strong>What you can do with the results:</strong> Accept or reject AI-suggested justification improvements (written directly to the database), edit and apply weight corrections inline, and finalise the review as a permanent record.
            </p>

            {/* Review mode descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Microscope className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Conservative</span>
                </div>
                <p className="text-xs text-blue-700">
                  Accepts <strong>only explicit, unambiguous alignments</strong> where the connection is stated directly in the PLO text. Rejects any mapping that relies on inference or indirect reasoning. Best for programs seeking rigorous, defensible mappings.
                </p>
              </div>
              <div className="rounded-lg border border-[#8B1A1A]/30 bg-[#8B1A1A]/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-[#8B1A1A]" />
                  <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wide">Standard (Recommended)</span>
                </div>
                <p className="text-xs text-[#8B1A1A]/80">
                  Accepts explicit alignments and <strong>discipline-valid implicit alignments</strong> when well justified. For example, "experimentation" in engineering may imply inquiry; "design" in architecture may imply problem-solving. Suitable for most programs.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">Expert Flexible</span>
                </div>
                <p className="text-xs text-purple-700">
                  Allows <strong>broader discipline-based interpretation</strong> for design-heavy, interdisciplinary, or practice-based programs where competencies are embedded in professional practice rather than stated explicitly.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showGuide ? "rotate-180" : ""}`} />
              {showGuide ? "Hide" : "Show"} verdict definitions
            </button>
            {showGuide && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                {[
                  { label: "Strong", color: "bg-green-100 text-green-800", desc: "Explicit link, correct weight, strong justification." },
                  { label: "Acceptable", color: "bg-blue-100 text-blue-800", desc: "Valid but justification is generic or weight could be better calibrated." },
                  { label: "Weak", color: "bg-amber-100 text-amber-800", desc: "Indirect or inferred connection, poorly justified. Revision required." },
                  { label: "Artificial", color: "bg-red-100 text-red-800", desc: "Mapping appears inflated. No genuine educational connection. Remove." },
                  { label: "Missing", color: "bg-gray-100 text-gray-700", desc: "No PLO addresses this competency. Curriculum gap." },
                ].map(v => (
                  <div key={v.label} className="rounded p-2 border border-gray-200 bg-white">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold mb-1 ${v.color}`}>{v.label}</span>
                    <p className="text-gray-600">{v.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review History Panel */}
        {showHistory && history && history.length > 0 && (
          <Card className="mb-5 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Review History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((r) => {
                  const s = JSON.parse(r.summaryStats ?? "{}");
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded border bg-gray-50 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.status === "finalised" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {r.status}
                        </span>
                        <span className="text-gray-600 capitalize">{r.discipline} · {r.reviewMode}</span>
                        <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-green-700">✓ {s.strong ?? 0} Strong</span>
                        <span className="text-amber-700">⚠ {s.weak ?? 0} Weak</span>
                        <span className="text-red-700">✗ {s.artificial ?? 0} Artificial</span>
                        <span className="text-gray-500">? {s.missing ?? 0} Missing</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panel */}
        <Card className="mb-5 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B1A1A]" />
              Review Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Review Mode</label>
                <Select value={reviewMode} onValueChange={setReviewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative — explicit links only</SelectItem>
                    <SelectItem value="standard">Standard — explicit + discipline-valid (recommended)</SelectItem>
                    <SelectItem value="expert">Expert Flexible — broader interpretation</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  The discipline (<strong>{DISCIPLINE_LABELS[detectedDiscipline]}</strong>) is automatically detected from the program record.
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generateReview.isPending}
                className="bg-[#8B1A1A] hover:bg-[#6B1414] text-white"
              >
                {generateReview.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analysing… (30–60 s)
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {reviewResult ? "Re-run Review" : "Run AI Review"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {reviewResult && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
              {[
                { label: "Strong", value: stats?.strong ?? 0, color: "text-green-700 bg-green-50 border-green-200" },
                { label: "Acceptable", value: stats?.acceptable ?? 0, color: "text-blue-700 bg-blue-50 border-blue-200" },
                { label: "Weak", value: stats?.weak ?? 0, color: "text-amber-700 bg-amber-50 border-amber-200" },
                { label: "Artificial", value: stats?.artificial ?? 0, color: "text-red-700 bg-red-50 border-red-200" },
                { label: "Missing", value: stats?.missing ?? 0, color: "text-gray-600 bg-gray-50 border-gray-200" },
                { label: "Rule Issues", value: stats?.needsAttention ?? 0, color: "text-red-700 bg-red-50 border-red-200" },
                { label: "Low Confidence", value: stats?.lowConfidence ?? 0, color: "text-purple-700 bg-purple-50 border-purple-200" },
                { label: "Accepted", value: accepted.length, color: "text-green-700 bg-green-50 border-green-200" },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg border p-3 text-center ${s.color}`}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-500 font-medium">Filter:</span>
              {[
                { value: "all", label: `All (${reviewResult.items.length})` },
                { value: "attention", label: `Needs Attention (${reviewResult.items.filter(i => i.mappingVerdict === "Weak" || i.mappingVerdict === "Artificial" || i.recommendedAction !== "Keep").length})` },
                { value: "issues", label: `Rule Issues (${stats?.needsAttention ?? 0})` },
                { value: "Strong", label: "Strong" },
                { value: "Acceptable", label: "Acceptable" },
                { value: "Weak", label: "Weak" },
                { value: "Artificial", label: "Artificial" },
                { value: "Missing", label: "Missing" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterVerdict(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    filterVerdict === f.value
                      ? "bg-[#8B1A1A] text-white border-[#8B1A1A]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#8B1A1A]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Review items */}
            <div className="space-y-3 mb-6">
              {filteredItems.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No items match the selected filter.</p>
              ) : (
                filteredItems.map((item) => (
                  <ReviewItemCard
                    key={item.competencyCode}
                    item={item}
                    reviewId={savedReviewId!}
                    programId={programId}
                    accepted={accepted}
                    rejected={rejected}
                    weightsSaved={weightsSaved}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onApplyWeights={handleApplyWeights}
                  />
                ))
              )}
            </div>

            {/* Finalise button */}
            {savedReviewId && (
              <div className="flex justify-end gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/programs/${programId}`)}
                >
                  Back to Program
                </Button>
                <Button
                  onClick={handleFinalise}
                  disabled={finaliseReview.isPending}
                  className="bg-[#8B1A1A] hover:bg-[#6B1414] text-white"
                >
                  {finaliseReview.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  Finalise Review ({accepted.length} accepted, {rejected.length} rejected, {weightsSaved.length} weights updated)
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!reviewResult && !generateReview.isPending && (
          <div className="text-center py-16 text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No review yet</p>
            <p className="text-sm mt-1">
              Select a review mode above, then click <strong>Run AI Review</strong>.
            </p>
          </div>
        )}

        {generateReview.isPending && (
          <div className="text-center py-16 text-gray-500">
            <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-[#8B1A1A]" />
            <p className="text-base font-medium">Analysing all 21 competencies…</p>
            <p className="text-sm mt-1 text-gray-400">
              The AI is reading the database and applying the QU methodology guide. This takes 30–60 seconds.
            </p>
          </div>
        )}

      {/* ── Standard Footer ── */}
      <div className="pb-6">
        <PageFooter />
      </div>

      </div>
    </div>
  );
}
