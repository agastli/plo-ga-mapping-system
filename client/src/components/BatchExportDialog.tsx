import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Package } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface Entity {
  id: string;
  name: string;
  code: string;
  data: any;
}

interface BatchExportDialogProps {
  entities: Entity[];
  type: "university" | "college" | "department";
  chartRef?: React.RefObject<HTMLDivElement | null>;
}

export default function BatchExportDialog({ entities, type, chartRef }: BatchExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [format, setFormat] = useState<"pdf" | "excel" | "word" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const batchExport = trpc.analytics.batchExport.useMutation();

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === entities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entities.map(e => e.id));
    }
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one entity to export");
      return;
    }

    setIsExporting(true);
    try {
      // Note: Charts are not included in batch exports to avoid showing incorrect visualizations
      // Each entity would need its own chart rendered, which is not feasible in batch mode
      // Users can export individual entities if charts are needed

      // Prepare entities data
      const selectedEntities = entities
        .filter(e => selectedIds.includes(e.id))
        .map(entity => ({
          title: `${entity.code}_Analytics_Report`,  // Use code for cleaner filenames
          displayName: `${entity.name} (${entity.code})`,  // For display purposes
          data: {
            title: `${entity.name} Analytics Report`,
            metrics: prepareMetrics(entity.data, type),
            table_data: prepareTableData(entity.data, type),
            // chart_image_data is intentionally omitted for batch exports
            timestamp: new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
          },
        }));

      const result = await batchExport.mutateAsync({
        entities: selectedEntities,
        format,
      });

      // Trigger download
      if (result.filePath) {
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}`;
        link.download = `analytics-batch-export-${Date.now()}.zip`;
        link.click();
      }

      toast.success(`Successfully exported ${result.filesExported} ${result.filesExported === 1 ? 'file' : 'files'}`);
      setOpen(false);
      setSelectedIds([]);
    } catch (error) {
      console.error("Batch export error:", error);
      toast.error("Failed to export batch");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Package className="mr-2 h-4 w-4" />
          Batch Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Export Analytics</DialogTitle>
          <DialogDescription>
            Select multiple entities to export their analytics reports in a single ZIP file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entity Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Entities ({selectedIds.length} of {entities.length})</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
              >
                {selectedIds.length === entities.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="border rounded-lg p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {entities.map(entity => (
                <div key={entity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={entity.id}
                    checked={selectedIds.includes(entity.id)}
                    onCheckedChange={() => toggleSelection(entity.id)}
                  />
                  <label
                    htmlFor={entity.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {entity.name} ({entity.code})
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedIds.length === 0}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {selectedIds.length} {selectedIds.length === 1 ? 'Item' : 'Items'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function prepareMetrics(data: any, type: string) {
  const metrics = [];

  if (type === "university") {
    metrics.push({ label: "Total Colleges", value: data.totalColleges });
    metrics.push({ label: "Total Programs", value: data.totalPrograms });
    metrics.push({ label: "Total PLOs", value: data.totalPLOs });
    metrics.push({ label: "Average Alignment Score", value: `${data.averageAlignment.toFixed(1)}%` });
  } else if (type === "college") {
    metrics.push({ label: "Total Departments", value: data.totalDepartments });
    metrics.push({ label: "Total Programs", value: data.totalPrograms });
    metrics.push({ label: "Total PLOs", value: data.totalPLOs });
    metrics.push({ label: "College Alignment Score", value: `${data.averageAlignment.toFixed(1)}%` });
  } else if (type === "department") {
    metrics.push({ label: "Total Programs", value: data.totalPrograms });
    metrics.push({ label: "Total PLOs", value: data.totalPLOs });
    metrics.push({ label: "Department Alignment Score", value: `${data.averageAlignment.toFixed(1)}%` });
  }

  return metrics;
}

function prepareTableData(data: any, type: string) {
  const tableData = [];

  if (type === "university" && data.colleges) {
    tableData.push(["College", "Code", "Programs", "Alignment Score"]);
    data.colleges.forEach((college: any) => {
      tableData.push([
        college.collegeName,
        college.collegeCode,
        college.totalPrograms.toString(),
        `${college.averageAlignment.toFixed(1)}%`,
      ]);
    });
  } else if (type === "college" && data.departments) {
    tableData.push(["Department", "Code", "Programs", "Alignment Score"]);
    data.departments.forEach((dept: any) => {
      tableData.push([
        dept.departmentName,
        dept.departmentCode,
        dept.totalPrograms.toString(),
        `${dept.averageAlignment.toFixed(1)}%`,
      ]);
    });
  } else if (type === "department" && data.programs) {
    tableData.push(["Program", "Code", "PLOs", "Alignment Score", "Coverage Rate"]);
    data.programs.forEach((prog: any) => {
      tableData.push([
        prog.programName,
        prog.programCode,
        prog.totalPLOs.toString(),
        `${prog.alignmentScore.toFixed(1)}%`,
        `${prog.coverageRate.toFixed(1)}%`,
      ]);
    });
  }

  return tableData;
}
