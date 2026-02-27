import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, Circle, BarChart3 } from "lucide-react";

function StatusIcon({ rate }: { rate: number }) {
  if (rate === 100) return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />;
  if (rate >= 50) return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return <Circle className="h-4 w-4 text-red-400 flex-shrink-0" />;
}

function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? "bg-green-500" : value >= 50 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MappingCompletenessWidget() {
  const { data, isLoading } = trpc.analytics.programCompleteness.useQuery();

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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
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

  const total = data.length;
  const complete = data.filter(p => p.isComplete).length;
  const noPLOs = data.filter(p => p.hasNoPLOs).length;
  const partial = total - complete - noPLOs;
  const overallRate = total > 0 ? Math.round((complete / total) * 100) : 0;

  // Show top 8 programs sorted by completeness ascending (most urgent first)
  const sorted = [...data].sort((a, b) => a.completenessRate - b.completenessRate).slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#8B1538]" />
            Mapping Completeness
          </CardTitle>
          <Link href="/admin/completeness">
            <span className="text-xs text-[#8B1538] hover:underline cursor-pointer">View all →</span>
          </Link>
        </div>
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
          <Badge className="text-xs bg-[#8B1538] text-white ml-auto">
            {overallRate}% overall
          </Badge>
        </div>
        <ProgressBar value={overallRate} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {sorted.map(prog => (
            <div key={prog.programId} className="flex items-center gap-2">
              <StatusIcon rate={prog.completenessRate} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-gray-800 truncate">{prog.programCode}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {prog.mappedPLOs}/{prog.totalPLOs}
                  </span>
                </div>
                <ProgressBar value={prog.completenessRate} />
              </div>
            </div>
          ))}
        </div>
        {data.length > 8 && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            Showing {Math.min(8, data.length)} of {data.length} programs (lowest first)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
