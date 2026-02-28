import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, PlusCircle, Edit2, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  programId: number;
}

function ActionBadge({ action, details }: { action: string; details: string | null }) {
  const isBulk = details ? (() => { try { return JSON.parse(details)?.bulkImport; } catch { return false; } })() : false;
  if (isBulk) return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs"><Upload className="h-3 w-3 mr-1" />Bulk Import</Badge>;
  if (action === "create") return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs"><PlusCircle className="h-3 w-3 mr-1" />Created</Badge>;
  if (action === "update") return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs"><Edit2 className="h-3 w-3 mr-1" />Updated</Badge>;
  if (action === "delete") return <Badge className="bg-red-100 text-red-700 border-red-300 text-xs"><Trash2 className="h-3 w-3 mr-1" />Deleted</Badge>;
  return <Badge variant="outline" className="text-xs">{action}</Badge>;
}

function formatTime(ts: Date | string) {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function MappingAuditLog({ programId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = trpc.mappings.auditLog.useQuery(
    { programId },
    { enabled: expanded }   // only fetch when the panel is open
  );

  return (
    <Card>
      <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-[#8B1538]" />
            Change History
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-[#8B1538]"
            onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
            aria-label={expanded ? "Collapse change history" : "Expand change history"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500">Recent changes to PLOs, mappings, and justifications for this program.</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No changes recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {data.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 mt-0.5">
                    <ActionBadge action={entry.action} details={entry.details} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Mapping</span>
                      <span className="text-xs text-gray-400">by</span>
                      <span className="text-xs font-medium text-gray-700 truncate">{entry.userName || `User #${entry.userId}`}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
