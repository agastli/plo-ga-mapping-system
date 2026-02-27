import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Home, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function ClusterManagement() {
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: clusters } = trpc.clusters.list.useQuery();
  const { data: departments, refetch: refetchDepartments } = trpc.departments.list.useQuery();
  
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>(undefined);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [editClusterId, setEditClusterId] = useState<number | undefined>(undefined);
  
  const updateDepartment = trpc.departments.update.useMutation();
  
  // Filter departments by selected college
  const filteredDepartments = selectedCollegeId && departments
    ? departments.filter(d => d.collegeId === selectedCollegeId)
    : [];
  
  // Filter clusters by selected college
  const filteredClusters = selectedCollegeId && clusters
    ? clusters.filter(c => c.collegeId === selectedCollegeId)
    : [];
  
  const handleSaveClusterAssignment = async (departmentId: number) => {
    try {
      await updateDepartment.mutateAsync({
        id: departmentId,
        clusterId: editClusterId,
      });
      await refetchDepartments();
      setEditingDepartmentId(null);
      toast.success("Cluster assignment updated successfully");
    } catch (error) {
      toast.error("Failed to update cluster assignment");
    }
  };
  
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/qu-logo.png" 
              alt="Qatar University" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#8B1538]">PLO-GA Mapping System</h1>
              <p className="text-sm text-gray-600">Academic Planning & Quality Assurance Office</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-[#8B1538]/5 px-4 py-3 rounded-lg">
          <Link href="/" className="hover:text-[#8B1538] transition-colors">
            🏠 Qatar University
          </Link>
          <span>›</span>
          <span className="text-[#8B1538] font-medium">Cluster Management</span>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Cluster Management</h2>
          <p className="text-gray-600">Assign departments to clusters for organizational structure</p>
        </div>

        {/* College Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select College</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedCollegeId || ""}
              onChange={(e) => {
                setSelectedCollegeId(e.target.value ? Number(e.target.value) : undefined);
                setEditingDepartmentId(null);
              }}
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select a college</option>
              {colleges?.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.nameEn}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Department-Cluster Assignment */}
        {selectedCollegeId && (
          <>
            {filteredClusters.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <p>This college does not have any clusters defined.</p>
                  <p className="text-sm mt-2">Clusters are only available for colleges with organizational cluster structure (e.g., College of Arts and Sciences).</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Department-Cluster Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredDepartments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No departments found for this college.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Current Cluster</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDepartments.map((dept) => {
                            const currentCluster = clusters?.find(c => c.id === dept.clusterId);
                            const isEditing = editingDepartmentId === dept.id;
                            
                            return (
                              <tr key={dept.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium text-gray-900">{dept.nameEn}</p>
                                    {dept.nameAr && (
                                      <p className="text-sm text-gray-600" dir="rtl">{dept.nameAr}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {isEditing ? (
                                    <select
                                      value={editClusterId || ""}
                                      onChange={(e) => setEditClusterId(e.target.value ? Number(e.target.value) : undefined)}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    >
                                      <option value="">No cluster</option>
                                      {filteredClusters.map((cluster) => (
                                        <option key={cluster.id} value={cluster.id}>
                                          {cluster.nameEn}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className={currentCluster ? "text-gray-900" : "text-gray-400 italic"}>
                                      {currentCluster?.nameEn || "Not assigned"}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {isEditing ? (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingDepartmentId(null);
                                          setEditClusterId(undefined);
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveClusterAssignment(dept.id)}
                                        className="bg-[#8B1538] hover:bg-[#6B1028]"
                                      >
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingDepartmentId(dept.id);
                                        setEditClusterId(dept.clusterId || undefined);
                                      }}
                                      className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
                                    >
                                      Edit
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#821F45] rounded-lg shadow-lg mt-8">
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
}
