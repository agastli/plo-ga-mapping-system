import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import MappingCompletenessWidget from "@/components/MappingCompletenessWidget";
import { 
  FileText, 
  BarChart3, 
  Shield,
  LogOut,
  Edit,
  Search,
  User,
  Globe,
  Building2,
  Layers,
  BookOpen,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "wouter";
import Breadcrumb from "@/components/Breadcrumb";

export default function EditorDashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: accessiblePrograms } = trpc.users.getAccessiblePrograms.useQuery();
  const { data: accessScope } = trpc.users.getMyAccessScope.useQuery();
  const scopeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; title: string }> = {
    university: { icon: Globe, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-400', title: 'University-wide Access' },
    college:    { icon: Building2, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-400', title: 'College Access' },
    cluster:    { icon: Layers, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-400', title: 'Cluster Access' },
    department: { icon: BookOpen, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-400', title: 'Department Access' },
    program:    { icon: GraduationCap, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-400', title: 'Program Access' },
  };
  const scope = accessScope?.scope ?? 'program';
  const scopeInfo = scopeConfig[scope] ?? scopeConfig.program;
  const ScopeIcon = scopeInfo.icon;
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get only programs accessible to this editor
  const allMyPrograms = accessiblePrograms || [];

  // Quick Jump search state
  const [programSearch, setProgramSearch] = useState('');

  // Sort state — persisted in localStorage
  type SortKey = 'name' | 'college' | 'completeness' | 'updatedAt';
  const [sortKey, setSortKey] = useState<SortKey>(() => {
    try { return (localStorage.getItem('editor_programs_sortKey') as SortKey) || 'name'; } catch { return 'name'; }
  });
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(() => {
    try { return (localStorage.getItem('editor_programs_sortDir') as 'asc' | 'desc') || 'asc'; } catch { return 'asc'; }
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      const next = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(next);
      try { localStorage.setItem('editor_programs_sortDir', next); } catch {}
    } else {
      setSortKey(key);
      setSortDir('asc');
      try { localStorage.setItem('editor_programs_sortKey', key); localStorage.setItem('editor_programs_sortDir', 'asc'); } catch {}
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="inline h-3 w-3 ml-1 text-gray-400" />;
    return sortDir === 'asc'
      ? <ChevronUp className="inline h-3 w-3 ml-1 text-[#8B1538]" />
      : <ChevronDown className="inline h-3 w-3 ml-1 text-[#8B1538]" />;
  };

  const filteredPrograms = useMemo(() => {
    let list = allMyPrograms;
    if (programSearch.trim()) {
      const q = programSearch.toLowerCase();
      list = list.filter(p =>
        p.program.nameEn.toLowerCase().includes(q) ||
        (p.program.code || '').toLowerCase().includes(q) ||
        p.college.nameEn.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      if (sortKey === 'name')        { av = a.program.nameEn; bv = b.program.nameEn; }
      else if (sortKey === 'college') { av = a.college.nameEn; bv = b.college.nameEn; }
      else if (sortKey === 'completeness') {
        const ac = (a.ploCount || 0) > 0 ? Math.min(Math.round(((a.mappingCount || 0) / ((a.ploCount || 0) * 21)) * 100), 100) : 0;
        const bc = (b.ploCount || 0) > 0 ? Math.min(Math.round(((b.mappingCount || 0) / ((b.ploCount || 0) * 21)) * 100), 100) : 0;
        av = ac; bv = bc;
      } else if (sortKey === 'updatedAt') {
        av = a.program.updatedAt ? new Date(a.program.updatedAt).getTime() : 0;
        bv = b.program.updatedAt ? new Date(b.program.updatedAt).getTime() : 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allMyPrograms, programSearch, sortKey, sortDir]);

  const stats = [
    {
      title: "My Programs",
      value: allMyPrograms.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Mappings",
      value: allMyPrograms.reduce((sum, p) => sum + (p.mappingCount || 0), 0),
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total PLOs",
      value: allMyPrograms.reduce((sum, p) => sum + (p.ploCount || 0), 0),
      icon: Edit,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with QU Logo */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl w-full">
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
              <div className="flex gap-3 items-center">
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <Shield className="w-4 h-4 mr-1" />
                  Editor
                </Badge>
                <button
                  onClick={() => setLocation('/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B1538] text-white hover:bg-[#6B1028] rounded-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B1538] text-white hover:bg-[#6B1028] rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-1">
        <Breadcrumb items={[{ label: "Editor Dashboard" }]} />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Title and Welcome */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Editor Dashboard</h2>
          <p className="text-lg text-gray-600">Welcome, {user?.name || 'Editor'}</p>
        </div>

        {/* Access Scope Badge */}
        {accessScope && (
          <div className={`p-4 rounded-lg border-l-4 ${scopeInfo.bg} ${scopeInfo.border} shadow-sm`}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-white shadow-sm flex-shrink-0">
                <ScopeIcon className={`h-6 w-6 ${scopeInfo.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide ${scopeInfo.color} opacity-70 mb-1.5`}>{scopeInfo.title}</p>
                {(accessScope as any).allLabels && (accessScope as any).allLabels.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {((accessScope as any).allLabels as { scope: string; label: string; entityId: number | null }[]).map((item, i) => (
                      <span key={i} className={`inline-block text-sm font-semibold ${scopeInfo.color} bg-white rounded-full px-3 py-0.5 shadow-sm border border-opacity-30`} style={{ borderColor: 'currentColor' }}>
                        {item.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-base font-bold ${scopeInfo.color}`}>{accessScope.label}</p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">You can edit mappings and analytics within these scopes.</p>
              </div>
            </div>
          </div>
        )}
        {/* Intro Panel */}
        <div className="bg-white border-l-4 border-green-600 rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-bold text-green-700 mb-2">What can you do here?</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            As an <strong>Editor</strong>, you can create and manage PLO-GA mappings for the programs assigned to you. Here is what you can do:
          </p>
          <ul className="mt-2 text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>View Your Programs</strong> — see all academic programs assigned to you, with PLO counts, mapping counts, completeness, and last-modified date.</li>
            <li><strong>Edit PLOs</strong> — add, update, or remove Program Learning Outcomes for your assigned programs.</li>
            <li><strong>Map PLOs to GAs</strong> — assign and adjust weighting factors for each PLO-to-Graduate-Attribute and competency mapping.</li>
            <li><strong>Edit Justifications</strong> — write and update the justification text for each PLO-to-GA mapping in your assigned programs.</li>
            <li><strong>View Analytics</strong> — review GA alignment charts, radar profiles, and coverage reports scoped to your assigned programs.</li>
            <li><strong>Export Reports</strong> — download mapping documents and analytics as Word, PDF, or Excel files for your assigned programs.</li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">You can only view and edit programs explicitly assigned to you. Contact an administrator to request access to additional programs.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mapping Completeness Tracker */}
        <MappingCompletenessWidget />

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link href="/program-browser">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#8B1538]/30 h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-6 rounded-full bg-green-50">
                    <Search className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Browse & Edit Programs</h3>
                    <p className="text-gray-600">
                      View and edit your assigned programs, manage PLOs and mappings
                    </p>
                  </div>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                    <Edit className="h-5 w-5 mr-2" />
                    Manage Programs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#8B1538]/30 h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-6 rounded-full bg-purple-50">
                    <BarChart3 className="h-12 w-12 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">View Analytics</h3>
                    <p className="text-gray-600">
                      Access comprehensive analytics and statistics for your assigned programs
                    </p>
                  </div>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Open Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
           </Link>
        </div>

        {/* Assigned Programs Quick-List */}
        {allMyPrograms.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Your Assigned Programs</h3>
              <Link href="/program-browser">
                <span className="text-sm text-[#8B1538] hover:underline font-medium cursor-pointer">View all &rarr;</span>
              </Link>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Quick jump — search by program name, code, or college…"
                value={programSearch}
                onChange={e => setProgramSearch(e.target.value)}
                className="pl-9 pr-9 bg-white border-gray-200 focus:border-[#8B1538] focus:ring-[#8B1538]/20"
              />
              {programSearch && (
                <button
                  onClick={() => setProgramSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('name')}>
                          Program <SortIcon col="name" />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('college')}>
                          College <SortIcon col="college" />
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">PLOs</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Mappings</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('completeness')}>
                          Completeness <SortIcon col="completeness" />
                        </th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('updatedAt')}>
                          Last Modified <SortIcon col="updatedAt" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrograms.slice(0, 15).map((p, idx) => {
                        const ploCount = p.ploCount || 0;
                        const mappingCount = p.mappingCount || 0;
                        const completeness = ploCount > 0 ? Math.min(Math.round((mappingCount / (ploCount * 21)) * 100), 100) : 0;
                        const barColor = completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-400' : 'bg-red-400';
                        const textColor = completeness >= 80 ? 'text-green-700' : completeness >= 50 ? 'text-yellow-700' : 'text-red-600';
                        return (
                          <tr
                            key={p.program.id}
                            className="border-b hover:bg-[#8B1538]/5 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/programs/${p.program.id}`)}
                          >
                            <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-[#8B1538] hover:underline">{p.program.nameEn}</td>
                            <td className="px-4 py-3 text-gray-600">{p.college.nameEn}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{ploCount}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{mappingCount}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${completeness}%` }} />
                                </div>
                                <span className={`text-xs font-semibold ${textColor}`}>{completeness}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-500 text-xs">
                              {p.program.updatedAt ? new Date(p.program.updatedAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredPrograms.length === 0 && programSearch && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No programs match &ldquo;{programSearch}&rdquo;.
                    </div>
                  )}
                  {filteredPrograms.length > 15 && (
                    <div className="px-4 py-3 text-center text-sm text-gray-500 border-t">
                      Showing 15 of {filteredPrograms.length} matching programs.{' '}
                      <Link href="/program-browser"><span className="text-[#8B1538] hover:underline cursor-pointer">View all</span></Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="container mx-auto px-4 pb-6 mt-20 max-w-7xl">
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
    </div>
  );
}
