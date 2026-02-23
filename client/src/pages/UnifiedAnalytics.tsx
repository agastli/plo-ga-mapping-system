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
} from "recharts";
import { Home, BookOpen, Download } from "lucide-react";

export default function UnifiedAnalytics() {
  const handleExport = () => {
    if (!gaData || !competencyData) {
      alert('No data available to export');
      return;
    }

    // Create CSV content
    let csvContent = "Graduate Attributes & Competencies Analytics Report\n\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Analysis Level: ${filterLevel}\n\n`;

    // GA Data
    csvContent += "Graduate Attribute Alignment Scores\n";
    csvContent += "GA Code,GA Name,Alignment Score (%)\n";
    gaData.gaStats.forEach(ga => {
      csvContent += `${ga.gaCode},${ga.gaNameEn},${ga.avgAlignmentScore.toFixed(2)}\n`;
    });
    csvContent += "\n";

    // Competency Data
    csvContent += "Competency Average Weights\n";
    csvContent += "Competency Code,Competency Name,Average Weight (%)\n";
    competencyData.competencyStats.forEach(comp => {
      csvContent += `${comp.competencyCode},${comp.competencyNameEn},${(comp.avgWeight * 100).toFixed(2)}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [filterLevel, setFilterLevel] = useState<"university" | "college" | "program">("university");
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>(undefined);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);

  // Fetch colleges and programs for filters
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();

  // Build filter input based on selection
  const filterInput = filterLevel === "college" && selectedCollegeId
    ? { collegeId: selectedCollegeId }
    : filterLevel === "program" && selectedProgramId
    ? { programId: selectedProgramId }
    : undefined;

  const { data: gaData, isLoading: gaLoading } = trpc.analytics.gaAnalytics.useQuery(filterInput);
  const { data: competencyData, isLoading: compLoading } = trpc.analytics.competencyAnalytics.useQuery(filterInput);

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
          <Button 
            onClick={handleExport}
            className="bg-[#8B1538] hover:bg-[#6B1028] flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
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
                    setFilterLevel(e.target.value as "university" | "college" | "program");
                    setSelectedCollegeId(undefined);
                    setSelectedProgramId(undefined);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="university">University-wide</option>
                  <option value="college">By College</option>
                  <option value="program">By Program</option>
                </select>
              </div>

              {/* College Filter */}
              {filterLevel !== "university" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College
                  </label>
                  <select
                    value={selectedCollegeId || ""}
                    onChange={(e) => {
                      const collegeId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedCollegeId(collegeId);
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

        {/* GA Alignment Scores Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Graduate Attribute Alignment Scores</CardTitle>
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
                  <LabelList dataKey="score" position="top" formatter={(value: number) => `${value}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Color Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-gray-700">Strong (≥80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-sm text-gray-700">Moderate (50-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-gray-700">Weak (&lt;50%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competency Average Weights Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Competency Average Weights</CardTitle>
            <p className="text-sm text-gray-600">
              All competencies sorted by average mapping weights (highest to lowest)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={competencyChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: 'Average Weight (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis type="category" dataKey="name" width={60} />
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
                <Bar dataKey="weight" radius={[0, 8, 8, 0]}>
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
                  <LabelList dataKey="weight" position="right" formatter={(value: any) => typeof value === 'number' ? `${value.toFixed(1)}%` : value} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
