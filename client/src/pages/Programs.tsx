import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Programs</h1>
            <p className="text-gray-600 mt-1">Browse and manage program mappings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* College Filter */}
          <div className="w-full sm:w-64">
            <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select College" />
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

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search programs, departments, or colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Programs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading programs...</p>
          </div>
        ) : filteredPrograms && filteredPrograms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((item) => (
              <Card key={item.program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{item.program.nameEn}</CardTitle>
                  <CardDescription>
                    {item.department.nameEn}
                    <br />
                    {item.college.nameEn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Language: {item.program.language === "ar" ? "Arabic" : item.program.language === "both" ? "Both" : "English"}
                    </span>
                    <Button asChild size="sm">
                      <Link href={`/programs/${item.program.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">
                {selectedCollegeId !== "all" 
                  ? "No programs found in the selected college" 
                  : "No programs found"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
