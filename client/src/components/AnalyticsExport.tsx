import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Image as ImageIcon, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface AnalyticsExportProps {
  title: string;
  chartRef: React.RefObject<HTMLDivElement | null>;
  data: any;
  type: "university" | "college" | "department";
}

export default function AnalyticsExport({ title, chartRef, data, type }: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPNG = async () => {
    if (!chartRef.current) {
      toast.error("Chart not found");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-analytics.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("PNG exported successfully");
    } catch (error) {
      console.error("PNG export error:", error);
      toast.error("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = trpc.analytics.exportToPDF.useMutation();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // First capture the chart as image
      let chartImageData = undefined;
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        chartImageData = canvas.toDataURL();
      }

      // Prepare data for PDF export
      const exportData = {
        title,
        metrics: prepareMetrics(data, type),
        table_data: prepareTableData(data, type),
        chart_image_data: chartImageData,
        timestamp: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
      };

      const result = await exportPDF.mutateAsync({ data: exportData });
      
      // Trigger download using the returned file path
      if (result.filePath) {
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}`;
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-analytics.pdf`;
        link.click();
      }
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = trpc.analytics.exportToExcel.useMutation();

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        title,
        metrics: prepareMetrics(data, type),
        table_data: prepareTableData(data, type),
        timestamp: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
      };

      const result = await exportExcel.mutateAsync({ data: exportData });
      
      // Trigger download using the returned file path
      if (result.filePath) {
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}`;
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-analytics.xlsx`;
        link.click();
      }
      
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const exportWord = trpc.analytics.exportToWord.useMutation();

  const exportToWord = async () => {
    setIsExporting(true);
    try {
      // Capture chart as image
      let chartImageData = undefined;
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        chartImageData = canvas.toDataURL();
      }

      const exportData = {
        title,
        metrics: prepareMetrics(data, type),
        table_data: prepareTableData(data, type),
        chart_image_data: chartImageData,
        timestamp: new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
      };

      const result = await exportWord.mutateAsync({ data: exportData });
      
      // Trigger download using the returned file path
      if (result.filePath) {
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}`;
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-analytics.docx`;
        link.click();
      }
      
      toast.success("Word document exported successfully");
    } catch (error) {
      console.error("Word export error:", error);
      toast.error("Failed to export Word document");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPNG}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToWord}>
          <FileText className="mr-2 h-4 w-4" />
          Export as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
