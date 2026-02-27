import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  programId: number;
  onImported?: () => void;
}

interface ParsedRow {
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  valid: boolean;
  error?: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  // Detect if first line is a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes("code") || firstLine.includes("plo") || firstLine.includes("description");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, idx) => {
    // Simple CSV split (handles quoted fields)
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(c => c.replace(/^"|"$/g, "").trim()) ?? line.split(",").map(c => c.trim());
    const code = cols[0] || "";
    const descriptionEn = cols[1] || undefined;
    const descriptionAr = cols[2] || undefined;

    if (!code) {
      return { code: "", descriptionEn, descriptionAr, valid: false, error: `Row ${idx + 1}: Missing PLO code` };
    }
    if (code.length > 50) {
      return { code, descriptionEn, descriptionAr, valid: false, error: `Row ${idx + 1}: Code too long (max 50 chars)` };
    }
    return { code, descriptionEn, descriptionAr, valid: true };
  });
}

const TEMPLATE_CSV = `code,description_en,description_ar
PLO1,Demonstrate knowledge of fundamental principles,إظهار المعرفة بالمبادئ الأساسية
PLO2,Apply critical thinking to solve complex problems,تطبيق التفكير النقدي لحل المشكلات المعقدة
PLO3,Communicate effectively in written and oral forms,التواصل الفعّال كتابةً وشفهياً`;

export default function PLOBulkImport({ programId, onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const bulkImport = trpc.plos.bulkImport.useMutation({
    onSuccess: (result) => {
      toast.success(`Imported ${result.inserted} PLO(s). ${result.skipped} duplicate(s) skipped.`);
      utils.plos.listByProgram.invalidate({ programId });
      setRows([]);
      setFileName("");
      setOpen(false);
      onImported?.();
    },
    onError: (err) => {
      toast.error(`Import failed: ${err.message}`);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const validRows = rows.filter(r => r.valid);
  const invalidRows = rows.filter(r => !r.valid);

  const handleImport = () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }
    bulkImport.mutate({
      programId,
      rows: validRows.map(r => ({
        code: r.code,
        descriptionEn: r.descriptionEn,
        descriptionAr: r.descriptionAr,
      })),
    });
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plo_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Bulk Import PLOs (CSV)
      </Button>
    );
  }

  return (
    <Card className="border-[#8B1538]/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#8B1538]" />
            Bulk Import PLOs from CSV
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setRows([]); setFileName(""); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">CSV Format (3 columns):</p>
          <code className="block bg-white border border-amber-200 rounded px-2 py-1 font-mono">
            code, description_en, description_ar
          </code>
          <p>The first row can be a header (it will be skipped automatically). Only <strong>code</strong> is required. Duplicate codes are skipped.</p>
        </div>

        {/* Download template */}
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download CSV Template
        </Button>

        {/* File picker */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#8B1538] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          {fileName ? (
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
          ) : (
            <p className="text-sm text-gray-500">Click to select a CSV file</p>
          )}
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </div>

        {/* Preview */}
        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {validRows.length} valid
              </Badge>
              {invalidRows.length > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {invalidRows.length} error(s)
                </Badge>
              )}
            </div>

            {/* Error list */}
            {invalidRows.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700 space-y-0.5">
                {invalidRows.map((r, i) => <p key={i}>{r.error}</p>)}
              </div>
            )}

            {/* Valid rows preview (first 5) */}
            <div className="max-h-40 overflow-y-auto border rounded-md text-xs">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-semibold">Code</th>
                    <th className="text-left p-2 font-semibold">Description (EN)</th>
                    <th className="text-left p-2 font-semibold">Description (AR)</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-mono font-medium">{r.code}</td>
                      <td className="p-2 text-gray-600 truncate max-w-[160px]">{r.descriptionEn || "—"}</td>
                      <td className="p-2 text-gray-600 truncate max-w-[160px]" dir="rtl">{r.descriptionAr || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 10 && (
                <p className="text-center text-gray-400 py-1">…and {validRows.length - 10} more</p>
              )}
            </div>
          </div>
        )}

        {/* Import button */}
        {validRows.length > 0 && (
          <Button
            className="w-full bg-[#8B1538] hover:bg-[#6B1028] text-white"
            onClick={handleImport}
            disabled={bulkImport.isPending}
          >
            {bulkImport.isPending ? "Importing…" : `Import ${validRows.length} PLO(s)`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
