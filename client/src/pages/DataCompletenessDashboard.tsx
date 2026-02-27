import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function DataCompletenessDashboard() {
  const { data: stats, isLoading } = trpc.analytics.completenessStats.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mb-4"></div>
          <p className="text-slate-600">Loading completeness statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with QU Logo */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src="/qu-logo.png" alt="Qatar University" className="h-16 w-auto" />
                <div className="border-l-2 border-[#8B1538] pl-4">
                  <h1 className="text-2xl font-bold text-[#8B1538]">PLO-GA Mapping System</h1>
                  <p className="text-sm text-slate-600">Academic Planning & Quality Assurance Office</p>
                </div>
              </div>
              <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumb
          className="mb-4"
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Data Completeness" },
          ]}
        />
        <h1 className="text-3xl font-bold mb-2 text-[#8B1538]">Data Completeness Dashboard</h1>
        <p className="text-gray-700 mb-8">
          Monitor data entry progress across all programs
        </p>

        {/* Overall Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-[#8B1538]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B1538]">{stats?.overall.totalPrograms || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Complete Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.overall.completePrograms || 0}</div>
              <p className="text-sm text-slate-500 mt-1">
                {stats?.overall.overallCompletionRate || 0}% completion
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">With PLOs Only</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {(stats?.overall.programsWithPLOs || 0) - (stats?.overall.programsWithMappings || 0)}
              </div>
              <p className="text-sm text-slate-500 mt-1">Missing mappings</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">No PLOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {(stats?.overall.totalPrograms || 0) - (stats?.overall.programsWithPLOs || 0)}
              </div>
              <p className="text-sm text-slate-500 mt-1">Need data entry</p>
            </CardContent>
          </Card>
        </div>

        {/* Completion Progress Bars */}
        <Card className="mb-8 border-2 border-[#8B1538]/20">
          <CardHeader>
            <CardTitle className="text-xl text-[#8B1538]">Overall Completion Progress</CardTitle>
            <CardDescription>Percentage of programs with complete data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Programs with PLOs</span>
                <span className="text-sm font-bold text-[#8B1538]">{stats?.overall.ploCompletionRate || 0}%</span>
              </div>
              <Progress value={stats?.overall.ploCompletionRate || 0} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Programs with Mappings</span>
                <span className="text-sm font-bold text-[#8B1538]">{stats?.overall.mappingCompletionRate || 0}%</span>
              </div>
              <Progress value={stats?.overall.mappingCompletionRate || 0} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Programs with Justifications</span>
                <span className="text-sm font-bold text-[#8B1538]">{stats?.overall.justificationCompletionRate || 0}%</span>
              </div>
              <Progress value={stats?.overall.justificationCompletionRate || 0} className="h-3" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-base font-bold text-slate-900">Overall Completion</span>
                <span className="text-base font-bold text-green-600">{stats?.overall.overallCompletionRate || 0}%</span>
              </div>
              <Progress value={stats?.overall.overallCompletionRate || 0} className="h-4 bg-slate-200" />
            </div>
          </CardContent>
        </Card>

        {/* College Breakdown */}
        <Card className="border-2 border-[#8B1538]/20">
          <CardHeader>
            <CardTitle className="text-xl text-[#8B1538]">Completion by College</CardTitle>
            <CardDescription>Data entry progress for each college</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.byCollege.map((college: any) => (
                <div key={college.collegeId} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{college.collegeName}</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{college.completePrograms}/{college.totalPrograms}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{college.programsWithPLOs - college.programsWithMappings}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{college.totalPrograms - college.programsWithPLOs}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-600">PLOs</span>
                        <span className="text-xs font-bold text-[#8B1538]">{college.ploCompletionRate}%</span>
                      </div>
                      <Progress value={college.ploCompletionRate} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-600">Mappings</span>
                        <span className="text-xs font-bold text-[#8B1538]">{college.mappingCompletionRate}%</span>
                      </div>
                      <Progress value={college.mappingCompletionRate} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-600">Justifications</span>
                        <span className="text-xs font-bold text-[#8B1538]">{college.justificationCompletionRate}%</span>
                      </div>
                      <Progress value={college.justificationCompletionRate} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-700">Overall</span>
                      <span className="text-sm font-bold text-green-600">{college.overallCompletionRate}%</span>
                    </div>
                    <Progress value={college.overallCompletionRate} className="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      {/* Footer */}
      <footer className="mt-8">
        <div className="bg-[#821F45] rounded-lg shadow-lg px-6 py-6">
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
}
