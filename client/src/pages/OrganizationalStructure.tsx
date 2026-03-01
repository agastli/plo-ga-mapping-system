import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Edit2, Save, X, Shield, LogOut, Filter, ChevronDown, Search, Plus, Trash2, ArrowRightLeft } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
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

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateCollege = trpc.colleges.update.useMutation();
  const createCollege = trpc.colleges.create.useMutation();
  const deleteCollege = trpc.colleges.delete.useMutation();

  const updateCluster = trpc.clusters.update.useMutation();
  const createCluster = trpc.clusters.create.useMutation();
  const deleteCluster = trpc.clusters.delete.useMutation();

  const updateDepartment = trpc.departments.update.useMutation();
  const createDepartment = trpc.departments.create.useMutation();
  const deleteDepartment = trpc.departments.delete.useMutation();

  const updateProgram = trpc.programs.update.useMutation();
  const deleteProgram = trpc.programs.delete.useMutation();
  const moveDepartmentMutation = trpc.departments.move.useMutation();
  const moveProgramMutation = trpc.programs.move.useMutation();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | "all">("all");
  const [selectedClusterId, setSelectedClusterId] = useState<number | "all">("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "all">("all");

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
  const [programSearch, setProgramSearch] = useState("");

  // ── Add form states ───────────────────────────────────────────────────────
  const [addingCollege, setAddingCollege] = useState(false);
  const [newCollegeNameEn, setNewCollegeNameEn] = useState("");
  const [newCollegeNameAr, setNewCollegeNameAr] = useState("");
  const [newCollegeCode, setNewCollegeCode] = useState("");

  const [addingCluster, setAddingCluster] = useState(false);
  const [newClusterNameEn, setNewClusterNameEn] = useState("");
  const [newClusterNameAr, setNewClusterNameAr] = useState("");
  const [newClusterCode, setNewClusterCode] = useState("");
  const [newClusterCollegeId, setNewClusterCollegeId] = useState<number | "">("");

  const [addingDepartment, setAddingDepartment] = useState(false);
  const [newDeptNameEn, setNewDeptNameEn] = useState("");
  const [newDeptNameAr, setNewDeptNameAr] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptCollegeId, setNewDeptCollegeId] = useState<number | "">("");

  const [addingProgram, setAddingProgram] = useState(false);
  const [newProgNameEn, setNewProgNameEn] = useState("");
  const [newProgNameAr, setNewProgNameAr] = useState("");
  const [newProgCode, setNewProgCode] = useState("");
  const [newProgDeptId, setNewProgDeptId] = useState<number | "">("");

  // ── Move dialog states ────────────────────────────────────────────────────
  const [movingDepartment, setMovingDepartment] = useState<any | null>(null);
  const [moveDeptTargetCollegeId, setMoveDeptTargetCollegeId] = useState<number | "">("");
  const [movingProgram, setMovingProgram] = useState<any | null>(null);
  const [moveProgTargetDeptId, setMoveProgTargetDeptId] = useState<number | "">("");

  // ── Derived filtered lists ────────────────────────────────────────────────
  const filteredColleges = useMemo(() => {
    if (!colleges) return [];
    if (selectedCollegeId === "all") return colleges;
    return colleges.filter(c => c.id === selectedCollegeId);
  }, [colleges, selectedCollegeId]);

  const availableClusters = useMemo(() => {
    if (!clusters) return [];
    if (selectedCollegeId === "all") return clusters;
    return clusters.filter(cl => cl.collegeId === selectedCollegeId);
  }, [clusters, selectedCollegeId]);

  const filteredClusters = useMemo(() => {
    if (selectedClusterId === "all") return availableClusters;
    return availableClusters.filter(cl => cl.id === selectedClusterId);
  }, [availableClusters, selectedClusterId]);

  const availableDepartments = useMemo(() => {
    if (!departments) return [];
    let result = departments;
    if (selectedCollegeId !== "all") result = result.filter(d => d.collegeId === selectedCollegeId);
    if (selectedClusterId !== "all") result = result.filter(d => d.clusterId === selectedClusterId);
    return result;
  }, [departments, selectedCollegeId, selectedClusterId]);

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

  // ── Edit handlers ─────────────────────────────────────────────────────────
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

  // ── Add handlers ──────────────────────────────────────────────────────────
  const handleAddCollege = async () => {
    if (!newCollegeNameEn.trim() || !newCollegeCode.trim()) { toast.error("English name and code are required"); return; }
    try {
      await createCollege.mutateAsync({ nameEn: newCollegeNameEn.trim(), nameAr: newCollegeNameAr.trim() || undefined, code: newCollegeCode.trim() });
      await refetchColleges();
      setAddingCollege(false);
      setNewCollegeNameEn(""); setNewCollegeNameAr(""); setNewCollegeCode("");
      toast.success("College added successfully");
    } catch { toast.error("Failed to add college"); }
  };

  const handleAddCluster = async () => {
    if (!newClusterNameEn.trim() || !newClusterCode.trim() || !newClusterCollegeId) { toast.error("English name, code, and college are required"); return; }
    try {
      await createCluster.mutateAsync({ nameEn: newClusterNameEn.trim(), nameAr: newClusterNameAr.trim() || undefined, code: newClusterCode.trim(), collegeId: Number(newClusterCollegeId) });
      await refetchClusters();
      setAddingCluster(false);
      setNewClusterNameEn(""); setNewClusterNameAr(""); setNewClusterCode(""); setNewClusterCollegeId("");
      toast.success("Cluster added successfully");
    } catch { toast.error("Failed to add cluster"); }
  };

  const handleAddDepartment = async () => {
    if (!newDeptNameEn.trim() || !newDeptCode.trim() || !newDeptCollegeId) { toast.error("English name, code, and college are required"); return; }
    try {
      await createDepartment.mutateAsync({ nameEn: newDeptNameEn.trim(), nameAr: newDeptNameAr.trim() || undefined, code: newDeptCode.trim(), collegeId: Number(newDeptCollegeId) });
      await refetchDepartments();
      setAddingDepartment(false);
      setNewDeptNameEn(""); setNewDeptNameAr(""); setNewDeptCode(""); setNewDeptCollegeId("");
      toast.success("Department added successfully");
    } catch { toast.error("Failed to add department"); }
  };



  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteCollege = async (college: any) => {
    const deptCount = departments?.filter(d => d.collegeId === college.id).length ?? 0;
    const progCount = programs?.filter(p => { const dept = departments?.find(d => d.id === p.program.departmentId); return dept?.collegeId === college.id; }).length ?? 0;
    const msg = deptCount > 0 || progCount > 0
      ? `Delete "${college.nameEn}"? This will also delete ${deptCount} department(s) and ${progCount} program(s) with all their PLOs and mappings. This cannot be undone.`
      : `Delete "${college.nameEn}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    try {
      await deleteCollege.mutateAsync({ id: college.id });
      await Promise.all([refetchColleges(), refetchDepartments(), refetchClusters(), refetchPrograms()]);
      toast.success(`College "${college.nameEn}" deleted`);
    } catch { toast.error("Failed to delete college"); }
  };

  const handleDeleteCluster = async (cluster: any) => {
    if (!confirm(`Delete cluster "${cluster.nameEn}"? Departments in this cluster will remain but will no longer be associated with a cluster. This cannot be undone.`)) return;
    try {
      await deleteCluster.mutateAsync({ id: cluster.id });
      await Promise.all([refetchClusters(), refetchDepartments()]);
      toast.success(`Cluster "${cluster.nameEn}" deleted`);
    } catch { toast.error("Failed to delete cluster"); }
  };

  const handleDeleteDepartment = async (department: any) => {
    const progCount = programs?.filter(p => p.program.departmentId === department.id).length ?? 0;
    const msg = progCount > 0
      ? `Delete "${department.nameEn}"? This will also delete ${progCount} program(s) with all their PLOs and mappings. This cannot be undone.`
      : `Delete "${department.nameEn}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    try {
      await deleteDepartment.mutateAsync({ id: department.id });
      await Promise.all([refetchDepartments(), refetchPrograms()]);
      toast.success(`Department "${department.nameEn}" deleted`);
    } catch { toast.error("Failed to delete department"); }
  };

  const handleDeleteProgram = async (program: any) => {
    if (!confirm(`Delete program "${program.program.nameEn}"? All PLOs and mappings will be permanently deleted. This cannot be undone.`)) return;
    try {
      await deleteProgram.mutateAsync({ id: program.program.id });
      await refetchPrograms();
      toast.success(`Program "${program.program.nameEn}" deleted`);
    } catch { toast.error("Failed to delete program"); }
  };

  // ── Move handlers ─────────────────────────────────────────────────────
  const handleMoveDepartment = async () => {
    if (!movingDepartment || !moveDeptTargetCollegeId) { toast.error("Please select a target college"); return; }
    if (moveDeptTargetCollegeId === movingDepartment.collegeId) { toast.error("Department is already in this college"); return; }
    try {
      await moveDepartmentMutation.mutateAsync({ id: movingDepartment.id, targetCollegeId: Number(moveDeptTargetCollegeId) });
      await Promise.all([refetchDepartments(), refetchPrograms()]);
      const targetCollege = colleges?.find(c => c.id === Number(moveDeptTargetCollegeId));
      toast.success(`Department "${movingDepartment.nameEn}" moved to ${targetCollege?.nameEn}`);
      setMovingDepartment(null);
      setMoveDeptTargetCollegeId("");
    } catch { toast.error("Failed to move department"); }
  };

  const handleMoveProgram = async () => {
    if (!movingProgram || !moveProgTargetDeptId) { toast.error("Please select a target department"); return; }
    if (Number(moveProgTargetDeptId) === movingProgram.program.departmentId) { toast.error("Program is already in this department"); return; }
    try {
      await moveProgramMutation.mutateAsync({ id: movingProgram.program.id, targetDepartmentId: Number(moveProgTargetDeptId) });
      await refetchPrograms();
      const targetDept = departments?.find(d => d.id === Number(moveProgTargetDeptId));
      toast.success(`Program "${movingProgram.program.nameEn}" moved to ${targetDept?.nameEn}`);
      setMovingProgram(null);
      setMoveProgTargetDeptId("");
    } catch { toast.error("Failed to move program"); }
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

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#8B1538]">Colleges</CardTitle>
              <Button
                size="sm"
                className="bg-[#8B1538] hover:bg-[#6D1028] text-white"
                onClick={() => { setAddingCollege(true); setNewCollegeNameEn(""); setNewCollegeNameAr(""); setNewCollegeCode(""); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add College
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add College Form */}
              {addingCollege && (
                <div className="border-2 border-[#8B1538]/30 rounded-lg p-4 bg-[#8B1538]/5 space-y-3">
                  <p className="text-sm font-semibold text-[#8B1538]">New College</p>
                  <div className="grid grid-cols-3 gap-4">
                    <Input value={newCollegeNameEn} onChange={e => setNewCollegeNameEn(e.target.value)} placeholder="Name (English) *" />
                    <Input value={newCollegeNameAr} onChange={e => setNewCollegeNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                    <Input value={newCollegeCode} onChange={e => setNewCollegeCode(e.target.value)} placeholder="Code (e.g. CAS) *" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCollege} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white" disabled={createCollege.isPending}>
                      <Save className="h-4 w-4 mr-2" />{createCollege.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setAddingCollege(false)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                  </div>
                </div>
              )}

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
                        <Button onClick={() => handleSaveCollege(college.id)} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white"><Save className="h-4 w-4 mr-2" />Save</Button>
                        <Button onClick={() => setEditingCollege(null)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{college.nameEn}</p>
                        <p className="text-sm text-gray-600" dir="rtl">{college.nameAr}</p>
                        <p className="text-xs text-gray-500">Code: {college.code}</p>
                        {(() => {
                          const deptCount = departments?.filter(d => d.collegeId === college.id).length ?? 0;
                          const progCount = programs?.filter(p => { const dept = departments?.find(d => d.id === p.program.departmentId); return dept?.collegeId === college.id; }).length ?? 0;
                          return (
                            <p className="text-xs text-[#8B1538]/70 mt-0.5 font-medium">
                              {deptCount} {deptCount === 1 ? 'department' : 'departments'} &middot; {progCount} {progCount === 1 ? 'program' : 'programs'}
                            </p>
                          );
                        })()}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditCollege(college)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4 mr-2" />Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCollege(college)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={deleteCollege.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredColleges.length === 0 && !addingCollege && (
                <p className="text-sm text-gray-400 text-center py-4">No colleges to display.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Clusters Section ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#8B1538]">Clusters</CardTitle>
              <Button
                size="sm"
                className="bg-[#8B1538] hover:bg-[#6D1028] text-white"
                onClick={() => { setAddingCluster(true); setNewClusterNameEn(""); setNewClusterNameAr(""); setNewClusterCode(""); setNewClusterCollegeId(""); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Cluster
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Cluster Form */}
              {addingCluster && (
                <div className="border-2 border-[#8B1538]/30 rounded-lg p-4 bg-[#8B1538]/5 space-y-3">
                  <p className="text-sm font-semibold text-[#8B1538]">New Cluster</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input value={newClusterNameEn} onChange={e => setNewClusterNameEn(e.target.value)} placeholder="Name (English) *" />
                    <Input value={newClusterNameAr} onChange={e => setNewClusterNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                    <Input value={newClusterCode} onChange={e => setNewClusterCode(e.target.value)} placeholder="Code *" />
                    <select
                      value={newClusterCollegeId}
                      onChange={e => setNewClusterCollegeId(e.target.value ? Number(e.target.value) : "")}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
                    >
                      <option value="">Select College *</option>
                      {colleges?.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCluster} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white" disabled={createCluster.isPending}>
                      <Save className="h-4 w-4 mr-2" />{createCluster.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setAddingCluster(false)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                  </div>
                </div>
              )}

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
                        <Button onClick={() => handleSaveCluster(cluster.id)} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white"><Save className="h-4 w-4 mr-2" />Save</Button>
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
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditCluster(cluster)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4 mr-2" />Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCluster(cluster)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={deleteCluster.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredClusters.length === 0 && !addingCluster && (
                <p className="text-sm text-gray-400 text-center py-4">No clusters to display. Clusters are optional sub-groupings within a college.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Departments Section ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#8B1538]">Departments</CardTitle>
              <Button
                size="sm"
                className="bg-[#8B1538] hover:bg-[#6D1028] text-white"
                onClick={() => { setAddingDepartment(true); setNewDeptNameEn(""); setNewDeptNameAr(""); setNewDeptCode(""); setNewDeptCollegeId(selectedCollegeId !== "all" ? selectedCollegeId : ""); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Department
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Department Form */}
              {addingDepartment && (
                <div className="border-2 border-[#8B1538]/30 rounded-lg p-4 bg-[#8B1538]/5 space-y-3">
                  <p className="text-sm font-semibold text-[#8B1538]">New Department</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input value={newDeptNameEn} onChange={e => setNewDeptNameEn(e.target.value)} placeholder="Name (English) *" />
                    <Input value={newDeptNameAr} onChange={e => setNewDeptNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                    <Input value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} placeholder="Code *" />
                    <select
                      value={newDeptCollegeId}
                      onChange={e => setNewDeptCollegeId(e.target.value ? Number(e.target.value) : "")}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
                    >
                      <option value="">Select College *</option>
                      {colleges?.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddDepartment} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white" disabled={createDepartment.isPending}>
                      <Save className="h-4 w-4 mr-2" />{createDepartment.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => setAddingDepartment(false)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                  </div>
                </div>
              )}

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
                        <Button onClick={() => handleSaveDepartment(department.id)} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white"><Save className="h-4 w-4 mr-2" />Save</Button>
                        <Button onClick={() => setEditingDepartment(null)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{department.nameEn}</p>
                          {(() => {
                            const count = programs?.filter(p => p.program.departmentId === department.id).length ?? 0;
                            return (
                              <Badge
                                variant="secondary"
                                className={count > 0 ? 'bg-[#8B1538]/10 text-[#8B1538] border border-[#8B1538]/20' : 'bg-gray-100 text-gray-400 border border-gray-200'}
                              >
                                {count} {count === 1 ? 'program' : 'programs'}
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-gray-600" dir="rtl">{department.nameAr}</p>
                        <p className="text-xs text-gray-500">
                          Code: {department.code} | College: {colleges?.find(c => c.id === department.collegeId)?.nameEn}
                          {department.clusterId && ` | Cluster: ${clusters?.find(cl => cl.id === department.clusterId)?.nameEn}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-[#8B1538]/40 text-[#8B1538] hover:bg-[#8B1538]/10 text-xs"
                        >
                          <Link href={`/programs?dept=${department.id}`}>
                            Programs
                          </Link>
                        </Button>
                        <Button
                          onClick={() => { setMovingDepartment(department); setMoveDeptTargetCollegeId(department.collegeId); }}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />Move
                        </Button>
                        <Button onClick={() => handleEditDepartment(department)} variant="outline" size="sm">
                          <Edit2 className="h-4 w-4 mr-2" />Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteDepartment(department)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={deleteDepartment.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredDepartments.length === 0 && !addingDepartment && (
                <p className="text-sm text-gray-400 text-center py-4">No departments for the selected college.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Programs Section ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-[#8B1538]">
                Programs
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredPrograms.filter(p => !programSearch || p.program.nameEn.toLowerCase().includes(programSearch.toLowerCase()) || p.program.nameAr?.toLowerCase().includes(programSearch.toLowerCase()) || p.department.nameEn.toLowerCase().includes(programSearch.toLowerCase())).length})
                </span>
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearch}
                    onChange={e => setProgramSearch(e.target.value)}
                    className="pl-9 h-8 text-sm border-[#8B1538]/20 focus:ring-[#8B1538]"
                  />
                </div>
                <Button
                  size="sm"
                  className="bg-[#8B1538] hover:bg-[#6D1028] text-white"
                  asChild
                >
                  <Link href="/programs/new">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Program
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPrograms
                .filter(p => !programSearch || p.program.nameEn.toLowerCase().includes(programSearch.toLowerCase()) || p.program.nameAr?.toLowerCase().includes(programSearch.toLowerCase()) || p.department.nameEn.toLowerCase().includes(programSearch.toLowerCase()))
                .map((program) => (
                  <div key={program.program.id} className="border rounded-lg p-4 bg-gray-50">
                    {editingProgram === program.program.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <Input value={editProgramNameEn} onChange={e => setEditProgramNameEn(e.target.value)} placeholder="Name (English)" />
                          <Input value={editProgramNameAr} onChange={e => setEditProgramNameAr(e.target.value)} placeholder="Name (Arabic)" dir="rtl" />
                          <Input value={editProgramCode} onChange={e => setEditProgramCode(e.target.value)} placeholder="Code" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleSaveProgram(program.program.id)} size="sm" className="bg-[#8B1538] hover:bg-[#6D1028] text-white"><Save className="h-4 w-4 mr-2" />Save</Button>
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => { setMovingProgram(program); setMoveProgTargetDeptId(program.program.departmentId); }}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />Move
                          </Button>
                          <Button onClick={() => handleEditProgram(program)} variant="outline" size="sm">
                            <Edit2 className="h-4 w-4 mr-2" />Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteProgram(program)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            disabled={deleteProgram.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </Button>
                        </div>
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

      {/* ── Move Department Modal ── */}
      {movingDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#8B1538]">Move Department</h2>
              <button onClick={() => { setMovingDepartment(null); setMoveDeptTargetCollegeId(""); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-600">Moving: <span className="font-semibold">{movingDepartment.nameEn}</span></p>
            <p className="text-xs text-gray-500">Current college: <span className="font-medium">{colleges?.find(c => c.id === movingDepartment.collegeId)?.nameEn}</span></p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Move to College</label>
              <select
                value={moveDeptTargetCollegeId}
                onChange={e => setMoveDeptTargetCollegeId(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
              >
                <option value="">Select target college...</option>
                {colleges?.map(c => (
                  <option key={c.id} value={c.id} disabled={c.id === movingDepartment.collegeId}>
                    {c.nameEn} ({c.code}){c.id === movingDepartment.collegeId ? " — current" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleMoveDepartment}
                className="flex-1 bg-[#8B1538] hover:bg-[#6D1028] text-white"
                disabled={!moveDeptTargetCollegeId || moveDepartmentMutation.isPending}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {moveDepartmentMutation.isPending ? "Moving..." : "Move Department"}
              </Button>
              <Button onClick={() => { setMovingDepartment(null); setMoveDeptTargetCollegeId(""); }} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Move Program Modal ── */}
      {movingProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#8B1538]">Move Program</h2>
              <button onClick={() => { setMovingProgram(null); setMoveProgTargetDeptId(""); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-600">Moving: <span className="font-semibold">{movingProgram.program.nameEn}</span></p>
            <p className="text-xs text-gray-500">Current department: <span className="font-medium">{movingProgram.department.nameEn}</span></p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Move to Department</label>
              <select
                value={moveProgTargetDeptId}
                onChange={e => setMoveProgTargetDeptId(e.target.value ? Number(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1538]/40"
              >
                <option value="">Select target department...</option>
                {departments?.map(d => (
                  <option key={d.id} value={d.id} disabled={d.id === movingProgram.program.departmentId}>
                    {d.nameEn} ({d.code}) — {colleges?.find(c => c.id === d.collegeId)?.code}{d.id === movingProgram.program.departmentId ? " — current" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleMoveProgram}
                className="flex-1 bg-[#8B1538] hover:bg-[#6D1028] text-white"
                disabled={!moveProgTargetDeptId || moveProgramMutation.isPending}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {moveProgramMutation.isPending ? "Moving..." : "Move Program"}
              </Button>
              <Button onClick={() => { setMovingProgram(null); setMoveProgTargetDeptId(""); }} variant="outline" className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

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
