import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Image as ImageIcon, Loader2, Table } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface AnalyticsExportProps {
  title: string;
  chartRef: React.RefObject<HTMLDivElement | null>;
  data: any;
  type: "university" | "college" | "department" | "ga" | "competency";
  entityCode?: string; // Optional entity code for clean filenames
}

export default function AnalyticsExport({ title, chartRef, data, type, entityCode }: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Generate clean filename based on entity code or title
  const getBaseFilename = () => {
    if (entityCode) {
      return `${entityCode}_Analytics_Report`;
    }
    return title.replace(/\s+/g, "-").toLowerCase();
  };

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
      link.download = `${getBaseFilename()}.png`;
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
        const filename = `${getBaseFilename()}.pdf`;
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}?filename=${encodeURIComponent(filename)}`;
        link.download = filename;
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
        const filename = `${getBaseFilename()}.xlsx`;
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}?filename=${encodeURIComponent(filename)}`;
        link.download = filename;
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
        const filename = `${getBaseFilename()}.docx`;
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}?filename=${encodeURIComponent(filename)}`;
        link.download = filename;
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

  const exportCSV = trpc.analytics.exportToCSV.useMutation();

  const exportToCSV = async () => {
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

      const result = await exportCSV.mutateAsync({ data: exportData });
      
      // Trigger download using the returned file path
      if (result.filePath) {
        const filename = `${getBaseFilename()}.csv`;
        const link = document.createElement("a");
        link.href = `/api/download/${encodeURIComponent(result.filePath)}?filename=${encodeURIComponent(filename)}`;
        link.download = filename;
        link.click();
      }
      
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV");
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
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="mr-2 h-4 w-4" />
          Export as CSV
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
  } else if (type === "ga") {
    metrics.push({ label: "Total Graduate Attributes", value: data.totalGAs || 5 });
    metrics.push({ label: "Total Programs Analyzed", value: data.totalPrograms });
    if (data.gaStats && data.gaStats.length > 0) {
      const avgCoverage = data.gaStats.reduce((sum: number, ga: any) => sum + ga.coverageRate, 0) / data.gaStats.length;
      metrics.push({ label: "Average Coverage Rate", value: `${avgCoverage.toFixed(1)}%` });
    }
  } else if (type === "competency") {
    metrics.push({ label: "Total Competencies", value: data.totalCompetencies || 21 });
    metrics.push({ label: "Total Programs Analyzed", value: data.totalPrograms });
    if (data.competencyStats && data.competencyStats.length > 0) {
      const avgCoverage = data.competencyStats.reduce((sum: number, comp: any) => sum + comp.coverageRate, 0) / data.competencyStats.length;
      metrics.push({ label: "Average Coverage Rate", value: `${avgCoverage.toFixed(1)}%` });
    }
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
  } else if (type === "ga" && data.gaStats) {
    tableData.push(["GA Code", "GA Name", "Programs Mapped", "Coverage Rate", "Avg Alignment Score"]);
    data.gaStats.forEach((ga: any) => {
      tableData.push([
        ga.gaCode,
        ga.gaNameEn,
        `${ga.programCount}/${ga.totalPrograms}`,
        `${ga.coverageRate.toFixed(1)}%`,
        `${ga.avgAlignmentScore.toFixed(1)}%`,
      ]);
    });
  } else if (type === "competency" && data.competencyStats) {
    tableData.push(["Competency Code", "Competency Name", "Programs Using", "Coverage Rate", "Avg Weight"]);
    data.competencyStats.forEach((comp: any) => {
      tableData.push([
        comp.competencyCode,
        comp.competencyNameEn,
        `${comp.programCount}/${comp.totalPrograms}`,
        `${comp.coverageRate.toFixed(1)}%`,
        comp.avgWeight ? comp.avgWeight.toFixed(2) : "0.00",
      ]);
    });
  }
  
  return tableData;
}
