import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Building2, GraduationCap, Target, Award } from "lucide-react";
import AnalyticsExport from "@/components/AnalyticsExport";
import { useRef } from "react";

export default function Analytics() {
  const [, setLocation] = useLocation();
  const { data: analytics, isLoading } = trpc.analytics.universityOverview.useQuery();
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
    <div className="container mx-auto px-4 pb-6 mt-8 max-w-7xl">
      <footer className="bg-[#821F45] rounded-lg shadow-lg">
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
      </footer>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
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
        <p className="text-muted-foreground">No analytics data available.</p>
      </div>
    );
  }

  // Prepare data for college alignment chart
  const collegeChartData = analytics.colleges.map((college) => ({
    name: college.collegeCode,
    fullName: college.collegeName,
    alignment: college.averageAlignment,
    programs: college.totalPrograms,
  }));

  // Color coding based on performance (consistent with GA Analytics thresholds)
  const getColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Green for high coverage (≥80%)
    if (score >= 50) return "#eab308"; // Yellow for medium coverage (50-79%)
    return "#ef4444"; // Red for low coverage (<50%)
  };

  // Sort colleges by alignment score
  const sortedColleges = [...analytics.colleges].sort((a, b) => b.averageAlignment - a.averageAlignment);
  const topPerformers = sortedColleges.slice(0, 5);
  const bottomPerformers = sortedColleges.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8">
        <Header />
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            University-wide PLO-GA Alignment Overview
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
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLocation("/analytics/guide")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1538] text-white rounded hover:bg-[#6B1028] transition-colors"
          >
            📖 Analytics Guide
          </button>
          <button
            onClick={() => setLocation("/analytics/ga")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A91D3A] text-white rounded hover:bg-[#8B1538] transition-colors"
          >
            📊 Graduate Attributes
          </button>
          <button
            onClick={() => setLocation("/analytics/competencies")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C73E1D] text-white rounded hover:bg-[#A91D3A] transition-colors"
          >
            🎯 Competencies
          </button>
          {analytics && (
            <>
              <AnalyticsExport 
                title="University Analytics"
                chartRef={chartRef}
                data={analytics}
                type="university"
                entityCode="University"
              />
            </>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalColleges}</div>
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
            <CardTitle className="text-sm font-medium">Total PLOs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPLOs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Alignment Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getColor(analytics.averageAlignment) }}>
              {analytics.averageAlignment.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* College Alignment Chart */}
      <Card className="mb-8" ref={chartRef}>
        <CardHeader>
          <CardTitle>College Alignment Scores</CardTitle>
          <CardDescription>PLO-GA alignment scores across all colleges</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={collegeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} label={{ value: 'Alignment Score (%)', angle: -90, position: 'insideLeft' }} />
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
              <Bar dataKey="alignment" radius={[8, 8, 0, 0]} onClick={(data) => setLocation(`/analytics/college/${analytics.colleges.find(c => c.collegeCode === data.name)?.collegeId}`)}>
                {collegeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.alignment)} className="cursor-pointer hover:opacity-80" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top and Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>Colleges with highest alignment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((college, index) => (
                <div
                  key={college.collegeId}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  onClick={() => setLocation(`/analytics/college/${college.collegeId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8B1538] text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{college.collegeName}</p>
                      <p className="text-sm text-muted-foreground">{college.totalPrograms} programs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: getColor(college.averageAlignment) }}>
                      {college.averageAlignment.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Needs Attention
            </CardTitle>
            <CardDescription>Colleges with lowest alignment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottomPerformers.map((college, index) => (
                <div
                  key={college.collegeId}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  onClick={() => setLocation(`/analytics/college/${college.collegeId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                      {sortedColleges.length - index}
                    </div>
                    <div>
                      <p className="font-medium">{college.collegeName}</p>
                      <p className="text-sm text-muted-foreground">{college.totalPrograms} programs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: getColor(college.averageAlignment) }}>
                      {college.averageAlignment.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      <Footer />
    </div>
  );
}
