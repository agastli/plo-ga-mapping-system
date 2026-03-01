import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, AlertTriangle, AlertCircle, Info, CheckCircle, Download, Wrench, RefreshCw, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

export default function DataValidationTool() {
  const { data: validation, isLoading, refetch } = trpc.analytics.validateData.useQuery();
  const { data: currentUser } = trpc.auth.me.useQuery();
  const isAdmin = currentUser?.role === 'admin';

  // Threshold
  const { data: thresholdData, refetch: refetchThreshold } = trpc.analytics.getThreshold.useQuery();
  const [thresholdInput, setThresholdInput] = useState<string>('80');
  const setThresholdMutation = trpc.analytics.setThreshold.useMutation({
    onSuccess: () => {
      toast.success(`Coverage threshold updated to ${thresholdInput}%`);
      refetchThreshold();
      refetch();
    },
    onError: (err) => toast.error(err.message || 'Failed to update threshold.'),
  });
  useEffect(() => {
    if (thresholdData !== undefined) setThresholdInput(String(thresholdData));
  }, [thresholdData]);

  const normalizeMutation = trpc.analytics.normalizeOverLimitWeights.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.affectedPrograms > 0
          ? `Fixed ${result.fixedCount} weight(s) across ${result.affectedPrograms} program(s). All competency totals are now ≤ 100%.`
          : 'No over-limit weights found. Everything is already within limits.'
      );
      refetch();
    },
    onError: (err) => toast.error(err.message || 'Failed to normalize weights.'),
  });
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCollege, setFilterCollege] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [lastValidated] = useState<Date>(() => new Date());

  const colleges = useMemo(() => {
    if (!validation?.issues) return [];
    return Array.from(new Set(validation.issues.map(i => i.collegeName))).sort();
  }, [validation]);

  const departments = useMemo(() => {
    if (!validation?.issues) return [];
    return Array.from(new Set(
      validation.issues
        .filter(i => filterCollege === 'all' || i.collegeName === filterCollege)
        .map(i => i.departmentName)
    )).sort();
  }, [validation, filterCollege]);

  const filteredIssues = validation?.issues.filter(issue => {
    if (filterSeverity !== "all" && issue.severity !== filterSeverity) return false;
    if (filterCategory !== "all" && issue.category !== filterCategory) return false;
    if (filterCollege !== "all" && issue.collegeName !== filterCollege) return false;
    if (filterDepartment !== "all" && issue.departmentName !== filterDepartment) return false;
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
                  variant="outline"
                  onClick={() => refetch()}
                  className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    if (confirm('This will proportionally scale down all over-100% competency weights across all programs. Continue?')) {
                      normalizeMutation.mutate();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={normalizeMutation.isPending || (validation?.summary.totalErrors === 0)}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  {normalizeMutation.isPending ? 'Fixing...' : 'Fix All Over-Limit Weights'}
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
        <Breadcrumb
          className="mb-4"
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Data Validation" },
          ]}
        />
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8B1538]">Data Validation Tool</h1>
            <p className="text-gray-700">
              Comprehensive data quality check across all programs
            </p>
          </div>
          <p className="text-xs text-slate-500 whitespace-nowrap">
            Last validated: {lastValidated.toLocaleString()}
          </p>
        </div>

        {/* Explanatory Text */}
        <Card className="mb-8 border-l-4 border-l-[#8B1538] bg-white">
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none text-slate-700 space-y-3">
              <p>
                This tool performs an automated quality check across all academic programs in the system.
                It identifies three categories of issues that may affect the integrity of the PLO-GA mapping data:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-red-600">Errors</strong> — critical problems that must be resolved before the mapping data can be considered valid.
                  These include programs with no PLOs defined, or competency weights that exceed 100% of the allowed total.
                </li>
                <li>
                  <strong className="text-yellow-600">Warnings</strong> — non-critical issues that indicate potentially incomplete or inconsistent data.
                  The primary warning is <em>Low Mapping Coverage</em>: a program is flagged when the percentage of Graduate Attribute competencies
                  that have been assigned a non-zero total PLO weight falls below the configurable coverage threshold (default: 80%).
                  This means that at least 80% of all competencies must be mapped to at least one PLO with a positive weight.
                </li>
                <li>
                  <strong className="text-blue-600">Info</strong> — informational notices that highlight areas for review but do not necessarily indicate a problem.
                </li>
              </ul>
              <p>
                Use the <strong>Coverage Threshold</strong> setting below to adjust the minimum acceptable mapping coverage percentage.
                Administrators can change this value; the new threshold takes effect immediately when validation is re-run.
                Use the <strong>Refresh</strong> button to re-run the validation at any time, and the <strong>Export CSV</strong> button
                to download a full report of all issues for offline review.
              </p>
            </div>
          </CardContent>
        </Card>

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

        {/* Threshold Settings */}
        <Card className="mb-8 border-2 border-[#8B1538]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#8B1538] flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Mapping Coverage Threshold
            </CardTitle>
            <CardDescription>
              Programs are flagged with a warning when the percentage of competencies with a non-zero total PLO weight falls below this threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="w-24 border-[#8B1538]/30 focus:ring-[#8B1538]"
                  disabled={!isAdmin}
                />
                <span className="text-slate-600 font-medium">%</span>
              </div>
              {isAdmin && (
                <Button
                  variant="default"
                  className="bg-[#8B1538] hover:bg-[#6B1028]"
                  disabled={setThresholdMutation.isPending}
                  onClick={() => {
                    const val = parseFloat(thresholdInput);
                    if (isNaN(val) || val < 0 || val > 100) {
                      toast.error('Threshold must be a number between 0 and 100.');
                      return;
                    }
                    setThresholdMutation.mutate({ value: val });
                  }}
                >
                  {setThresholdMutation.isPending ? 'Saving...' : 'Save Threshold'}
                </Button>
              )}
              <p className="text-sm text-slate-500">
                Current threshold: <strong>{thresholdData ?? '80'}%</strong>
                {!isAdmin && <span className="ml-2 text-xs text-slate-400">(Admin only)</span>}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 border-2 border-[#8B1538]/20">
          <CardHeader>
            <CardTitle className="text-xl text-[#8B1538]">Filter Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">College</label>
                <select
                  value={filterCollege}
                  onChange={(e) => { setFilterCollege(e.target.value); setFilterDepartment('all'); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="all">All Colleges</option>
                  {colleges.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
              <div>
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

              <div>
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

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-bold text-[#8B1538]">{filteredIssues?.length || 0}</span> of <span className="font-bold">{validation?.issues.length || 0}</span> issues
              </p>
              {(filterCollege !== 'all' || filterDepartment !== 'all' || filterSeverity !== 'all' || filterCategory !== 'all') && (
                <button
                  onClick={() => { setFilterCollege('all'); setFilterDepartment('all'); setFilterSeverity('all'); setFilterCategory('all'); }}
                  className="text-xs text-[#8B1538] underline hover:no-underline"
                >
                  Clear all filters
                </button>
              )}
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
