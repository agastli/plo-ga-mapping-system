import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { ArrowLeft, Building2, GraduationCap, Target } from "lucide-react";
import AnalyticsExport from "@/components/AnalyticsExport";
import { useRef } from "react";

export default function CollegeAnalytics() {
  const [, params] = useRoute("/analytics/college/:id");
  const [, setLocation] = useLocation();
  const collegeId = params?.id ? parseInt(params.id) : 0;
  
  const { data: analytics, isLoading } = trpc.analytics.collegeAnalytics.useQuery({ collegeId });
  const { data: programs } = trpc.programs.list.useQuery();
  const chartRef = useRef<HTMLDivElement>(null);

  const college = programs?.find(p => p.college.id === collegeId)?.college;

  // Header and Footer components
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
          <button
            onClick={() => setLocation("/")}
            className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => setLocation("/programs")}
            className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
          >
            View Programs
          </button>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="bg-[#821F45] rounded-lg shadow-lg mt-8">
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/qu-log-white-transparent.png" alt="Qatar University" className="h-14 w-auto" />
          </div>
          <div className="text-center md:text-right">
            <p className="text-white font-medium">PLO-GA Mapping Management System</p>
            <p className="text-white/80 text-sm">© {new Date().getFullYear()} Qatar University. All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="container mx-auto py-8">
          <Header />
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
          <Footer />
        </div>
      </div>
    );
  }

  if (!analytics || !college) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="container mx-auto py-8">
          <Header />
          <p className="text-muted-foreground">No analytics data available for this college.</p>
          <Footer />
        </div>
      </div>
    );
  }

  // Color coding (consistent with GA Analytics thresholds)
  const getColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Green for high coverage (≥80%)
    if (score >= 50) return "#eab308"; // Yellow for medium coverage (50-79%)
    return "#EF4444";
  };

  // Prepare department chart data
  const departmentChartData = analytics.departments.map((dept) => ({
    name: dept.departmentCode,
    fullName: dept.departmentName,
    alignment: dept.averageAlignment,
    programs: dept.totalPrograms,
  }));

  // Prepare GA coverage radar chart data
  const radarData = analytics.gaBreakdown.map((ga) => ({
    ga: ga.gaCode,
    coverage: ga.averageScore,
  }));

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8">
        <Header />

        {/* Header with Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/analytics")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to University Overview
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-[#8B1538] mb-2">{college?.nameEn || 'College Analytics'}</h1>
              <p className="text-lg text-muted-foreground">
                College-Level PLO-GA Alignment Analysis
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Generated on: {new Date().toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLocation("/analytics/guide")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1538] text-white rounded hover:bg-[#6B1028] transition-colors"
              >
                📖 Analytics Guide
              </button>
              <AnalyticsExport 
                title={`${college?.nameEn || 'College'} Analytics`}
                chartRef={chartRef}
                data={analytics}
                type="college"
                entityCode={college?.code}
              />
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalDepartments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPrograms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Alignment Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: getColor(analytics.averageAlignment) }}>
                {analytics.averageAlignment.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" ref={chartRef}>
          {/* Department Alignment Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Department Alignment Scores</CardTitle>
              <CardDescription>PLO-GA alignment by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border p-3 rounded shadow-lg">
                            <p className="font-semibold">{data.fullName}</p>
                            <p className="text-sm">Alignment: {data.alignment.toFixed(1)}%</p>
                            <p className="text-sm">Programs: {data.programs}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="alignment" radius={[8, 8, 0, 0]}>
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.alignment)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GA Coverage Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Graduate Attribute Coverage</CardTitle>
              <CardDescription>Coverage rate across all GAs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="ga" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Coverage %" dataKey="coverage" stroke="#8B1538" fill="#8B1538" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>Detailed breakdown by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Department</th>
                    <th className="text-center p-3">Programs</th>
                    <th className="text-center p-3">PLOs</th>
                    <th className="text-center p-3">Alignment Score</th>
                    <th className="text-center p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.departments.map((dept) => (
                    <tr key={dept.departmentId} className="border-b hover:bg-accent">
                      <td className="p-3 font-medium">{dept.departmentName}</td>
                      <td className="text-center p-3">{dept.totalPrograms}</td>
                      <td className="text-center p-3">{dept.totalPLOs}</td>
                      <td className="text-center p-3">
                        <span className="font-bold" style={{ color: getColor(dept.averageAlignment) }}>
                          {dept.averageAlignment.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/analytics/department/${dept.departmentId}`)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Footer />
      </div>

    </div>
  );
}
