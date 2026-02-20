import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookOpen, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("all");
  
  const { data: programs, isLoading: programsLoading } = trpc.programs.list.useQuery();
  const { data: colleges, isLoading: collegesLoading } = trpc.colleges.list.useQuery();

  const filteredPrograms = programs?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.program.nameEn.toLowerCase().includes(searchLower) ||
      item.department.nameEn.toLowerCase().includes(searchLower) ||
      item.college.nameEn.toLowerCase().includes(searchLower);
    
    const matchesCollege = 
      selectedCollegeId === "all" || 
      item.college.id.toString() === selectedCollegeId;
    
    return matchesSearch && matchesCollege;
  });

  const isLoading = programsLoading || collegesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Premium Header with QU Logo */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/qu-logo.png" alt="Qatar University" className="h-14 w-auto" />
              <div className="border-l-2 border-[#8B1538] pl-4">
                <h1 className="text-xl font-bold text-[#8B1538] flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Programs Directory
                </h1>
                <p className="text-sm text-slate-600">Browse and manage program mappings</p>
              </div>
            </div>
            <Button variant="ghost" asChild className="text-[#8B1538] hover:bg-[#8B1538]/10">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* College Filter */}
                <div className="flex-shrink-0 md:w-64">
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
                    🏛️ Filter by College
                  </label>
                  <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
                    <SelectTrigger className="border-[#8B1538]/20 focus:ring-[#8B1538]">
                      <SelectValue placeholder="All Colleges" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {colleges?.map((college) => (
                        <SelectItem key={college.id} value={college.id.toString()}>
                          {college.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

              {/* Results Count */}
              {!isLoading && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#8B1538]" />
                    <span className="font-medium text-[#8B1538]">{filteredPrograms?.length || 0}</span> 
                    {filteredPrograms?.length === 1 ? 'program' : 'programs'} found
                  </p>
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
        ) : filteredPrograms && filteredPrograms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((item) => (
              <Card 
                key={item.program.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#8B1538]/30 bg-gradient-to-br from-white to-slate-50"
              >
                <CardHeader className="space-y-3">
                  {/* Program Icon */}
                  <div className="w-12 h-12 bg-[#8B1538]/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🎓
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
                  
                  <Button 
                    asChild 
                    className="w-full bg-[#8B1538] hover:bg-[#6B1028] group-hover:shadow-lg transition-all"
                  >
                    <Link href={`/programs/${item.program.id}`}>
                      View Details
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Link>
                  </Button>
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
                  setSelectedCollegeId("all");
                }}
                className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-slate-800 mt-20 py-8 border-t-4 border-[#8B1538]">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/qu-logo.png" alt="Qatar University" className="h-8 w-auto opacity-90" />
            <span className="text-white font-medium">Qatar University</span>
          </div>
          <p className="text-slate-400 text-sm">PLO-GA Mapping Management System © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
