import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, AlertTriangle, AlertCircle, Info, CheckCircle, Download } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function DataValidationTool() {
  const { data: validation, isLoading, refetch } = trpc.analytics.validateData.useQuery();
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredIssues = validation?.issues.filter(issue => {
    if (filterSeverity !== "all" && issue.severity !== filterSeverity) return false;
    if (filterCategory !== "all" && issue.category !== filterCategory) return false;
    return true;
  });

  const categories = validation?.issues 
    ? Array.from(new Set(validation.issues.map(i => i.category)))
    : [];

  const exportToCSV = () => {
    if (!validation?.issues) return;
    
    const headers = ["Severity", "Category", "College", "Department", "Program", "Issue", "Details"];
    const rows = validation.issues.map(issue => [
      issue.severity,
      issue.category,
      issue.collegeName,
      issue.departmentName,
      issue.programName,
      issue.issue,
      issue.details,
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-validation-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mb-4"></div>
          <p className="text-slate-600">Validating program data...</p>
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
              <div className="flex gap-3">
                <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button 
                  variant="default" 
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!validation?.issues || validation.issues.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-[#8B1538]">Data Validation Tool</h1>
        <p className="text-gray-700 mb-8">
          Comprehensive data quality check across all programs
        </p>

        {/* Summary Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-[#8B1538]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8B1538]">{validation?.summary.totalPrograms || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{validation?.summary.totalErrors || 0}</div>
              <p className="text-sm text-slate-500 mt-1">
                {validation?.summary.programsWithErrors || 0} programs affected
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{validation?.summary.totalWarnings || 0}</div>
              <p className="text-sm text-slate-500 mt-1">
                {validation?.summary.programsWithWarnings || 0} programs affected
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{validation?.summary.totalInfo || 0}</div>
              <p className="text-sm text-slate-500 mt-1">
                {validation?.summary.programsWithInfo || 0} programs affected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-2 border-[#8B1538]/20">
          <CardHeader>
            <CardTitle className="text-xl text-[#8B1538]">Filter Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Severity</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="all">All Severities</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings Only</option>
                  <option value="info">Info Only</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-slate-600">
                Showing <span className="font-bold text-[#8B1538]">{filteredIssues?.length || 0}</span> of <span className="font-bold">{validation?.issues.length || 0}</span> issues
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        {filteredIssues && filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map((issue, index) => (
              <Card 
                key={index} 
                className={`border-l-4 ${
                  issue.severity === 'error' ? 'border-l-red-500 bg-red-50/30' :
                  issue.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50/30' :
                  'border-l-blue-500 bg-blue-50/30'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {issue.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {issue.severity === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                        {issue.severity === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                        <Badge 
                          variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
                          className={
                            issue.severity === 'error' ? 'bg-red-600' :
                            issue.severity === 'warning' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{issue.category}</Badge>
                      </div>
                      <CardTitle className="text-lg text-slate-900">{issue.programName}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="text-slate-600">{issue.collegeName}</span>
                        <span className="mx-2">•</span>
                        <span className="text-slate-600">{issue.departmentName}</span>
                      </CardDescription>
                    </div>
                    <Link href={`/programs/${issue.programId}`}>
                      <Button variant="outline" size="sm">View Program</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-slate-900">Issue: </span>
                      <span className="text-slate-700">{issue.issue}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Details: </span>
                      <span className="text-slate-600">{issue.details}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-green-500/30 bg-gradient-to-br from-white to-green-50/30">
            <CardContent className="py-20 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-600 mb-2">All Clear!</h3>
              <p className="text-lg text-slate-600">
                No data quality issues found. All programs have complete data.
              </p>
            </CardContent>
          </Card>
        )}
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
