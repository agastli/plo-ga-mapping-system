import { useState, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Home, BookOpen, Download, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export default function UnifiedAnalytics() {
  const gaChartRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);
  const competencyChartRef = useRef<HTMLDivElement>(null);
  const comparisonChartRef = useRef<HTMLDivElement>(null);

  const exportPNG = trpc.analytics.exportAnalyticsPNG.useMutation();
  const exportPDF = trpc.analytics.exportAnalyticsPDF.useMutation();
  const exportWord = trpc.analytics.exportAnalyticsWord.useMutation();
  const exportExcel = trpc.analytics.exportAnalyticsExcel.useMutation();

  const captureChartAsBase64 = async (element: HTMLElement): Promise<string> => {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      onclone: (clonedDoc) => {
        // Convert all OKLCH colors to standard hex colors
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          const style = window.getComputedStyle(el);
          
          // Convert color properties
          if (style.color && style.color.includes('oklch')) {
            htmlEl.style.color = '#000000';
          }
          if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
            htmlEl.style.backgroundColor = '#ffffff';
          }
          if (style.borderColor && style.borderColor.includes('oklch')) {
            htmlEl.style.borderColor = '#000000';
          }
          if (style.fill && style.fill.includes('oklch')) {
            htmlEl.style.fill = '#000000';
          }
          if (style.stroke && style.stroke.includes('oklch')) {
            htmlEl.style.stroke = '#000000';
          }
        });
      },
    });
    return canvas.toDataURL('image/png');
  };

  const handleExportPNG = async () => {
    if (!gaChartRef.current || !radarChartRef.current || !competencyChartRef.current) {
      toast.error('Charts not ready for export');
      return;
    }

    try {
      toast.info('Capturing charts...');
      
      // Capture all chart elements as base64
      const gaChartImage = await captureChartAsBase64(gaChartRef.current);
      const radarChartImage = await captureChartAsBase64(radarChartRef.current);
      const compChartImage = await captureChartAsBase64(competencyChartRef.current);
      
      // Capture comparison chart if it exists
      let comparisonChartImage = null;
      if (comparisonChartRef.current) {
        comparisonChartImage = await captureChartAsBase64(comparisonChartRef.current);
      }
      
      toast.info('Generating PNG files...');
      
      // Build context for file naming
      let contextPrefix = 'University-wide';
      if (filterLevel === 'college' && selectedCollegeId) {
        const college = colleges?.find(c => c.id === selectedCollegeId);
        contextPrefix = college ? college.nameEn.replace(/\s+/g, '_') : 'College';
      } else if (filterLevel === 'program' && selectedProgramId) {
        const program = programs?.find(p => p.program.id === selectedProgramId);
        contextPrefix = program ? program.program.nameEn.replace(/\s+/g, '_') : 'Program';
      }
      
      const chartImages = [
        { title: `${contextPrefix}_GA_Alignment_Scores`, imageData: gaChartImage },
        { title: `${contextPrefix}_GA_Coverage_Profile`, imageData: radarChartImage },
      ];
      
      // Add comparison chart if available
      if (comparisonChartImage) {
        const comparisonTitle = filterLevel === 'university' 
          ? `${contextPrefix}_College_Comparison` 
          : `${contextPrefix}_Program_Comparison`;
        chartImages.push({ title: comparisonTitle, imageData: comparisonChartImage });
      }
      
      chartImages.push({ title: `${contextPrefix}_Competency_Average_Weights`, imageData: compChartImage });
      
      const result = await exportPNG.mutateAsync({ chartImages });
      
      // Download the files
      for (const file of result.files) {
        const link = document.createElement('a');
        link.href = '/api/download/' + encodeURIComponent(file.path);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('PNG charts exported successfully!');
    } catch (error) {
      console.error('Error exporting charts:', error);
      toast.error('Error exporting charts. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    if (!gaChartRef.current || !radarChartRef.current || !competencyChartRef.current || !gaData || !competencyData) {
      toast.error('Charts not ready for export');
      return;
    }

    try {
      toast.info('Generating PDF report...');
      
      // Capture all chart images
      const gaChartImage = await captureChartAsBase64(gaChartRef.current);
      const radarChartImage = await captureChartAsBase64(radarChartRef.current);
      const compChartImage = await captureChartAsBase64(competencyChartRef.current);
      
      let comparisonChartImage = null;
      if (comparisonChartRef.current) {
        comparisonChartImage = await captureChartAsBase64(comparisonChartRef.current);
      }
      
      // Build context
      let contextPrefix = 'University-wide';
      let collegeName = 'All';
      let programName = 'All';
      
      if (filterLevel === 'college' && selectedCollegeId) {
        const college = colleges?.find(c => c.id === selectedCollegeId);
        contextPrefix = college ? college.nameEn.replace(/\s+/g, '_') : 'College';
        collegeName = college ? college.nameEn : 'All';
      } else if (filterLevel === 'program' && selectedProgramId) {
        const program = programs?.find(p => p.program.id === selectedProgramId);
        contextPrefix = program ? program.program.nameEn.replace(/\s+/g, '_') : 'Program';
        programName = program ? program.program.nameEn : 'All';
        collegeName = program ? program.college.nameEn : 'All';
      }
      
      const chartImages = [
        { title: `${contextPrefix}_GA_Alignment_Scores`, imageData: gaChartImage },
        { title: `${contextPrefix}_GA_Coverage_Profile`, imageData: radarChartImage },
      ];
      
      if (comparisonChartImage) {
        const comparisonTitle = filterLevel === 'university' 
          ? `${contextPrefix}_College_Comparison` 
          : `${contextPrefix}_Program_Comparison`;
        chartImages.push({ title: comparisonTitle, imageData: comparisonChartImage });
      }
      
      chartImages.push({ title: `${contextPrefix}_Competency_Average_Weights`, imageData: compChartImage });
      
      // Prepare metrics
      const avgGAScore = gaStats.reduce((sum, ga) => sum + ga.avgAlignmentScore, 0) / gaStats.length;
      const metrics = [
        { label: 'Total GAs', value: totalGAs },
        { label: 'Total Competencies', value: totalCompetencies },
        { label: 'Total Programs', value: totalPrograms },
        { label: 'Average GA Score', value: `${avgGAScore.toFixed(2)}%` },
      ];
      
      // Prepare GA summary table data
      const tableData = [
        ['GA Code', 'GA Name', 'Alignment Score (%)'],
        ...gaStats.map(ga => [ga.gaCode, ga.gaNameEn, ga.avgAlignmentScore.toFixed(2)]),
      ];
      
      // Prepare competency breakdown table data
      const competencyTableData = [
        ['Competency Code', 'Competency Name', 'Average Weight (%)'],
        ...competencyStats.map(comp => [
          comp.competencyCode,
          comp.competencyNameEn,
          (comp.avgWeight * 100).toFixed(2)
        ]),
      ];
      
      const result = await exportPDF.mutateAsync({
        title: 'Graduate Attributes & Competencies Analytics',
        filterContext: { collegeName, programName },
        metrics,
        chartImages,
        tableData,
        competencyTableData,
        colorLegend: {
          green: 'Strong (≥80%)',
          yellow: 'Moderate (50-79%)',
          red: 'Weak (<50%)',
        },
      });
      
      // Download the file
      const link = document.createElement('a');
      link.href = '/api/download/' + encodeURIComponent(result.path);
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF. Please try again.');
    }
  };

  const handleExportWord = async () => {
    if (!gaChartRef.current || !radarChartRef.current || !competencyChartRef.current || !gaData || !competencyData) {
      toast.error('Charts not ready for export');
      return;
    }

    try {
      toast.info('Generating Word document...');
      
      const gaChartImage = await captureChartAsBase64(gaChartRef.current);
      const radarChartImage = await captureChartAsBase64(radarChartRef.current);
      const compChartImage = await captureChartAsBase64(competencyChartRef.current);
      
      let comparisonChartImage = null;
      if (comparisonChartRef.current) {
        comparisonChartImage = await captureChartAsBase64(comparisonChartRef.current);
      }
      
      let contextPrefix = 'University-wide';
      let collegeName = 'All';
      let programName = 'All';
      
      if (filterLevel === 'college' && selectedCollegeId) {
        const college = colleges?.find(c => c.id === selectedCollegeId);
        contextPrefix = college ? college.nameEn.replace(/\s+/g, '_') : 'College';
        collegeName = college ? college.nameEn : 'All';
      } else if (filterLevel === 'program' && selectedProgramId) {
        const program = programs?.find(p => p.program.id === selectedProgramId);
        contextPrefix = program ? program.program.nameEn.replace(/\s+/g, '_') : 'Program';
        programName = program ? program.program.nameEn : 'All';
        collegeName = program ? program.college.nameEn : 'All';
      }
      
      const chartImages = [
        { title: `${contextPrefix}_GA_Alignment_Scores`, imageData: gaChartImage },
        { title: `${contextPrefix}_GA_Coverage_Profile`, imageData: radarChartImage },
      ];
      
      if (comparisonChartImage) {
        const comparisonTitle = filterLevel === 'university' 
          ? `${contextPrefix}_College_Comparison` 
          : `${contextPrefix}_Program_Comparison`;
        chartImages.push({ title: comparisonTitle, imageData: comparisonChartImage });
      }
      
      chartImages.push({ title: `${contextPrefix}_Competency_Average_Weights`, imageData: compChartImage });
      
      const avgGAScore = gaStats.reduce((sum, ga) => sum + ga.avgAlignmentScore, 0) / gaStats.length;
      const metrics = [
        { label: 'Total GAs', value: totalGAs },
        { label: 'Total Competencies', value: totalCompetencies },
        { label: 'Total Programs', value: totalPrograms },
        { label: 'Average GA Score', value: `${avgGAScore.toFixed(2)}%` },
      ];
      
      const tableData = [
        ['GA Code', 'GA Name', 'Alignment Score (%)'],
        ...gaStats.map(ga => [ga.gaCode, ga.gaNameEn, ga.avgAlignmentScore.toFixed(2)]),
      ];
      
      // Prepare competency breakdown table data
      const competencyTableData = [
        ['Competency Code', 'Competency Name', 'Average Weight (%)'],
        ...competencyStats.map(comp => [
          comp.competencyCode,
          comp.competencyNameEn,
          (comp.avgWeight * 100).toFixed(2)
        ]),
      ];
      
      const result = await exportWord.mutateAsync({
        title: 'Graduate Attributes & Competencies Analytics',
        filterContext: { collegeName, programName },
        metrics,
        chartImages,
        tableData,
        competencyTableData,
        colorLegend: {
          green: 'Strong (≥80%)',
          yellow: 'Moderate (50-79%)',
          red: 'Weak (<50%)',
        },
      });
      
      const link = document.createElement('a');
      link.href = '/api/download/' + encodeURIComponent(result.path);
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Word document generated successfully!');
    } catch (error) {
      console.error('Error generating Word:', error);
      toast.error('Error generating Word document. Please try again.');
    }
  };

  const handleExportExcel = async () => {
    if (!gaData || !competencyData) {
      toast.error('No data available to export');
      return;
    }

    try {
      toast.info('Generating Excel file...');
      
      let collegeName = 'All';
      let programName = 'All';
      
      if (filterLevel === 'college' && selectedCollegeId) {
        const college = colleges?.find(c => c.id === selectedCollegeId);
        collegeName = college ? college.nameEn : 'All';
      } else if (filterLevel === 'program' && selectedProgramId) {
        const program = programs?.find(p => p.program.id === selectedProgramId);
        programName = program ? program.program.nameEn : 'All';
        collegeName = program ? program.college.nameEn : 'All';
      }
      
      const avgGAScore = gaStats.reduce((sum, ga) => sum + ga.avgAlignmentScore, 0) / gaStats.length;
      const metrics = [
        { label: 'Total GAs', value: totalGAs },
        { label: 'Total Competencies', value: totalCompetencies },
        { label: 'Total Programs', value: totalPrograms },
        { label: 'Average GA Score', value: `${avgGAScore.toFixed(2)}%` },
      ];
      
      const tableData = [
        ['GA Code', 'GA Name', 'Alignment Score (%)'],
        ...gaStats.map(ga => [ga.gaCode, ga.gaNameEn, ga.avgAlignmentScore.toFixed(2)]),
      ];
      
      // Prepare competency breakdown table data
      const competencyTableData = [
        ['Competency Code', 'Competency Name', 'Average Weight (%)'],
        ...competencyStats.map(comp => [
          comp.competencyCode,
          comp.competencyNameEn,
          (comp.avgWeight * 100).toFixed(2)
        ]),
      ];
      
      const result = await exportExcel.mutateAsync({
        title: 'Graduate Attributes & Competencies Analytics',
        filterContext: { collegeName, programName },
        metrics,
        tableData,
        competencyTableData,
      });
      
      const link = document.createElement('a');
      link.href = '/api/download/' + encodeURIComponent(result.path);
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel file generated successfully!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Error generating Excel file. Please try again.');
    }
  };

  const [filterLevel, setFilterLevel] = useState<"university" | "college" | "cluster" | "program">("university");
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>(undefined);
  const [selectedClusterId, setSelectedClusterId] = useState<number | undefined>(undefined);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);

  // Fetch colleges, clusters, and programs for filters
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: allClusters } = trpc.clusters.list.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();
  
  // Filter clusters by selected college
  const clusters = selectedCollegeId && allClusters
    ? allClusters.filter((c: any) => c.collegeId === selectedCollegeId)
    : [];
  
  // Check if selected college has clusters
  const hasCluster = clusters.length > 0;

  // Build filter input based on selection
  const filterInput = filterLevel === "college" && selectedCollegeId
    ? { collegeId: selectedCollegeId }
    : filterLevel === "cluster" && selectedClusterId
    ? { clusterId: selectedClusterId }
    : filterLevel === "program" && selectedProgramId
    ? { programId: selectedProgramId }
    : undefined;

  const { data: gaData, isLoading: gaLoading } = trpc.analytics.gaAnalytics.useQuery(filterInput);
  const { data: competencyData, isLoading: compLoading } = trpc.analytics.competencyAnalytics.useQuery(filterInput);
  
  // Fetch comparison data based on filter level
  const { data: collegeComparisonData } = trpc.analytics.gaByCollegeAnalytics.useQuery(
    undefined,
    { enabled: filterLevel === 'university' }
  );
  const { data: programComparisonData } = trpc.analytics.gaByProgramAnalytics.useQuery(
    { collegeId: selectedCollegeId! },
    { enabled: filterLevel === 'college' && !!selectedCollegeId }
  );
  
  const { data: clusterComparisonData } = trpc.analytics.gaByCollegeAnalytics.useQuery(
    undefined,
    { enabled: false } // TODO: Implement gaByClusterAnalytics endpoint
  );

  // Filter programs by selected college for cascading dropdown
  const filteredPrograms = selectedCollegeId && programs
    ? programs.filter((p) => p.department.collegeId === selectedCollegeId)
    : [];

  const isLoading = gaLoading || compLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!gaData || !competencyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const { gaStats, totalGAs, totalPrograms } = gaData;
  const { competencyStats, totalCompetencies } = competencyData;

  // Prepare GA chart data
  const gaChartData = gaStats.map((ga) => ({
    name: ga.gaCode,
    score: ga.avgAlignmentScore,
    fullName: ga.gaNameEn,
  }));

  // Prepare Competency chart data (ordered by GA, not sorted by weight)
  // Ensure proper ordering: C1-1, C1-2, C1-3, C1-4, C2-1, C2-2, etc.
  const competencyChartData = competencyStats
    .sort((a, b) => {
      const aMatch = a.competencyCode.match(/C(\d+)-(\d+)/);
      const bMatch = b.competencyCode.match(/C(\d+)-(\d+)/);
      if (!aMatch || !bMatch) return a.competencyCode.localeCompare(b.competencyCode);
      const aGA = parseInt(aMatch[1]);
      const bGA = parseInt(bMatch[1]);
      const aComp = parseInt(aMatch[2]);
      const bComp = parseInt(bMatch[2]);
      if (aGA !== bGA) return aGA - bGA;
      return aComp - bComp;
    })
    .map((comp) => ({
      name: comp.competencyCode,
      weight: comp.avgWeight * 100, // Convert to percentage
      fullName: comp.competencyNameEn,
    }));

  // Colors for charts
  const GA_COLORS = ["#8B1538", "#A91D3A", "#C73E1D", "#E67E22", "#F39C12"];

  const Header = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/qu-logo.png" alt="QU Logo" className="h-14" />
          <div>
            <h1 className="text-xl font-bold text-[#8B1538]">PLO-GA Mapping System</h1>
            <p className="text-sm text-gray-600">Academic Planning & Quality Assurance Office</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/analytics/guide">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Guide
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#8B1538] hover:bg-[#6B1028] flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportPNG}>
                Export as PNG (Images)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord}>
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/">
            <Button className="bg-[#8B1538] hover:bg-[#6B1028] flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="container mx-auto py-8">
        <Header />

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#8B1538] mb-2">
            Graduate Attributes & Competencies Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive analysis of GA alignment and competency coverage across programs
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value as "university" | "college" | "cluster" | "program");
                    setSelectedCollegeId(undefined);
                    setSelectedClusterId(undefined);
                    setSelectedProgramId(undefined);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="university">University-wide</option>
                  <option value="college">By College</option>
                  <option value="cluster">By Cluster</option>
                  <option value="program">By Program</option>
                </select>
              </div>

              {/* College Filter */}
              {(filterLevel === "college" || filterLevel === "cluster" || filterLevel === "program") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College
                  </label>
                  <select
                    value={selectedCollegeId || ""}
                    onChange={(e) => {
                      const collegeId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedCollegeId(collegeId);
                      setSelectedClusterId(undefined);
                      setSelectedProgramId(undefined);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select College</option>
                    {colleges?.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cluster Filter */}
              {filterLevel === "cluster" && selectedCollegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cluster
                  </label>
                  <select
                    value={selectedClusterId || ""}
                    onChange={(e) => {
                      const clusterId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedClusterId(clusterId);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Cluster</option>
                    {clusters?.map((cluster: any) => (
                      <option key={cluster.id} value={cluster.id}>
                        {cluster.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Program Filter */}
              {filterLevel === "program" && selectedCollegeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program
                  </label>
                  <select
                    value={selectedProgramId || ""}
                    onChange={(e) => {
                      const programId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedProgramId(programId);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Program</option>
                    {filteredPrograms.map((item) => (
                      <option key={item.program.id} value={item.program.id}>
                        {item.program.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total GAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B1538]">{totalGAs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Competencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B1538]">{totalCompetencies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B1538]">{totalPrograms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg GA Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B1538]">
                {(gaStats.reduce((sum, ga) => sum + ga.avgAlignmentScore, 0) / gaStats.length).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GA Charts - Bar Chart and Radar Chart Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* GA Alignment Scores Bar Chart */}
          <Card ref={gaChartRef}>
            <CardHeader>
              <CardTitle>Graduate Attribute Alignment Scores</CardTitle>
              <p className="text-sm font-semibold text-[#8B1538] mb-1">
                {filterLevel === 'university' ? 'University-wide' : 
                 filterLevel === 'college' && selectedCollegeId ? 
                   colleges?.find(c => c.id === selectedCollegeId)?.nameEn || 'College' :
                 filterLevel === 'program' && selectedProgramId ?
                   programs?.find(p => p.program.id === selectedProgramId)?.program.nameEn || 'Program' :
                 'All Programs'}
              </p>
              <p className="text-sm text-gray-600">
                Average alignment strength across all programs (0-100%)
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Alignment Score (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="font-bold">{payload[0].payload.fullName}</p>
                            <p className="text-sm">
                              <span className="font-medium">Score:</span> {payload[0].value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {gaChartData.map((entry, index) => {
                      // Threshold-based coloring
                      let color = "#22C55E"; // Green for ≥80%
                      if (entry.score < 50) {
                        color = "#EF4444"; // Red for <50%
                      } else if (entry.score < 80) {
                        color = "#EAB308"; // Yellow for 50-79%
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                    <LabelList dataKey="score" position="top" formatter={(value: number) => value + '%'} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Color Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#22c55e', borderRadius: '4px', border: '1px solid #22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Strong (≥80%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#eab308', borderRadius: '4px', border: '1px solid #eab308', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Moderate (50-79%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '4px', border: '1px solid #ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Weak (&lt;50%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GA Coverage Profile Radar Chart */}
          <Card ref={radarChartRef}>
            <CardHeader>
              <CardTitle>Graduate Attribute Coverage Profile</CardTitle>
              <p className="text-sm font-semibold text-[#8B1538] mb-1">
                {filterLevel === 'university' ? 'University-wide' : 
                 filterLevel === 'college' && selectedCollegeId ? 
                   colleges?.find(c => c.id === selectedCollegeId)?.nameEn || 'College' :
                 filterLevel === 'program' && selectedProgramId ?
                   programs?.find(p => p.program.id === selectedProgramId)?.program.nameEn || 'Program' :
                 'All Programs'}
              </p>
              <p className="text-sm text-gray-600">
                Radar view of coverage and alignment across all GAs
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={gaChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Alignment Score (%)"
                    dataKey="score"
                    stroke="#8B1538"
                    fill="#8B1538"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="font-bold">{payload[0].payload.fullName}</p>
                            <p className="text-sm">
                              <span className="font-medium">Alignment Score:</span> {payload[0].value}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart - Colleges or Programs */}
        {(filterLevel === 'university' && collegeComparisonData) || (filterLevel === 'college' && programComparisonData) ? (
          <Card className="mb-6" ref={comparisonChartRef}>
            <CardHeader>
              <CardTitle>
                {filterLevel === 'university' ? 'College Comparison - Average GA Scores' : 'Program Comparison - Average GA Scores'}
              </CardTitle>
              <p className="text-sm font-semibold text-[#8B1538] mb-1">
                {filterLevel === 'university' ? 'University-wide' : 
                 colleges?.find(c => c.id === selectedCollegeId)?.nameEn || 'College'}
              </p>
              <p className="text-sm text-gray-600">
                {filterLevel === 'university' 
                  ? 'Average GA alignment scores across all colleges' 
                  : 'Average GA alignment scores across all programs in the college'}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={
                  filterLevel === 'university' && collegeComparisonData
                    ? collegeComparisonData.heatmapData.map((college: any) => ({
                        name: college.collegeCode,
                        score: college.gaScores.reduce((sum: number, ga: any) => sum + ga.score, 0) / college.gaScores.length,
                      }))
                    : programComparisonData
                    ? programComparisonData.programData.map((program: any) => ({
                        name: program.programCode,
                        score: program.gaScores.reduce((sum: number, ga: any) => sum + ga.score, 0) / program.gaScores.length,
                      }))
                    : []
                }>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Average GA Score (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {(filterLevel === 'university' && collegeComparisonData
                      ? collegeComparisonData.heatmapData.map((college: any) => ({
                          score: college.gaScores.reduce((sum: number, ga: any) => sum + ga.score, 0) / college.gaScores.length,
                        }))
                      : programComparisonData
                      ? programComparisonData.programData.map((program: any) => ({
                          score: program.gaScores.reduce((sum: number, ga: any) => sum + ga.score, 0) / program.gaScores.length,
                        }))
                      : []
                    ).map((entry: any, index: number) => {
                      const score = entry.score;
                      const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                    <LabelList dataKey="score" position="top" formatter={(value: number) => value.toFixed(1) + '%'} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Color Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#22c55e', borderRadius: '4px', border: '1px solid #22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Strong (≥80%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#eab308', borderRadius: '4px', border: '1px solid #eab308', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Moderate (50-79%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '4px', border: '1px solid #ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Weak (&lt;50%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Competency Average Weights Chart */}
        <Card className="mb-6" ref={competencyChartRef}>
          <CardHeader>
            <CardTitle>Competency Average Weights</CardTitle>
            <p className="text-sm font-semibold text-[#8B1538] mb-1">
              {filterLevel === 'university' ? 'University-wide' : 
               filterLevel === 'college' && selectedCollegeId ? 
                 colleges?.find(c => c.id === selectedCollegeId)?.nameEn || 'College' :
               filterLevel === 'program' && selectedProgramId ?
                 programs?.find(p => p.program.id === selectedProgramId)?.program.nameEn || 'Program' :
               'All Programs'}
            </p>
            <p className="text-sm text-gray-600">
              All competencies ordered by Graduate Attribute
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={600}>
              <BarChart data={competencyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis label={{ value: 'Average Weight (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                          <p className="font-bold">{payload[0].payload.fullName}</p>
                          <p className="text-sm">
                            <span className="font-medium">Weight:</span> {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="weight" radius={[8, 8, 0, 0]}>
                  {competencyChartData.map((entry, index) => {
                    // Threshold-based coloring
                    let color = "#22C55E"; // Green for ≥80%
                    if (entry.weight < 50) {
                      color = "#EF4444"; // Red for <50%
                    } else if (entry.weight < 80) {
                      color = "#EAB308"; // Yellow for 50-79%
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                  <LabelList dataKey="weight" position="top" formatter={(value: any) => typeof value === 'number' ? `${value.toFixed(1)}%` : value} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Color Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#22c55e', borderRadius: '4px', border: '1px solid #22c55e', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Strong (≥80%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#eab308', borderRadius: '4px', border: '1px solid #eab308', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Moderate (50-79%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '4px', border: '1px solid #ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: '16px' }}>Weak (&lt;50%)</span>
              </div>
            </div>
            {/* GA Separators */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Competencies grouped by Graduate Attribute: GA1 (C1-1 to C1-4), GA2 (C2-1 to C2-4), GA3 (C3-1 to C3-3), GA4 (C4-1 to C4-5), GA5 (C5-1 to C5-5)</p>
            </div>
          </CardContent>
        </Card>

        {/* GA Data Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Graduate Attributes Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#8B1538] text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left">GA Code</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Graduate Attribute</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Alignment Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {gaStats.map((ga, index) => (
                    <tr key={ga.gaCode} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{ga.gaCode}</td>
                      <td className="border border-gray-300 px-4 py-2">{ga.gaNameEn}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        {ga.avgAlignmentScore.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Competency Data Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Competencies Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#8B1538] text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left">Code</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Competency</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Average Weight (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {competencyStats
                    .sort((a, b) => a.competencyCode.localeCompare(b.competencyCode))
                    .map((comp, index) => (
                    <tr key={comp.competencyCode} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{comp.competencyCode}</td>
                      <td className="border border-gray-300 px-4 py-2">{comp.competencyNameEn}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        {(comp.avgWeight * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
