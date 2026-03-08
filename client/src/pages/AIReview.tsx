import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  onAccept,
  onReject,
}: {
  item: ReviewItem;
  reviewId: number;
  programId: number;
  accepted: string[];
  rejected: string[];
  onAccept: (code: string, justification: string) => void;
  onReject: (code: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editedJustification, setEditedJustification] = useState(
    item.improvedJustification ?? item.currentJustification ?? ""
  );

  const isAccepted = accepted.includes(item.competencyCode);
  const isRejected = rejected.includes(item.competencyCode);
  const cfg = VERDICT_CONFIG[item.mappingVerdict];

  const canAccept =
    item.recommendedAction !== "Keep" &&
    item.mappingVerdict !== "Missing" &&
    item.mappingVerdict !== "Strong";

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
              <CheckCircle className="w-3 h-3" /> Accepted
            </span>
          )}
          {isRejected && (
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Rejected
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

          {/* AI suggestions */}
          {item.suggestedWeightAdjustment && (
            <div className="rounded bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Suggested Weight Adjustment
              </p>
              <p className="text-sm text-amber-800">{item.suggestedWeightAdjustment}</p>
              <p className="text-xs text-amber-600 mt-1">
                Note: Weight adjustments must be applied manually in the Mapping Matrix.
              </p>
            </div>
          )}

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
          {!isAccepted && !isRejected && (
            <div className="flex gap-2 pt-1">
              {canAccept && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onAccept(item.competencyCode, editedJustification)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Accept Justification
                </Button>
              )}
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
          {(isAccepted || isRejected) && (
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

  // Guard: admin only
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">This feature is available to administrators only.</p>
      </div>
    );
  }

  const [discipline, setDiscipline] = useState<string>("other");
  const [reviewMode, setReviewMode] = useState<string>("standard");
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [savedReviewId, setSavedReviewId] = useState<number | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [filterVerdict, setFilterVerdict] = useState<string>("all");
  const [showHistory, setShowHistory] = useState(false);

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
  const finaliseReview = trpc.aiReview.finaliseReview.useMutation();

  const handleGenerate = async () => {
    try {
      const result = await generateReview.mutateAsync({
        programId,
        discipline: discipline as Parameters<typeof generateReview.mutateAsync>[0]["discipline"],
        reviewMode: reviewMode as Parameters<typeof generateReview.mutateAsync>[0]["reviewMode"],
      });
      setReviewResult(result);
      setAccepted([]);
      setRejected([]);
      setSavedReviewId(null);

      // Auto-save as draft
      const saved = await saveReview.mutateAsync({
        programId,
        discipline: discipline as Parameters<typeof saveReview.mutateAsync>[0]["discipline"],
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
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Programs", href: "/programs" },
            { label: program?.nameEn ?? "Program", href: `/programs/${programId}` },
            { label: "AI Review" },
          ]}
        />

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#8B1A1A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#8B1A1A] flex items-center gap-2">
                <Brain className="w-6 h-6" /> AI Mapping Review
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {program?.nameEn ?? "Loading..."} — Admin only
              </p>
            </div>
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

        {/* Review History Panel */}
        {showHistory && history && history.length > 0 && (
          <Card className="mb-6 bg-white">
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
                        <span className="text-gray-600">{r.discipline} · {r.reviewMode}</span>
                        <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-green-700">✓ {s.strong ?? 0}</span>
                        <span className="text-amber-700">⚠ {s.weak ?? 0}</span>
                        <span className="text-red-700">✗ {s.artificial ?? 0}</span>
                        <span className="text-gray-500">? {s.missing ?? 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panel */}
        <Card className="mb-6 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B1A1A]" />
              Review Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Program Discipline</label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="health">Health Sciences</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="humanities">Humanities</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Review Mode</label>
                <Select value={reviewMode} onValueChange={setReviewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative — explicit links only</SelectItem>
                    <SelectItem value="standard">Standard — explicit + discipline-valid</SelectItem>
                    <SelectItem value="expert">Expert Flexible — broader interpretation</SelectItem>
                  </SelectContent>
                </Select>
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
            <p className="text-xs text-gray-400 mt-3">
              The AI reads all PLOs, mappings, and justifications directly from the database and evaluates them against the QU methodology guide. Reviews typically take 30–60 seconds.
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {reviewResult && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
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
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))
              )}
            </div>

            {/* Finalise button */}
            {savedReviewId && (
              <div className="flex justify-end gap-3">
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
                  Finalise Review ({accepted.length} accepted, {rejected.length} rejected)
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
              Select a discipline and review mode above, then click <strong>Run AI Review</strong>.
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
      </div>
      <PageFooter />
    </div>
  );
}
