import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft, GraduationCap, Target, TrendingUp, AlertCircle } from "lucide-react";
import AnalyticsExport from "@/components/AnalyticsExport";
import { useRef } from "react";

export default function DepartmentAnalytics() {
  const [, params] = useRoute("/analytics/department/:id");
  const [, setLocation] = useLocation();
  const departmentId = params?.id ? parseInt(params.id) : 0;

  const { data: analytics, isLoading } = trpc.analytics.departmentAnalytics.useQuery({ departmentId });
  const chartRef = useRef<HTMLDivElement>(null);

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
        <button
          onClick={() => setLocation("/programs")}
          className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
        >
          View Programs
        </button>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="bg-[#8B1538] rounded-lg shadow-md p-6 mt-8">
      <div className="flex items-center justify-center">
        <img src="/qu-logo.png" alt="QU Logo" className="h-14 opacity-50" />
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="container mx-auto py-8">
          <Header />
        <p className="text-muted-foreground">No analytics data available for this department.</p>
          <Footer />
        </div>
      </div>
    );
  }

  // Prepare data for program comparison chart
  const programChartData = analytics.programs.map((prog) => ({
    name: prog.programCode,
    fullName: prog.programName,
    alignment: prog.alignmentScore,
    plos: prog.totalPLOs,
  }));

  // Color coding
  const getColor = (score: number) => {
    if (score >= 70) return "#10B981";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  // Sort programs by alignment score
  const sortedPrograms = [...analytics.programs].sort((a, b) => b.alignmentScore - a.alignmentScore);

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
            <h1 className="text-4xl font-bold text-[#8B1538] mb-2">Department Analytics</h1>
            <p className="text-lg text-muted-foreground">
              Department-Level PLO-GA Alignment Analysis
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
          {analytics && (
            <AnalyticsExport 
              title="Department Analytics"
              chartRef={chartRef}
              data={analytics}
              type="department"
            />
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Total PLOs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPLOs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dept Alignment Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getColor(analytics.averageAlignment) }}>
              {analytics.averageAlignment.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Comparison Chart */}
      <Card className="mb-8" ref={chartRef}>
        <CardHeader>
          <CardTitle>Program Alignment Comparison</CardTitle>
          <CardDescription>Alignment scores across all programs in this department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(300, programChartData.length * 50)}>
            <BarChart data={programChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border p-3 rounded shadow-lg">
                        <p className="font-semibold">{data.fullName}</p>
                        <p className="text-sm">Alignment: {data.alignment.toFixed(1)}%</p>
                        <p className="text-sm">PLOs: {data.plos}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="alignment" 
                radius={[0, 8, 8, 0]}
                onClick={(data) => {
                  const prog = analytics.programs.find(p => p.programCode === data.name);
                  if (prog) setLocation(`/programs/${prog.programId}`);
                }}
              >
                {programChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.alignment)} className="cursor-pointer hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Programs Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Programs Overview</CardTitle>
          <CardDescription>Detailed breakdown of all programs in this department</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Program Name</TableHead>
                <TableHead className="text-center">Code</TableHead>
                <TableHead className="text-center">PLOs</TableHead>
                <TableHead className="text-center">Alignment Score</TableHead>
                <TableHead className="text-center">Coverage Rate</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPrograms.map((prog, index) => (
                <TableRow 
                  key={prog.programId}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setLocation(`/programs/${prog.programId}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{prog.programName}</TableCell>
                  <TableCell className="text-center font-mono text-sm">{prog.programCode}</TableCell>
                  <TableCell className="text-center">{prog.totalPLOs}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-lg" style={{ color: getColor(prog.alignmentScore) }}>
                      {prog.alignmentScore.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{prog.coverageRate.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {prog.alignmentScore >= 70 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        Excellent
                      </span>
                    ) : prog.alignmentScore >= 40 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                        <Target className="h-3 w-3" />
                        Good
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                        <AlertCircle className="h-3 w-3" />
                        Needs Attention
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        <Footer />
      </div>
    </div>
  );
}
