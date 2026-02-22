import { useState } from "react";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { Home, BookOpen, Download, FileText, FileSpreadsheet, FileImage } from "lucide-react";

export default function GAAnalytics() {
  const [filterLevel, setFilterLevel] = useState<"university" | "college" | "program">("university");
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>(undefined);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "word">("pdf");

  // Fetch colleges and programs for filters
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();

  // Build filter input based on selection
  const filterInput = filterLevel === "college" && selectedCollegeId
    ? { collegeId: selectedCollegeId }
    : filterLevel === "program" && selectedProgramId
    ? { programId: selectedProgramId }
    : undefined;

  const { data: gaData, isLoading } = trpc.analytics.gaAnalytics.useQuery(filterInput);
  const { data: gaByCollegeData } = trpc.analytics.gaByCollegeAnalytics.useQuery();

  // Filter programs by selected college for cascading dropdown
  const filteredPrograms = selectedCollegeId && programs
    ? programs.filter((p) => {
        const college = colleges?.find((c) => c.id === selectedCollegeId);
        if (!college) return false;
        // Find department for this program
        // Note: We'll need to fetch departments to properly filter
        return true; // For now, show all programs
      })
    : programs || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Graduate Attribute Analytics...</p>
        </div>
      </div>
    );
  }

  if (!gaData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const { gaStats, totalGAs, totalPrograms } = gaData;

  // Prepare data for charts
  const coverageChartData = gaStats.map((ga) => ({
    name: ga.gaCode,
    coverage: ga.coverageRate,
    programs: ga.programCount,
  }));

  const alignmentChartData = gaStats.map((ga) => ({
    name: ga.gaCode,
    score: ga.avgAlignmentScore,
  }));

  const radarChartData = gaStats.map((ga) => ({
    ga: ga.gaCode,
    coverage: ga.coverageRate,
    alignment: ga.avgAlignmentScore,
  }));

  // Colors for charts
  const COLORS = ["#8B1538", "#A91D3A", "#C73E1D", "#E67E22", "#F39C12"];

  // Prepare heatmap data
  const heatmapData = gaByCollegeData?.heatmapData || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B1538] to-[#A91D3A] text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Graduate Attributes Analytics</h1>
              <p className="text-white/90 text-lg">
                Comprehensive analysis of Graduate Attributes across all programs
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="bg-white text-[#8B1538] hover:bg-gray-100">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="bg-white text-[#8B1538] hover:bg-gray-100">
                  <FileText className="mr-2 h-4 w-4" />
                  Main Analytics
                </Button>
              </Link>
              <Link href="/analytics-guide">
                <Button variant="outline" className="bg-white text-[#8B1538] hover:bg-gray-100">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Analytics Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filter Section */}
        <Card className="mb-8 border-2 border-[#8B1538]">
          <CardHeader>
            <CardTitle>Filter Analytics</CardTitle>
            <p className="text-sm text-gray-600">View data at different organizational levels</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter Level */}
              <div>
                <label className="block text-sm font-medium mb-2">View Level</label>
                <select
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value as "university" | "college" | "program");
                    setSelectedCollegeId(undefined);
                    setSelectedProgramId(undefined);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="university">University-wide</option>
                  <option value="college">By College</option>
                  <option value="program">By Program</option>
                </select>
              </div>

              {/* College Selector */}
              {filterLevel === "college" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select College</label>
                  <select
                    value={selectedCollegeId || ""}
                    onChange={(e) => setSelectedCollegeId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Select College --</option>
                    {colleges?.map((college) => (
                      <option key={college.id} value={college.id}>
                        {college.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Program Selector */}
              {filterLevel === "program" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Program</label>
                  <select
                    value={selectedProgramId || ""}
                    onChange={(e) => setSelectedProgramId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- Select Program --</option>
                    {programs?.map((item) => (
                      <option key={item.program.id} value={item.program.id}>
                        {item.program.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Current Filter Display */}
            <div className="mt-4 p-3 bg-amber-50 rounded">
              <p className="text-sm font-semibold text-[#8B1538]">
                Current View: {filterLevel === "university" ? "University-wide" : filterLevel === "college" ? `College: ${colleges?.find((c) => c.id === selectedCollegeId)?.nameEn || "Select a college"}` : `Program: ${programs?.find((p) => p.program.id === selectedProgramId)?.program.nameEn || "Select a program"}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#8B1538]">
            <CardHeader>
              <CardTitle className="text-lg">Total Graduate Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#8B1538]">{totalGAs}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#A91D3A]">
            <CardHeader>
              <CardTitle className="text-lg">Total Programs Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#A91D3A]">{totalPrograms}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#C73E1D]">
            <CardHeader>
              <CardTitle className="text-lg">Average Coverage Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#C73E1D]">
                {(gaStats.reduce((sum, ga) => sum + ga.coverageRate, 0) / gaStats.length).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* GA Coverage Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Graduate Attribute Coverage Distribution</CardTitle>
            <p className="text-sm text-gray-600">
              Percentage of programs that map to each Graduate Attribute
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={coverageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Coverage Rate (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p className="text-sm text-gray-600">
                            Coverage: {payload[0].value}%
                          </p>
                          <p className="text-sm text-gray-600">
                            Programs: {payload[0].payload.programs}/{totalPrograms}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="coverage" fill="#8B1538" name="Coverage Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Alignment Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Average Alignment Scores per Graduate Attribute</CardTitle>
            <p className="text-sm text-gray-600">
              Average alignment strength across all programs
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={alignmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Alignment Score (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#A91D3A" name="Alignment Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart - GA Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Graduate Attribute Coverage Profile</CardTitle>
            <p className="text-sm text-gray-600">
              Radar view of coverage and alignment across all GAs
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="ga" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Coverage Rate (%)"
                  dataKey="coverage"
                  stroke="#8B1538"
                  fill="#8B1538"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Alignment Score (%)"
                  dataKey="alignment"
                  stroke="#A91D3A"
                  fill="#A91D3A"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GA by College Heatmap */}
        {heatmapData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Graduate Attribute Emphasis by College</CardTitle>
              <p className="text-sm text-gray-600">
                Which colleges emphasize which Graduate Attributes (alignment scores)
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-[#8B1538] text-white p-3 text-left">
                        College
                      </th>
                      {gaByCollegeData?.gaList.map((ga) => (
                        <th
                          key={ga.code}
                          className="border border-gray-300 bg-[#8B1538] text-white p-3 text-center"
                        >
                          {ga.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((college) => (
                      <tr key={college.collegeId}>
                        <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                          {college.collegeCode}
                        </td>
                        {college.gaScores.map((gaScore) => {
                          const score = gaScore.score;
                          let bgColor = "bg-gray-100";
                          if (score >= 75) bgColor = "bg-green-200";
                          else if (score >= 50) bgColor = "bg-yellow-200";
                          else if (score >= 25) bgColor = "bg-orange-200";
                          else if (score > 0) bgColor = "bg-red-200";

                          return (
                            <td
                              key={gaScore.gaCode}
                              className={`border border-gray-300 p-3 text-center ${bgColor}`}
                            >
                              {score.toFixed(1)}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="font-semibold">Legend:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 border border-gray-300"></div>
                  <span>75-100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-200 border border-gray-300"></div>
                  <span>50-74%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-200 border border-gray-300"></div>
                  <span>25-49%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-200 border border-gray-300"></div>
                  <span>1-24%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 border border-gray-300"></div>
                  <span>0%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Statistics Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Graduate Attribute Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#8B1538] text-white">
                    <th className="border border-gray-300 p-3 text-left">GA Code</th>
                    <th className="border border-gray-300 p-3 text-left">GA Name</th>
                    <th className="border border-gray-300 p-3 text-center">Programs</th>
                    <th className="border border-gray-300 p-3 text-center">Coverage Rate</th>
                    <th className="border border-gray-300 p-3 text-center">Avg Alignment</th>
                    <th className="border border-gray-300 p-3 text-center">Competencies</th>
                  </tr>
                </thead>
                <tbody>
                  {gaStats.map((ga, index) => (
                    <tr key={ga.gaId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 p-3 font-semibold">{ga.gaCode}</td>
                      <td className="border border-gray-300 p-3">{ga.gaNameEn}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        {ga.programCount}/{ga.totalPrograms}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {ga.coverageRate.toFixed(1)}%
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {ga.avgAlignmentScore.toFixed(1)}%
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {ga.competencyCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Export Graduate Attribute Analytics</CardTitle>
            <p className="text-sm text-gray-600">
              Download this analytics report in your preferred format
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "pdf" | "excel" | "word")}
                className="border border-gray-300 rounded px-4 py-2"
              >
                <option value="pdf">PDF Report</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="word">Word Document</option>
              </select>
              <Button className="bg-[#8B1538] hover:bg-[#A91D3A] text-white">
                <Download className="mr-2 h-4 w-4" />
                Export as {exportFormat.toUpperCase()}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
