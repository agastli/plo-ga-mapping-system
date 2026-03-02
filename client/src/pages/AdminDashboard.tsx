import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import MappingCompletenessWidget from "@/components/MappingCompletenessWidget";
import { 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Upload, 
  Settings,
  Database,
  Shield,
  ShieldAlert,
  LogOut,
  Home,
  User,
  Activity,
  Award,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Download
} from "lucide-react";
import { Link, useLocation } from "wouter";

function exportBelowThresholdCSV(programs: { programName: string; collegeName: string; totalPLOs: number; mappedPLOs: number; completenessRate: number }[], threshold: number) {
  const header = ['#', 'Program', 'College', 'Total PLOs', 'Mapped PLOs', 'Completeness (%)'];
  const rows = programs.map((p, i) => [
    i + 1,
    `"${p.programName.replace(/"/g, '""')}"`,
    `"${p.collegeName.replace(/"/g, '""')}"`,
    p.totalPLOs,
    p.mappedPLOs,
    p.completenessRate,
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `programs_below_${threshold}pct_threshold.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();
  const { data: users } = trpc.users.list.useQuery();
  const { data: graduateAttributes } = trpc.graduateAttributes.list.useQuery();
  const { data: competencies } = trpc.competencies.list.useQuery();
  
  // Threshold alert data
  const { data: completenessData } = trpc.analytics.programCompleteness.useQuery();
  const { data: thresholdStr } = trpc.analytics.getThreshold.useQuery();
  const threshold = thresholdStr ? parseFloat(thresholdStr) : 80;

  const completenessAlert = useMemo(() => {
    if (!completenessData || completenessData.length === 0) return null;
    const programsWithPLOs = completenessData.filter(p => !p.hasNoPLOs);
    if (programsWithPLOs.length === 0) return null;
    const avg = programsWithPLOs.reduce((sum, p) => sum + p.completenessRate, 0) / programsWithPLOs.length;
    const belowThreshold = [...programsWithPLOs]
      .filter(p => p.completenessRate < threshold)
      .sort((a, b) => a.completenessRate - b.completenessRate);
    return { avg: Math.round(avg), belowCount: belowThreshold.length, total: programsWithPLOs.length, threshold, belowPrograms: belowThreshold };
  }, [completenessData, threshold]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const stats = [
    {
      title: "Total Programs",
      value: programs?.length || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/programs",
    },
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/admin/users",
    },
    {
      title: "Total Mappings",
      value: programs?.reduce((sum, p) => sum + (p.mappingCount || 0), 0) || 0,
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/analytics",
    },
    {
      title: "Total PLOs",
      value: programs?.reduce((sum, p) => sum + (p.ploCount || 0), 0) || 0,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/programs",
    },
    {
      title: "Graduate Attributes",
      value: graduateAttributes?.length || 0,
      icon: Award,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      href: "/analytics",
    },
    {
      title: "Competencies",
      value: competencies?.length || 0,
      icon: Target,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      href: "/analytics",
    },
  ];

  const quickLinks = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
    },
    {
      title: "Program Management",
      description: "Add, edit, and delete programs",
      href: "/programs",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Upload Documents",
      description: "Upload and parse PLO documents",
      href: "/upload",
      icon: Upload,
      color: "text-purple-600",
    },
    {
      title: "View Analytics",
      description: "Comprehensive system analytics",
      href: "/analytics",
      icon: BarChart3,
      color: "text-orange-600",
    },
    {
      title: "Organizational Structure",
      description: "Manage colleges, departments, and clusters",
      href: "/admin/structure",
      icon: Building2,
      color: "text-indigo-600",
    },
    {
      title: "System Settings",
      description: "Configure system settings and templates",
      href: "/templates",
      icon: Settings,
      color: "text-gray-600",
    },
    {
      title: "Login Tracking",
      description: "Monitor user login activity and security",
      href: "/login-tracking",
      icon: Activity,
      color: "text-red-600",
    },
    {
      title: "Data Quality",
      description: "Validate data and fix over-limit weights",
      href: "/admin/data-validation",
      icon: ShieldAlert,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/qu-logo.png" alt="QU Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-[#8B1538]">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name || user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
              <Link href="/admin-dashboard">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Administrator</span>
            </div>
            <Button onClick={() => setLocation('/profile')} className="flex items-center gap-2 bg-[#8B1538] text-white hover:bg-[#6B1028]">
              <User className="h-4 w-4" />
              Profile
            </Button>
            <Button onClick={handleLogout} className="flex items-center gap-2 bg-[#8B1538] text-white hover:bg-[#6B1028]">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          </div>
        </header>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Intro Panel */}
        <div className="bg-white border-l-4 border-[#8B1538] rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#8B1538] mb-2">Welcome to the Admin Dashboard</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            As an <strong>Administrator</strong>, you have full control over the PLO-GA Mapping System. From this dashboard you can:
          </p>
          <ul className="mt-2 text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>Manage Programs</strong> — add, edit, or delete academic programs and their PLOs.</li>
            <li><strong>Map PLOs to GAs</strong> — assign weighting factors for each PLO-to-Graduate-Attribute and competency mapping.</li>
            <li><strong>Edit Justifications</strong> — write and update the justification text for each PLO-to-GA mapping across all programs.</li>
            <li><strong>Manage Users</strong> — create accounts, assign roles (Admin / Editor / Viewer), and control program-level access scopes.</li>
            <li><strong>View Analytics</strong> — explore university-wide, college-level, cluster-level, and program-level GA alignment reports and charts.</li>
            <li><strong>Export Reports</strong> — download mapping documents as Word, PDF, Excel, or PNG from the Analytics and Program pages.</li>
            <li><strong>Configure Structure</strong> — manage colleges, departments, clusters, and the organisational hierarchy.</li>
            <li><strong>Upload Documents</strong> — import PLOs and mappings from Word documents to populate programs in bulk.</li>
            <li><strong>Data Quality</strong> — review mapping completeness, identify programs with missing PLOs or incomplete mappings, and validate data integrity.</li>
            <li><strong>Login Tracking</strong> — monitor user login activity, view login history, and manage or delete old records.</li>
            <li><strong>System Settings</strong> — configure system-wide parameters such as mapping thresholds and report templates.</li>
          </ul>
        </div>
        {/* Completeness Threshold Alert Banner */}
        {completenessAlert && (
          completenessAlert.belowCount > 0 ? (
            <div className="flex items-start gap-4 rounded-lg border border-amber-300 bg-amber-50 px-5 py-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-800">
                  Mapping completeness below threshold ({completenessAlert.threshold}%)
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  University-wide average is <strong>{completenessAlert.avg}%</strong>.
                  {' '}<strong>{completenessAlert.belowCount}</strong> of{' '}
                  <strong>{completenessAlert.total}</strong> programs are below the {completenessAlert.threshold}% threshold.
                  {' '}Review the <Link href="/admin/data-validation"><span className="underline cursor-pointer hover:text-amber-900">Data Quality</span></Link> page or the Mapping Completeness tracker below for details.
                </p>
              </div>
              <Link href="/admin/data-validation">
                <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100 shrink-0">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-3 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm font-medium text-green-800">
                All {completenessAlert.total} programs meet the {completenessAlert.threshold}% completeness threshold.
                University-wide average: <strong>{completenessAlert.avg}%</strong>.
              </p>
            </div>
          )
        )}

        {/* Programs Below Threshold Summary Table */}
        {completenessAlert && completenessAlert.belowCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-600" />
                Programs Below {completenessAlert.threshold}% Threshold
                <span className="ml-1 text-sm font-normal text-amber-700">({completenessAlert.belowCount} programs)</span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 gap-1.5"
                  onClick={() => exportBelowThresholdCSV(completenessAlert.belowPrograms, completenessAlert.threshold)}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Link href="/admin/data-validation">
                  <Button size="sm" variant="outline" className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                    View Full Report
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="shadow-sm border-amber-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-amber-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Program</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">College</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">PLOs</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Mapped</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Completeness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completenessAlert.belowPrograms.slice(0, 20).map((p, idx) => {
                        const barColor = p.completenessRate >= 50 ? 'bg-yellow-400' : p.completenessRate >= 25 ? 'bg-orange-400' : 'bg-red-400';
                        const textColor = p.completenessRate >= 50 ? 'text-yellow-700' : p.completenessRate >= 25 ? 'text-orange-700' : 'text-red-600';
                        return (
                          <tr key={p.programId} className="border-b hover:bg-amber-50/60 transition-colors">
                            <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-[#8B1538]">{p.programName}</td>
                            <td className="px-4 py-3 text-gray-600">{p.collegeName}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{p.totalPLOs}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{p.mappedPLOs}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${p.completenessRate}%` }} />
                                </div>
                                <span className={`text-xs font-semibold ${textColor}`}>{p.completenessRate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {completenessAlert.belowCount > 20 && (
                    <div className="px-4 py-3 text-center text-sm text-gray-500 border-t">
                      Showing 20 of {completenessAlert.belowCount} programs below threshold.{' '}
                      <Link href="/admin/data-validation"><span className="text-[#8B1538] hover:underline cursor-pointer">View all in Data Quality</span></Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="shadow-sm hover:shadow-md hover:border-[#8B1538]/30 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 truncate group-hover:text-[#8B1538] transition-colors">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${stat.bgColor} shrink-0 ml-2 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mapping Completeness Tracker */}
        <MappingCompletenessWidget />

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.title} href={link.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50`}>
                        <link.icon className={`h-6 w-6 ${link.color}`} />
                      </div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 pb-6 mt-20 max-w-7xl">
        <footer className="bg-[#821F45] rounded-lg shadow-lg">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/qu-logo.png" alt="Qatar University" className="h-10 w-auto brightness-0 invert" />
              <div className="text-sm">
                <p className="font-semibold text-white">© 2026 Qatar University. All rights reserved.</p>
              </div>
            </div>
            <div className="text-sm text-right">
              <p className="text-white">PLO-GA Mapping System v1.0</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
