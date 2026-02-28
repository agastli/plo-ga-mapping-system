import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, Circle, BarChart3, Settings2, X, AlertTriangle } from "lucide-react";

// ── Threshold defaults ──────────────────────────────────────────────────────
const DEFAULT_WARN = 50;   // yellow alert when overall < this
const DEFAULT_DANGER = 25; // red alert when overall < this

function StatusIcon({ rate }: { rate: number }) {
  if (rate === 100) return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />;
  if (rate >= 50)   return <AlertCircle  className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return                   <Circle       className="h-4 w-4 text-red-400    flex-shrink-0" />;
}

function ProgressBar({ value, warnThreshold, dangerThreshold }: { value: number; warnThreshold: number; dangerThreshold: number }) {
  const color =
    value === 100            ? "bg-green-500"  :
    value >= warnThreshold   ? "bg-yellow-400" :
    value >= dangerThreshold ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MappingCompletenessWidget() {
  const { data, isLoading } = trpc.analytics.programCompleteness.useQuery();

  // Configurable thresholds (local state — persisted in sessionStorage for convenience)
  const [warnThreshold,   setWarnThreshold]   = useState<number>(() => Number(sessionStorage.getItem("cw_warn")   ?? DEFAULT_WARN));
  const [dangerThreshold, setDangerThreshold] = useState<number>(() => Number(sessionStorage.getItem("cw_danger") ?? DEFAULT_DANGER));
  const [showSettings,    setShowSettings]    = useState(false);
  const [tempWarn,        setTempWarn]        = useState(String(warnThreshold));
  const [tempDanger,      setTempDanger]      = useState(String(dangerThreshold));

  function applyThresholds() {
    const w = Math.min(100, Math.max(1, Number(tempWarn)   || DEFAULT_WARN));
    const d = Math.min(w - 1, Math.max(0, Number(tempDanger) || DEFAULT_DANGER));
    setWarnThreshold(w);
    setDangerThreshold(d);
    sessionStorage.setItem("cw_warn",   String(w));
    sessionStorage.setItem("cw_danger", String(d));
    setShowSettings(false);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#8B1538]" />
            Mapping Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#8B1538]" />
            Mapping Completeness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No programs found.</p>
        </CardContent>
      </Card>
    );
  }

  const total       = data.length;
  const complete    = data.filter(p => p.isComplete).length;
  const noPLOs      = data.filter(p => p.hasNoPLOs).length;
  const partial     = total - complete - noPLOs;
  const overallRate = total > 0 ? Math.round((complete / total) * 100) : 0;

  // Programs below the danger threshold (excluding those with no PLOs)
  const dangerPrograms = data.filter(p => !p.hasNoPLOs && p.completenessRate < dangerThreshold);
  const warnPrograms   = data.filter(p => !p.hasNoPLOs && p.completenessRate >= dangerThreshold && p.completenessRate < warnThreshold);

  // Alert level for the overall rate
  const alertLevel =
    overallRate < dangerThreshold ? "danger" :
    overallRate < warnThreshold   ? "warn"   : "ok";

  // Show only programs that need attention: partial or no PLOs, sorted by completeness ascending
  const needsAttention = [...data]
    .filter(p => !p.isComplete)
    .sort((a, b) => a.completenessRate - b.completenessRate)
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#8B1538]" />
            Mapping Completeness
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-[#8B1538]"
              onClick={() => { setShowSettings(v => !v); setTempWarn(String(warnThreshold)); setTempDanger(String(dangerThreshold)); }}
              title="Configure thresholds"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
            <Link href="/admin/completeness">
              <span className="text-xs text-[#8B1538] hover:underline cursor-pointer">View all →</span>
            </Link>
          </div>
        </div>

        {/* Threshold settings panel */}
        {showSettings && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <p className="text-xs font-medium text-gray-700">Alert Thresholds (%)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-yellow-700">Warning below</Label>
                <Input
                  type="number" min={1} max={100}
                  value={tempWarn}
                  onChange={e => setTempWarn(e.target.value)}
                  className="h-7 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-red-600">Danger below</Label>
                <Input
                  type="number" min={0} max={99}
                  value={tempDanger}
                  onChange={e => setTempDanger(e.target.value)}
                  className="h-7 text-xs mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs bg-[#8B1538] hover:bg-[#6B1028]" onClick={applyThresholds}>
                Apply
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Alert banners */}
        {alertLevel === "danger" && (
          <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <span className="font-semibold">Critical:</span> Overall completeness ({overallRate}%) is below the danger threshold ({dangerThreshold}%).
              {dangerPrograms.length > 0 && <span> {dangerPrograms.length} program{dangerPrograms.length > 1 ? "s" : ""} need immediate attention.</span>}
            </div>
          </div>
        )}
        {alertLevel === "warn" && (
          <div className="mt-2 flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-700">
              <span className="font-semibold">Warning:</span> Overall completeness ({overallRate}%) is below the warning threshold ({warnThreshold}%).
              {warnPrograms.length > 0 && <span> {warnPrograms.length} program{warnPrograms.length > 1 ? "s" : ""} need attention.</span>}
            </div>
          </div>
        )}

        {/* Intro text */}
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          This widget shows how many PLOs in each program have been fully mapped to Graduate Attributes and competencies.
          Use the <span className="font-medium text-gray-700">⚙ settings icon</span> to configure warning and danger thresholds.
          Only programs that are partially mapped or have no PLOs are listed below — fully complete programs are hidden.
        </p>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-xs border-green-400 text-green-700">
            {complete} complete
          </Badge>
          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
            {partial} partial
          </Badge>
          <Badge variant="outline" className="text-xs border-red-300 text-red-600">
            {noPLOs} no PLOs
          </Badge>
          <Badge className={`text-xs text-white ml-auto ${alertLevel === "danger" ? "bg-red-600" : alertLevel === "warn" ? "bg-yellow-500" : "bg-[#8B1538]"}`}>
            {overallRate}% overall
          </Badge>
        </div>
        <ProgressBar value={overallRate} warnThreshold={warnThreshold} dangerThreshold={dangerThreshold} />
      </CardHeader>

      <CardContent className="pt-0">
        {needsAttention.length === 0 ? (
          <div className="flex items-center gap-2 py-3 px-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">All programs are fully mapped — great work!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {needsAttention.map(prog => (
              <div key={prog.programId} className="flex items-center gap-2">
                <StatusIcon rate={prog.completenessRate} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-gray-800 truncate">{prog.programCode}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {prog.completenessRate < dangerThreshold && !prog.hasNoPLOs && (
                        <AlertTriangle className="h-3 w-3 text-red-500" aria-label="Below danger threshold" />
                      )}
                      {prog.completenessRate >= dangerThreshold && prog.completenessRate < warnThreshold && !prog.hasNoPLOs && (
                        <AlertCircle className="h-3 w-3 text-yellow-500" aria-label="Below warning threshold" />
                      )}
                      <span className="text-xs text-gray-500">{prog.mappedPLOs}/{prog.totalPLOs}</span>
                    </div>
                  </div>
                  <ProgressBar value={prog.completenessRate} warnThreshold={warnThreshold} dangerThreshold={dangerThreshold} />
                </div>
              </div>
            ))}
            {data.filter(p => !p.isComplete).length > 8 && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Showing {Math.min(8, data.filter(p => !p.isComplete).length)} of {data.filter(p => !p.isComplete).length} programs needing attention
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
