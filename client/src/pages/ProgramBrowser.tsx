import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Shield,
  LogOut,
  Eye,
  Edit,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function ProgramBrowser() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: accessiblePrograms } = trpc.users.getAccessiblePrograms.useQuery();
  
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get only programs accessible to this user
  const allMyPrograms = accessiblePrograms || [];
  
  // Get unique colleges from assigned programs
  const assignedColleges = Array.from(
    new Map(allMyPrograms.map(p => [p.college.id, p.college])).values()
  );
  
  // Get unique clusters for selected college from assigned programs
  const departmentsWithClusters = selectedCollegeId
    ? allMyPrograms.filter(p => p.college.id.toString() === selectedCollegeId && p.department.clusterId)
    : [];
  
  const assignedClusters = Array.from(
    new Map(
      departmentsWithClusters.map(p => [
        p.department.clusterId,
        { id: p.department.clusterId, nameEn: `Cluster ${p.department.clusterId}`, nameAr: `مجموعة ${p.department.clusterId}` }
      ])
    ).values()
  );
  const hasCluster = assignedClusters.length > 0;
  
  // Reset cluster selection when college changes
  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setSelectedClusterId("");
  };
  
  // Filter programs by college and cluster
  const filteredPrograms = selectedCollegeId ? allMyPrograms.filter((item) => {
    const matchesCollege = item.college.id.toString() === selectedCollegeId;
    
    // If college has clusters, require cluster selection
    if (hasCluster && !selectedClusterId) {
      return false;
    }
    
    // If cluster is selected, filter by cluster
    const matchesCluster = selectedClusterId 
      ? item.department.clusterId?.toString() === selectedClusterId
      : true;
    
    return matchesCollege && matchesCluster;
  }) : allMyPrograms;

  const isViewer = user?.role === 'viewer';
  const isEditor = user?.role === 'editor';

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
              <div className="flex gap-3 items-center">
                <Link href={isViewer ? "/viewer-dashboard" : isEditor ? "/editor-dashboard" : "/admin-dashboard"}>
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                </Link>
                <Badge variant="outline" className={isViewer ? "border-blue-500 text-blue-600" : "border-green-500 text-green-600"}>
                  <Shield className="w-4 h-4 mr-1" />
                  {isViewer ? "Viewer (Read-Only)" : "Editor"}
                </Badge>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#8B1538] hover:bg-gray-100 rounded-md transition-colors"
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
        <Breadcrumb items={[{ label: "Browse Programs" }]} />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Programs</h2>
          <p className="text-lg text-gray-600">
            {isViewer ? "View your assigned programs" : "Manage your assigned programs"}
          </p>
        </div>

        {/* Filter Section */}
        <Card className="shadow-md border-[#8B1538]/20 bg-white mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0 md:w-64">
                <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                  🏛️ Filter by College
                </label>
                <Select value={selectedCollegeId} onValueChange={handleCollegeChange}>
                  <SelectTrigger className="border-[#8B1538]/20 focus:ring-[#8B1538]">
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedColleges.map((college) => (
                      <SelectItem key={college.id} value={college.id.toString()}>
                        {college.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {hasCluster && (
                <div className="flex-shrink-0 md:w-64">
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    🔗 Filter by Cluster
                  </label>
                  <Select value={selectedClusterId} onValueChange={setSelectedClusterId}>
                    <SelectTrigger className="border-[#8B1538]/20 focus:ring-[#8B1538]">
                      <SelectValue placeholder="Select a cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedClusters.map((cluster: any) => (
                        <SelectItem key={cluster.id} value={cluster.id.toString()}>
                          {cluster.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Programs List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isViewer ? "My Assigned Programs (Read-Only)" : "My Assigned Programs"}
            {selectedCollegeId && ` - ${filteredPrograms.length} program${filteredPrograms.length !== 1 ? 's' : ''}`}
          </h2>
          {filteredPrograms.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {selectedCollegeId ? "No programs found with the selected filters" : "No programs assigned yet"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedCollegeId ? "Try adjusting your filters" : "Contact your administrator to get program access"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => (
                <Link key={program.program.id} href={`/programs/${program.program.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{program.program.code}</Badge>
                        {isViewer ? (
                          <Eye className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Edit className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <CardTitle className="text-base mt-2">{program.program.nameEn}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {program.department.nameEn}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{program.ploCount || 0} PLOs</span>
                        <span>{program.mappingCount || 0} Mappings</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
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
