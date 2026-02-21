import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { ArrowLeft, Building2, GraduationCap, Target, TrendingUp } from "lucide-react";
import AnalyticsExport from "@/components/AnalyticsExport";
import { useRef } from "react";

export default function CollegeAnalytics() {
  const [, params] = useRoute("/analytics/college/:id");
  const [, setLocation] = useLocation();
  const collegeId = params?.id ? parseInt(params.id) : 0;

  const { data: analytics, isLoading } = trpc.analytics.collegeAnalytics.useQuery({ collegeId });
  const { data: colleges } = trpc.colleges.list.useQuery();
  const chartRef = useRef<HTMLDivElement>(null);
  
  const college = colleges?.find(c => c.id === collegeId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">No analytics data available for this college.</p>
      </div>
    );
  }

  // Prepare data for department comparison chart
  const departmentChartData = analytics.departments.map((dept) => ({
    name: dept.departmentCode,
    fullName: dept.departmentName,
    alignment: dept.averageAlignment,
    programs: dept.totalPrograms,
  }));

  // Prepare data for GA coverage radar chart
  const radarData = analytics.gaBreakdown.map((ga) => ({
    ga: ga.gaCode,
    fullName: ga.gaName,
    coverage: ga.averageScore,
  }));

  // Color coding
  const getColor = (score: number) => {
    if (score >= 70) return "#10B981";
    if (score >= 40) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="container mx-auto py-8">
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
          </div>
          {analytics && college && (
            <AnalyticsExport 
              title={`${college.nameEn} Analytics`}
              chartRef={chartRef}
              data={analytics}
              type="college"
            />
          )}
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
            <CardTitle className="text-sm font-medium">College Alignment Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getColor(analytics.averageAlignment) }}>
              {analytics.averageAlignment.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison and GA Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" ref={chartRef}>
        {/* Department Alignment Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department Alignment Scores</CardTitle>
            <CardDescription>Comparison across all departments in this college</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={departmentChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
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
                <Bar 
                  dataKey="alignment" 
                  radius={[0, 8, 8, 0]}
                  onClick={(data) => {
                    const dept = analytics.departments.find(d => d.departmentCode === data.name);
                    if (dept) setLocation(`/analytics/department/${dept.departmentId}`);
                  }}
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.alignment)} className="cursor-pointer hover:opacity-80" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GA Coverage Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Graduate Attributes Coverage</CardTitle>
            <CardDescription>Alignment strength across all 5 Graduate Attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="ga" 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar 
                  name="Coverage %" 
                  dataKey="coverage" 
                  stroke="#8B1538" 
                  fill="#8B1538" 
                  fillOpacity={0.6} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-border p-3 rounded shadow-lg">
                          <p className="font-semibold">{data.fullName}</p>
                          <p className="text-sm">Coverage: {data.coverage.toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments Overview</CardTitle>
          <CardDescription>Click on a department to view detailed program analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.departments
              .sort((a, b) => b.averageAlignment - a.averageAlignment)
              .map((dept) => (
                <div
                  key={dept.departmentId}
                  className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setLocation(`/analytics/department/${dept.departmentId}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{dept.departmentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.departmentCode} • {dept.totalPrograms} program{dept.totalPrograms !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl" style={{ color: getColor(dept.averageAlignment) }}>
                      {dept.averageAlignment.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Alignment Score</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
