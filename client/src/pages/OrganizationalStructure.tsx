import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Edit2, Save, X, Plus, Shield, LogOut } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function OrganizationalStructure() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: colleges, refetch: refetchColleges } = trpc.colleges.list.useQuery();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  const { data: clusters, refetch: refetchClusters } = trpc.clusters.list.useQuery();
  const { data: departments, refetch: refetchDepartments } = trpc.departments.list.useQuery();
  const { data: programs, refetch: refetchPrograms } = trpc.programs.list.useQuery();

  const updateCollege = trpc.colleges.update.useMutation();
  const updateCluster = trpc.clusters.update.useMutation();
  const updateDepartment = trpc.departments.update.useMutation();
  const updateProgram = trpc.programs.update.useMutation();

  // Editing states
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

  // Handle college edit
  const handleEditCollege = (college: any) => {
    setEditingCollege(college.id);
    setEditCollegeNameEn(college.nameEn || "");
    setEditCollegeNameAr(college.nameAr || "");
    setEditCollegeCode(college.code || "");
  };

  const handleSaveCollege = async (collegeId: number) => {
    try {
      await updateCollege.mutateAsync({
        id: collegeId,
        nameEn: editCollegeNameEn,
        nameAr: editCollegeNameAr,
        code: editCollegeCode,
      });
      await refetchColleges();
      setEditingCollege(null);
      toast.success("College updated successfully");
    } catch (error) {
      toast.error("Failed to update college");
    }
  };

  // Handle cluster edit
  const handleEditCluster = (cluster: any) => {
    setEditingCluster(cluster.id);
    setEditClusterNameEn(cluster.nameEn || "");
    setEditClusterNameAr(cluster.nameAr || "");
    setEditClusterCode(cluster.code || "");
  };

  const handleSaveCluster = async (clusterId: number) => {
    try {
      await updateCluster.mutateAsync({
        id: clusterId,
        nameEn: editClusterNameEn,
        nameAr: editClusterNameAr,
        code: editClusterCode,
      });
      await refetchClusters();
      setEditingCluster(null);
      toast.success("Cluster updated successfully");
    } catch (error) {
      toast.error("Failed to update cluster");
    }
  };

  // Handle department edit
  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department.id);
    setEditDepartmentNameEn(department.nameEn || "");
    setEditDepartmentNameAr(department.nameAr || "");
    setEditDepartmentCode(department.code || "");
  };

  const handleSaveDepartment = async (departmentId: number) => {
    try {
      await updateDepartment.mutateAsync({
        id: departmentId,
        nameEn: editDepartmentNameEn,
        nameAr: editDepartmentNameAr,
        code: editDepartmentCode,
      });
      await refetchDepartments();
      setEditingDepartment(null);
      toast.success("Department updated successfully");
    } catch (error) {
      toast.error("Failed to update department");
    }
  };

  // Handle program edit
  const handleEditProgram = (program: any) => {
    setEditingProgram(program.program.id);
    setEditProgramNameEn(program.program.nameEn || "");
    setEditProgramNameAr(program.program.nameAr || "");
    setEditProgramCode(program.program.code || "");
  };

  const handleSaveProgram = async (programId: number) => {
    try {
      await updateProgram.mutateAsync({
        id: programId,
        nameEn: editProgramNameEn,
        nameAr: editProgramNameAr,
        code: editProgramCode,
      });
      await refetchPrograms();
      setEditingProgram(null);
      toast.success("Program updated successfully");
    } catch (error) {
      toast.error("Failed to update program");
    }
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
              <p className="text-sm text-gray-600">Academic Planning & Quality Assurance Office</p>
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
            <Button onClick={handleLogout} className="flex items-center gap-2 bg-[#8B1538] text-white hover:bg-[#6D1028]">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          </div>
        </header>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin-dashboard" },
            { label: "Organizational Structure" },
          ]}
        />
        {/* Colleges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {colleges?.map((college) => (
                <div key={college.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingCollege === college.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          value={editCollegeNameEn}
                          onChange={(e) => setEditCollegeNameEn(e.target.value)}
                          placeholder="Name (English)"
                        />
                        <Input
                          value={editCollegeNameAr}
                          onChange={(e) => setEditCollegeNameAr(e.target.value)}
                          placeholder="Name (Arabic)"
                          dir="rtl"
                        />
                        <Input
                          value={editCollegeCode}
                          onChange={(e) => setEditCollegeCode(e.target.value)}
                          placeholder="Code"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveCollege(college.id)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setEditingCollege(null)} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
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
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clusters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clusters?.map((cluster) => (
                <div key={cluster.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingCluster === cluster.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          value={editClusterNameEn}
                          onChange={(e) => setEditClusterNameEn(e.target.value)}
                          placeholder="Name (English)"
                        />
                        <Input
                          value={editClusterNameAr}
                          onChange={(e) => setEditClusterNameAr(e.target.value)}
                          placeholder="Name (Arabic)"
                          dir="rtl"
                        />
                        <Input
                          value={editClusterCode}
                          onChange={(e) => setEditClusterCode(e.target.value)}
                          placeholder="Code"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveCluster(cluster.id)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setEditingCluster(null)} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
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
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Departments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments?.map((department) => (
                <div key={department.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingDepartment === department.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          value={editDepartmentNameEn}
                          onChange={(e) => setEditDepartmentNameEn(e.target.value)}
                          placeholder="Name (English)"
                        />
                        <Input
                          value={editDepartmentNameAr}
                          onChange={(e) => setEditDepartmentNameAr(e.target.value)}
                          placeholder="Name (Arabic)"
                          dir="rtl"
                        />
                        <Input
                          value={editDepartmentCode}
                          onChange={(e) => setEditDepartmentCode(e.target.value)}
                          placeholder="Code"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveDepartment(department.id)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setEditingDepartment(null)} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
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
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programs?.map((program) => (
                <div key={program.program.id} className="border rounded-lg p-4 bg-gray-50">
                  {editingProgram === program.program.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          value={editProgramNameEn}
                          onChange={(e) => setEditProgramNameEn(e.target.value)}
                          placeholder="Name (English)"
                        />
                        <Input
                          value={editProgramNameAr}
                          onChange={(e) => setEditProgramNameAr(e.target.value)}
                          placeholder="Name (Arabic)"
                          dir="rtl"
                        />
                        <Input
                          value={editProgramCode}
                          onChange={(e) => setEditProgramCode(e.target.value)}
                          placeholder="Code"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveProgram(program.program.id)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setEditingProgram(null)} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
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
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
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
