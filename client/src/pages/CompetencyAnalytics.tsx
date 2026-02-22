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
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  Treemap,
} from "recharts";
import { Home, BookOpen, Download, FileText, AlertTriangle } from "lucide-react";

export default function CompetencyAnalytics() {
  const { data: competencyData, isLoading } = trpc.analytics.competencyAnalytics.useQuery();
  const { data: competencyByDeptData } = trpc.analytics.competencyByDepartmentAnalytics.useQuery();
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "word">("pdf");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Competency Analytics...</p>
        </div>
      </div>
    );
  }

  if (!competencyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const { competencyStats, totalCompetencies, totalPrograms } = competencyData;

  // Prepare data for charts
  const coverageChartData = competencyStats
    .sort((a, b) => b.coverageRate - a.coverageRate)
    .map((comp) => ({
      name: comp.competencyCode,
      coverage: comp.coverageRate,
      programs: comp.programCount,
    }));

  const avgWeightChartData = competencyStats
    .sort((a, b) => b.avgWeight - a.avgWeight)
    .map((comp) => ({
      name: comp.competencyCode,
      weight: comp.avgWeight,
    }));

  // Identify underutilized competencies (gaps)
  const gapCompetencies = competencyStats
    .filter((comp) => comp.coverageRate < 50)
    .sort((a, b) => a.coverageRate - b.coverageRate);

  // Prepare scatter plot data (coverage vs avg weight)
  const scatterData = competencyStats.map((comp) => ({
      code: comp.competencyCode,
      coverage: comp.coverageRate,
      weight: comp.avgWeight,
      programs: comp.programCount,
    }));

  // Prepare treemap data (grouped by GA)
  const gaGroups = competencyStats.reduce((acc, comp) => {
    const gaId = comp.gaId;
    if (!acc[gaId]) {
      acc[gaId] = [];
    }
    acc[gaId].push(comp);
    return acc;
  }, {} as Record<number, typeof competencyStats>);

  const treemapData = Object.entries(gaGroups).map(([gaId, comps]) => {
    const totalMappings = comps.reduce((sum, c) => sum + c.mappingCount, 0);
    return {
      name: `GA${gaId}`,
      children: comps.map((c) => ({
        name: c.competencyCode,
        size: c.mappingCount,
        coverage: c.coverageRate,
      })),
    };
  });

  // Prepare heatmap data
  const heatmapData = competencyByDeptData?.heatmapData || [];

  // Colors for charts
  const COLORS = ["#8B1538", "#A91D3A", "#C73E1D", "#E67E22", "#F39C12"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B1538] to-[#A91D3A] text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎯 Competency Analytics</h1>
              <p className="text-white/90 text-lg">
                Comprehensive analysis of competency usage and distribution across programs
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#8B1538]">
            <CardHeader>
              <CardTitle className="text-lg">Total Competencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#8B1538]">{totalCompetencies}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#A91D3A]">
            <CardHeader>
              <CardTitle className="text-lg">Programs Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#A91D3A]">{totalPrograms}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#C73E1D]">
            <CardHeader>
              <CardTitle className="text-lg">Avg Coverage Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#C73E1D]">
                {(competencyStats.reduce((sum, c) => sum + c.coverageRate, 0) / competencyStats.length).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#E67E22]">
            <CardHeader>
              <CardTitle className="text-lg">Underutilized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[#E67E22]">{gapCompetencies.length}</p>
              <p className="text-sm text-gray-600 mt-1">&lt;50% coverage</p>
            </CardContent>
          </Card>
        </div>

        {/* All Competencies by Coverage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All Competencies by Coverage Rate</CardTitle>
            <p className="text-sm text-gray-600">
              All competencies sorted by coverage across programs (highest to lowest)
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

        {/* All Competencies by Average Weight */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All Competencies by Average Weight</CardTitle>
            <p className="text-sm text-gray-600">
              All competencies sorted by average mapping weights (highest to lowest)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={avgWeightChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Average Weight", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="weight" fill="#A91D3A" name="Average Weight" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competency Gaps Analysis */}
        {gapCompetencies.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Underutilized Competencies (Gaps)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Competencies with less than 50% coverage - potential areas for improvement
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="border border-gray-300 p-3 text-left">Competency Code</th>
                      <th className="border border-gray-300 p-3 text-left">Competency Name</th>
                      <th className="border border-gray-300 p-3 text-center">Coverage Rate</th>
                      <th className="border border-gray-300 p-3 text-center">Programs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapCompetencies.map((comp, index) => (
                      <tr key={comp.competencyId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-300 p-3 font-semibold">{comp.competencyCode}</td>
                        <td className="border border-gray-300 p-3">{comp.competencyNameEn}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          <span className="text-orange-600 font-semibold">{comp.coverageRate.toFixed(1)}%</span>
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {comp.programCount}/{comp.totalPrograms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coverage vs Weight Scatter Plot */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Competency Coverage vs Average Weight</CardTitle>
            <p className="text-sm text-gray-600">
              Relationship between how widely a competency is used and how strongly it's weighted
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="coverage"
                  name="Coverage Rate"
                  unit="%"
                  label={{ value: "Coverage Rate (%)", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  type="number"
                  dataKey="weight"
                  name="Avg Weight"
                  label={{ value: "Average Weight", angle: -90, position: "insideLeft" }}
                />
                <ZAxis type="number" dataKey="programs" range={[50, 400]} name="Programs" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold">{data.code}</p>
                          <p className="text-sm text-gray-600">Coverage: {data.coverage.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">Avg Weight: {data.weight.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Programs: {data.programs}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="#8B1538" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competency by Department Heatmap */}
        {heatmapData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Competency Usage by Department</CardTitle>
              <p className="text-sm text-gray-600">
                Average weights showing which departments emphasize which competencies
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-[#8B1538] text-white p-2 text-left sticky left-0">
                        Department
                      </th>
                      {competencyByDeptData?.competencyList.map((comp) => (
                        <th
                          key={comp.code}
                          className="border border-gray-300 bg-[#8B1538] text-white p-2 text-center"
                          style={{ minWidth: "60px" }}
                        >
                          {comp.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((dept) => (
                      <tr key={dept.departmentId}>
                        <td className="border border-gray-300 p-2 font-semibold bg-gray-50 sticky left-0">
                          {dept.departmentCode}
                        </td>
                        {dept.competencyScores.map((compScore) => {
                          const weight = compScore.avgWeight;
                          let bgColor = "bg-gray-100";
                          if (weight >= 0.75) bgColor = "bg-green-200";
                          else if (weight >= 0.5) bgColor = "bg-yellow-200";
                          else if (weight >= 0.25) bgColor = "bg-orange-200";
                          else if (weight > 0) bgColor = "bg-red-200";

                          return (
                            <td
                              key={compScore.competencyCode}
                              className={`border border-gray-300 p-2 text-center ${bgColor}`}
                            >
                              {weight.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="font-semibold">Legend (Avg Weight):</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 border border-gray-300"></div>
                  <span>≥0.75</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-200 border border-gray-300"></div>
                  <span>0.50-0.74</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-200 border border-gray-300"></div>
                  <span>0.25-0.49</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-200 border border-gray-300"></div>
                  <span>0.01-0.24</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 border border-gray-300"></div>
                  <span>0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Statistics Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Competency Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#8B1538] text-white">
                    <th className="border border-gray-300 p-2 text-left">Code</th>
                    <th className="border border-gray-300 p-2 text-left">Competency Name</th>
                    <th className="border border-gray-300 p-2 text-center">Programs</th>
                    <th className="border border-gray-300 p-2 text-center">Coverage</th>
                    <th className="border border-gray-300 p-2 text-center">Avg Weight</th>
                    <th className="border border-gray-300 p-2 text-center">Mappings</th>
                    <th className="border border-gray-300 p-2 text-center">Justifications</th>
                  </tr>
                </thead>
                <tbody>
                  {competencyStats.map((comp, index) => (
                    <tr key={comp.competencyId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 p-2 font-semibold">{comp.competencyCode}</td>
                      <td className="border border-gray-300 p-2">{comp.competencyNameEn}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {comp.programCount}/{comp.totalPrograms}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {comp.coverageRate.toFixed(1)}%
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {comp.avgWeight.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {comp.mappingCount}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {comp.justificationCount} ({comp.justificationRate.toFixed(0)}%)
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
            <CardTitle>Export Competency Analytics</CardTitle>
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
