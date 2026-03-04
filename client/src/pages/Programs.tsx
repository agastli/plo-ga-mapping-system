import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookOpen, GraduationCap, Home, Plus, FileText, X, Grid3X3 } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";

export default function Programs() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [selectedClusterId, setSelectedClusterId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  
  // Get current user to check role
  const { data: currentUser } = trpc.auth.me.useQuery();
  const isAdmin = currentUser?.role === 'admin';
  
  // Admins see all programs, viewers/editors see only assigned programs
  const { data: allPrograms, isLoading: allProgramsLoading } = trpc.programs.list.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: accessiblePrograms, isLoading: accessibleProgramsLoading } = trpc.users.getAccessiblePrograms.useQuery(undefined, {
    enabled: !isAdmin,
  });
  
  const programs = isAdmin ? allPrograms : accessiblePrograms;
  const programsLoading = isAdmin ? allProgramsLoading : accessibleProgramsLoading;
  
   const { data: colleges, isLoading: collegesLoading } = trpc.colleges.list.useQuery();
  const { data: allDepartments } = trpc.departments.list.useQuery();
  
  // Fetch clusters for selected college
  const { data: allClusters } = trpc.clusters.list.useQuery();
  const clusters = selectedCollegeId && allClusters
    ? allClusters.filter((c: any) => c.collegeId === parseInt(selectedCollegeId))
    : [];
  const hasCluster = clusters.length > 0;

  // Departments for the selected college (after cluster filter if applicable)
  const departmentsForFilter = allDepartments?.filter((d: any) => {
    if (!selectedCollegeId) return false;
    if (d.collegeId !== parseInt(selectedCollegeId)) return false;
    if (hasCluster && selectedClusterId) return d.clusterId?.toString() === selectedClusterId;
    return true;
  }) ?? [];

  // Auto-select college/cluster when dept param is in URL
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const deptId = params.get('dept');
    if (deptId && allDepartments && colleges && allClusters) {
      const dept = allDepartments.find((d: any) => d.id.toString() === deptId);
      if (dept) {
        setSelectedCollegeId(dept.collegeId.toString());
        if (dept.clusterId) setSelectedClusterId(dept.clusterId.toString());
        setSelectedDepartmentId(deptId);
      }
    }
  }, [searchString, allDepartments, colleges, allClusters]);

  // Reset cluster and department selection when college changes
  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setSelectedClusterId("");
    setSelectedDepartmentId("");
  };

  const filteredPrograms = selectedCollegeId ? programs?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.program.nameEn.toLowerCase().includes(searchLower) ||
      item.department.nameEn.toLowerCase().includes(searchLower) ||
      item.college.nameEn.toLowerCase().includes(searchLower);
    
    const matchesCollege = item.college.id.toString() === selectedCollegeId;
    
    // If college has clusters, require cluster selection
    if (hasCluster && !selectedClusterId) {
      return false;
    }
    
    // If cluster is selected, filter by cluster
    const matchesCluster = selectedClusterId 
      ? item.department.clusterId?.toString() === selectedClusterId
      : true;

    // If department is selected, filter by department
    const matchesDepartment = selectedDepartmentId
      ? item.program.departmentId?.toString() === selectedDepartmentId
      : true;
    
    return matchesSearch && matchesCollege && matchesCluster && matchesDepartment;
  }) : [];

  const isLoading = programsLoading || collegesLoading;

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
              <Button variant="outline" asChild className="border-green-600 text-green-600 hover:bg-green-50">
                <Link href="/programs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Program
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href="/manual">
                  <FileText className="mr-2 h-4 w-4" />
                  User Manual
                </Link>
              </Button>
              <Button variant="default" asChild className="bg-[#8B1538] hover:bg-[#6B1028]">
                <Link href="/upload">
                  Upload Document
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      </div>

      <div className="container mx-auto px-4 pb-1 max-w-7xl">
        <Breadcrumb items={[{ label: "Programs Directory" }]} />
      </div>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2 text-[#8B1538]">Programs Directory</h1>
        <p className="text-gray-700 mb-4">
          Browse and manage PLO-GA mappings for academic programs
        </p>

        {/* Intro Panel */}
        <div className="bg-white border-l-4 border-[#8B1538] rounded-lg shadow-sm p-5 mb-8">
          <h2 className="text-base font-bold text-[#8B1538] mb-2">What can you do on this page?</h2>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>Search &amp; Filter</strong> — use the search bar or college/department filters to quickly find a program.</li>
            <li><strong>Open a Program</strong> — click any program card to view its PLOs, manage mappings, and see alignment details.</li>
            <li><strong>Add a Program</strong> — administrators and editors can create new programs using the “Add Program” button.</li>
            <li><strong>Upload Mappings</strong> — import PLOs and GA mappings from a Word document directly from the program detail page.</li>
            <li><strong>Export Reports</strong> — download the full PLO-GA mapping document for any program as Word or PDF.</li>
          </ul>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <Card className="shadow-md border-[#8B1538]/20 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* College Filter */}
                <div className="flex-shrink-0 md:w-64">
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    🏛️ Filter by College
                  </label>
                  <Select value={selectedCollegeId} onValueChange={handleCollegeChange}>
                    <SelectTrigger className="border-[#8B1538]/20 focus:ring-[#8B1538]">
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges?.map((college) => (
                        <SelectItem key={college.id} value={college.id.toString()}>
                          {college.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cluster Filter - Only show if selected college has clusters */}
                {hasCluster && (
                  <div className="flex-shrink-0 md:w-64">
                    <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                      📂 Filter by Cluster
                    </label>
                    <Select value={selectedClusterId} onValueChange={setSelectedClusterId}>
                      <SelectTrigger className="border-[#8B1538]/20 focus:ring-[#8B1538]">
                        <SelectValue placeholder="Select a cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {clusters.map((cluster: any) => (
                          <SelectItem key={cluster.id} value={cluster.id.toString()}>
                            {cluster.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Department Filter - shown when a college is selected */}
                {selectedCollegeId && departmentsForFilter.length > 0 && (
                  <div className="flex-shrink-0 md:w-64">
                    <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                      🏢 Filter by Department
                    </label>
                    <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                      <SelectTrigger className="border-[#8B1538]/20 focus:ring-[#8B1538]">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsForFilter.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Search Box */}
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    🔍 Search Programs
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search programs, departments, or colleges..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#8B1538]/20 focus:ring-[#8B1538] focus:border-[#8B1538]"
                    />
                  </div>
                </div>
              </div>

              {/* Results Count + Clear Filter */}
              {!isLoading && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#8B1538]" />
                    <span className="font-medium text-[#8B1538]">{filteredPrograms?.length || 0}</span>
                    {filteredPrograms?.length === 1 ? 'program' : 'programs'} found
                  </p>
                  {(selectedCollegeId || selectedClusterId || selectedDepartmentId || searchTerm) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedCollegeId(""); setSelectedClusterId(""); setSelectedDepartmentId(""); setSearchTerm(""); }}
                      className="text-[#8B1538] border-[#8B1538] hover:bg-[#8B1538]/10 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mb-4"></div>
              <p className="text-slate-600">Loading programs...</p>
            </div>
          </div>
        ) : !selectedCollegeId ? (
          <Card className="border-2 border-dashed border-[#8B1538]/30 bg-gradient-to-br from-white to-amber-50/30">
            <CardContent className="py-20 text-center">
              <div className="text-7xl mb-6">🏛️</div>
              <h3 className="text-3xl font-bold text-[#8B1538] mb-3">Select a College</h3>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                Please select a college from the filter above to view its programs
              </p>
            </CardContent>
          </Card>
        ) : hasCluster && !selectedClusterId ? (
          <Card className="border-2 border-dashed border-[#8B1538]/30 bg-gradient-to-br from-white to-amber-50/30">
            <CardContent className="py-20 text-center">
              <div className="text-7xl mb-6">📂</div>
              <h3 className="text-3xl font-bold text-[#8B1538] mb-3">Select a Cluster</h3>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                This college has clusters. Please select a cluster from the filter above to view its programs
              </p>
            </CardContent>
          </Card>
        ) : filteredPrograms && filteredPrograms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((item) => (
              <Card 
                key={item.program.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#8B1538]/30 bg-gradient-to-br from-white to-slate-50"
              >
                <CardHeader className="space-y-3">
                  {/* Program Icon and Status Badges */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-[#8B1538]/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🎓
                    </div>
                    <div className="flex flex-col gap-1">
                      {item.ploCount === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium" title="No PLOs defined">
                          ⚠️ No PLOs
                        </span>
                      )}
                      {item.ploCount > 0 && item.mappingCount === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium" title="No mappings defined">
                          ⚠️ No Mappings
                        </span>
                      )}
                      {item.ploCount > 0 && item.mappingCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium" title="Complete">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl text-slate-900 group-hover:text-[#8B1538] transition-colors">
                    {item.program.nameEn}
                  </CardTitle>
                  
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">🏢</span>
                      <span className="font-medium text-slate-700">{item.department.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">🏛️</span>
                      <span className="text-slate-600">{item.college.nameEn}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Language Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Language:</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B1538]/10 text-[#8B1538] rounded-full text-sm font-medium">
                      {item.program.language === 'en' ? '🇬🇧' : item.program.language === 'ar' ? '🇶🇦' : '🌐'}
                      {item.program.language === 'en' ? 'English' : item.program.language === 'ar' ? 'Arabic' : 'Bilingual'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      asChild 
                      className="flex-1 bg-[#8B1538] hover:bg-[#6B1028] group-hover:shadow-lg transition-all"
                    >
                      <Link href={`/programs/${item.program.id}`}>
                        View Details
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
                      title="View PLO-GA Mapping Matrix"
                      disabled={item.ploCount === 0}
                    >
                      <Link href={`/programs/${item.program.id}#mapping`}>
                        <Grid3X3 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">No programs found</h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                }}
                className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

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
