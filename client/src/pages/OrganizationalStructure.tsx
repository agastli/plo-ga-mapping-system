import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Edit2, Save, X, Shield, LogOut, Filter, ChevronDown } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

export default function OrganizationalStructure() {
  const [, setLocation] = useLocation();
  const { data: colleges, refetch: refetchColleges } = trpc.colleges.list.useQuery();
  const { data: clusters, refetch: refetchClusters } = trpc.clusters.list.useQuery();
  const { data: departments, refetch: refetchDepartments } = trpc.departments.list.useQuery();
  const { data: programs, refetch: refetchPrograms } = trpc.programs.list.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => setLocation('/login'),
  });

  const updateCollege = trpc.colleges.update.useMutation();
  const updateCluster = trpc.clusters.update.useMutation();
  const updateDepartment = trpc.departments.update.useMutation();
  const updateProgram = trpc.programs.update.useMutation();

  // ── Filter state (URL-synced so Back navigation restores filters) ──────────
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const urlCollege = searchParams.get('college');
  const urlCluster = searchParams.get('cluster');
  const urlDept = searchParams.get('dept');

  const selectedCollegeId: number | "all" = urlCollege ? Number(urlCollege) : "all";
  const selectedClusterId: number | "all" = urlCluster ? Number(urlCluster) : "all";
  const selectedDepartmentId: number | "all" = urlDept ? Number(urlDept) : "all";

  const setSelectedCollegeId = (val: number | "all") => {
    const p = new URLSearchParams(searchString);
    if (val === "all") { p.delete('college'); p.delete('cluster'); p.delete('dept'); }
    else { p.set('college', String(val)); p.delete('cluster'); p.delete('dept'); }
    setLocation('/admin/structure?' + p.toString());
  };
  const setSelectedClusterId = (val: number | "all") => {
    const p = new URLSearchParams(searchString);
    if (val === "all") { p.delete('cluster'); p.delete('dept'); }
    else { p.set('cluster', String(val)); p.delete('dept'); }
    setLocation('/admin/structure?' + p.toString());
  };
  const setSelectedDepartmentId = (val: number | "all") => {
    const p = new URLSearchParams(searchString);
    if (val === "all") p.delete('dept');
    else p.set('dept', String(val));
    setLocation('/admin/structure?' + p.toString());
  };

  // ── Editing states ────────────────────────────────────────────────────────
  const [editingCollege, setEditingCollege] = useState<number | null>(null);
  const [editCollegeNameEn, setEditCollegeNameEn] = useState("");
  const [editCollegeNameAr, setEditCollegeNameAr] = useState("");
  const [editCollegeCode, setEditCollegeCode] = useState("");

  const [editingCluster, setEditingCluster] = useState<number | null>(null);
  const [editClusterNameEn, setEditClusterNameEn] = useState("");
  const [editClusterNameAr, setEditClusterNameAr] = useState("");
  const [editClusterCode, setEditClusterCode] = useState("");

  const [editingDepartment, setEditingDepartment] = useState<number | null>(null);
  const [editDepartmentNameEn, setEditDepartmentNameEn] = useState("");
  const [editDepartmentNameAr, setEditDepartmentNameAr] = useState("");
  const [editDepartmentCode, setEditDepartmentCode] = useState("");

  const [editingProgram, setEditingProgram] = useState<number | null>(null);
  const [editProgramNameEn, setEditProgramNameEn] = useState("");
  const [editProgramNameAr, setEditProgramNameAr] = useState("");
  const [editProgramCode, setEditProgramCode] = useState("");

  // ── Derived filtered lists ────────────────────────────────────────────────
  const filteredColleges = useMemo(() => {
    if (!colleges) return [];
    if (selectedCollegeId === "all") return colleges;
    return colleges.filter(c => c.id === selectedCollegeId);
  }, [colleges, selectedCollegeId]);

  // Clusters available for the selected college (used to populate dropdown)
  const availableClusters = useMemo(() => {
    if (!clusters) return [];
    if (selectedCollegeId === "all") return clusters;
    return clusters.filter(cl => cl.collegeId === selectedCollegeId);
  }, [clusters, selectedCollegeId]);

  // Clusters shown in the Clusters section (filtered by cluster selection)
  const filteredClusters = useMemo(() => {
    if (selectedClusterId === "all") return availableClusters;
    return availableClusters.filter(cl => cl.id === selectedClusterId);
  }, [availableClusters, selectedClusterId]);

  // Departments available for the selected college + cluster (used to populate dropdown)
  const availableDepartments = useMemo(() => {
    if (!departments) return [];
    let result = departments;
    if (selectedCollegeId !== "all") result = result.filter(d => d.collegeId === selectedCollegeId);
    if (selectedClusterId !== "all") result = result.filter(d => d.clusterId === selectedClusterId);
    return result;
  }, [departments, selectedCollegeId, selectedClusterId]);

  // Departments shown in the Departments section (filtered by department selection)
  const filteredDepartments = useMemo(() => {
    if (selectedDepartmentId === "all") return availableDepartments;
    return availableDepartments.filter(d => d.id === selectedDepartmentId);
  }, [availableDepartments, selectedDepartmentId]);

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    const isFiltered = selectedCollegeId !== "all" || selectedClusterId !== "all" || selectedDepartmentId !== "all";
    if (!isFiltered) return programs;
    const deptIds = new Set(filteredDepartments.map(d => d.id));
    return programs.filter(p => deptIds.has(p.department.id));
  }, [programs, filteredDepartments, selectedCollegeId, selectedClusterId, selectedDepartmentId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditCollege = (college: any) => {
    setEditingCollege(college.id);
    setEditCollegeNameEn(college.nameEn || "");
    setEditCollegeNameAr(college.nameAr || "");
    setEditCollegeCode(college.code || "");
  };
  const handleSaveCollege = async (id: number) => {
    try {
      await updateCollege.mutateAsync({ id, nameEn: editCollegeNameEn, nameAr: editCollegeNameAr, code: editCollegeCode });
      await refetchColleges();
      setEditingCollege(null);
      toast.success("College updated successfully");
    } catch { toast.error("Failed to update college"); }
  };

  const handleEditCluster = (cluster: any) => {
    setEditingCluster(cluster.id);
    setEditClusterNameEn(cluster.nameEn || "");
    setEditClusterNameAr(cluster.nameAr || "");
    setEditClusterCode(cluster.code || "");
  };
  const handleSaveCluster = async (id: number) => {
    try {
      await updateCluster.mutateAsync({ id, nameEn: editClusterNameEn, nameAr: editClusterNameAr, code: editClusterCode });
      await refetchClusters();
      setEditingCluster(null);
      toast.success("Cluster updated successfully");
    } catch { toast.error("Failed to update cluster"); }
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department.id);
    setEditDepartmentNameEn(department.nameEn || "");
    setEditDepartmentNameAr(department.nameAr || "");
    setEditDepartmentCode(department.code || "");
  };
  const handleSaveDepartment = async (id: number) => {
    try {
      await updateDepartment.mutateAsync({ id, nameEn: editDepartmentNameEn, nameAr: editDepartmentNameAr, code: editDepartmentCode });
      await refetchDepartments();
      setEditingDepartment(null);
      toast.success("Department updated successfully");
    } catch { toast.error("Failed to update department"); }
  };

  const handleEditProgram = (program: any) => {
    setEditingProgram(program.program.id);
    setEditProgramNameEn(program.program.nameEn || "");
    setEditProgramNameAr(program.program.nameAr || "");
    setEditProgramCode(program.program.code || "");
  };
  const handleSaveProgram = async (id: number) => {
    try {
      await updateProgram.mutateAsync({ id, nameEn: editProgramNameEn, nameAr: editProgramNameAr, code: editProgramCode });
      await refetchPrograms();
      setEditingProgram(null);
      toast.success("Program updated successfully");
    } catch { toast.error("Failed to update program"); }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/qu-logo.png" alt="QU Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-[#8B1538]">Organizational Structure Management</h1>
                <p className="text-sm text-gray-600">Academic Planning &amp; Quality Assurance Office</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-[#8B1538] text-white hover:bg-[#6D1028]">
                <Link href="/admin-dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">Administrator</span>
              </div>
              <Button onClick={() => logoutMutation.mutate()} className="flex items-center gap-2 bg-[#8B1538] text-white hover:bg-[#6D1028]">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>
      </div>

      {/* Main content — same container as header/footer */}
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin-dashboard" },
            { label: "Organizational Structure" },
          ]}
        />

        {/* ── Cascading Filter Bar ── */}
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#8B1538] font-semibold">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </div>
          <div className="flex flex-wrap items-end gap-3">

            {/* College dropdown */}
            <div className="flex flex-col gap-1 min-w-[200px] flex-1">
              <label className="text-xs font-medium text-gray-500">College</label>
              <div className="relative">
                <select
                  value={selectedCollegeId}
                  onChange={e => {
                    const val = e.target.value === "all" ? "all" : Number(e.target.value);
                    setSelectedCollegeId(val);
                    setSelectedClusterId("all");
                    setSelectedDepartmentId("all");
                  }}
                  className="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
                >
                  <option value="all">All Colleges ({colleges?.length ?? 0})</option>
                  {colleges?.map(c => (
                    <option key={c.id} value={c.id}>{c.nameEn} ({c.code})</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Cluster dropdown — only shown when the selected college has clusters */}
            {availableClusters.length > 0 && (
              <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                <label className="text-xs font-medium text-gray-500">Cluster</label>
                <div className="relative">
                  <select
                    value={selectedClusterId}
                    onChange={e => {
                      const val = e.target.value === "all" ? "all" : Number(e.target.value);
                      setSelectedClusterId(val);
                      setSelectedDepartmentId("all");
                    }}
                    className="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
                  >
                    <option value="all">All Clusters ({availableClusters.length})</option>
                    {availableClusters.map(cl => (
                      <option key={cl.id} value={cl.id}>{cl.nameEn} ({cl.code})</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Department dropdown — only shown when a college (or cluster) is selected */}
            {availableDepartments.length > 0 && (
              <div className="flex flex-col gap-1 min-w-[200px] flex-1">
                <label className="text-xs font-medium text-gray-500">Department</label>
                <div className="relative">
                  <select
                    value={selectedDepartmentId}
                    onChange={e => setSelectedDepartmentId(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
                  >
                    <option value="all">All Departments ({availableDepartments.length})</option>
                    {availableDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.nameEn} ({d.code})</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Clear all + summary */}
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              {(selectedCollegeId !== "all" || selectedClusterId !== "all" || selectedDepartmentId !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedCollegeId("all"); setSelectedClusterId("all"); setSelectedDepartmentId("all"); }}
                  className="text-[#8B1538] border-[#8B1538] hover:bg-[#8B1538]/10"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {filteredColleges.length} college{filteredColleges.length !== 1 ? "s" : ""} · {filteredClusters.length} cluster{filteredClusters.length !== 1 ? "s" : ""} · {filteredDepartments.length} dept{filteredDepartments.length !== 1 ? "s" : ""} · {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Colleges Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredColleges.map((college) => (
                <div key={college.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingCollege === college.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input value={editCollegeNameEn} onChange={e => setEditCollegeNameEn(e.target.value)} placeholder="Name (English)" />
                        <Input value={editCollegeNameAr} onChange={e => setEditCollegeNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                        <Input value={editCollegeCode} onChange={e => setEditCollegeCode(e.target.value)} placeholder="Code" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveCollege(college.id)} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
                        <Button onClick={() => setEditingCollege(null)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{college.nameEn}</p>
                        <p className="text-sm text-gray-600" dir="rtl">{college.nameAr}</p>
                        <p className="text-xs text-gray-500">Code: {college.code}</p>
                      </div>
                      <Button onClick={() => handleEditCollege(college)} variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {filteredColleges.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No colleges to display.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Clusters Section ── */}
        {filteredClusters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#8B1538]">Clusters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClusters.map((cluster) => (
                  <div key={cluster.id} className="border rounded-lg p-4 bg-gray-50">
                    {editingCluster === cluster.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <Input value={editClusterNameEn} onChange={e => setEditClusterNameEn(e.target.value)} placeholder="Name (English)" />
                          <Input value={editClusterNameAr} onChange={e => setEditClusterNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                          <Input value={editClusterCode} onChange={e => setEditClusterCode(e.target.value)} placeholder="Code" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleSaveCluster(cluster.id)} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
                          <Button onClick={() => setEditingCluster(null)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{cluster.nameEn}</p>
                          <p className="text-sm text-gray-600" dir="rtl">{cluster.nameAr}</p>
                          <p className="text-xs text-gray-500">Code: {cluster.code} | College: {colleges?.find(c => c.id === cluster.collegeId)?.nameEn}</p>
                        </div>
                        <Button onClick={() => handleEditCluster(cluster)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4 mr-2" />Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Departments Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDepartments.map((department) => (
                <div key={department.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingDepartment === department.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input value={editDepartmentNameEn} onChange={e => setEditDepartmentNameEn(e.target.value)} placeholder="Name (English)" />
                        <Input value={editDepartmentNameAr} onChange={e => setEditDepartmentNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                        <Input value={editDepartmentCode} onChange={e => setEditDepartmentCode(e.target.value)} placeholder="Code" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveDepartment(department.id)} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
                        <Button onClick={() => setEditingDepartment(null)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{department.nameEn}</p>
                        <p className="text-sm text-gray-600" dir="rtl">{department.nameAr}</p>
                        <p className="text-xs text-gray-500">
                          Code: {department.code} | College: {colleges?.find(c => c.id === department.collegeId)?.nameEn}
                          {department.clusterId && ` | Cluster: ${clusters?.find(cl => cl.id === department.clusterId)?.nameEn}`}
                        </p>
                      </div>
                      <Button onClick={() => handleEditDepartment(department)} variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {filteredDepartments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No departments for the selected college.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Programs Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">
              Programs
              <span className="ml-2 text-sm font-normal text-gray-500">({filteredPrograms.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPrograms.map((program) => (
                <div key={program.program.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingProgram === program.program.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input value={editProgramNameEn} onChange={e => setEditProgramNameEn(e.target.value)} placeholder="Name (English)" />
                        <Input value={editProgramNameAr} onChange={e => setEditProgramNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                        <Input value={editProgramCode} onChange={e => setEditProgramCode(e.target.value)} placeholder="Code" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveProgram(program.program.id)} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
                        <Button onClick={() => setEditingProgram(null)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{program.program.nameEn}</p>
                        <p className="text-sm text-gray-600" dir="rtl">{program.program.nameAr}</p>
                        <p className="text-xs text-gray-500">
                          Code: {program.program.code} | Department: {program.department.nameEn}
                        </p>
                      </div>
                      <Button onClick={() => handleEditProgram(program)} variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {filteredPrograms.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No programs for the selected college.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 pb-6 mt-20 max-w-7xl">
        <footer className="bg-[#821F45] rounded-lg shadow-lg">
          <div className="px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/qu-logo.png" alt="Qatar University" className="h-10 w-auto brightness-0 invert" />
                <p className="font-semibold text-white text-sm">© 2026 Qatar University. All rights reserved.</p>
              </div>
              <p className="text-white text-sm">PLO-GA Mapping System v1.0</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
