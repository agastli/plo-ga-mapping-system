import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Upload, Home } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
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
              <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-[#8B1538]">Program Management</h1>
          <p className="text-lg text-gray-700">
            Select an action to manage academic programs and their PLO-GA mappings
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Add New Program */}
          <Link href="/programs/new">
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500/50 bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-slate-900 group-hover:text-green-600 transition-colors">
                  Add New Program
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Create a new academic program with PLOs and GA mappings
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Delete Existing Program */}
          <Link href="/programs/delete">
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-red-500/50 bg-gradient-to-br from-white to-red-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trash2 className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-slate-900 group-hover:text-red-600 transition-colors">
                  Delete Existing Program
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Remove a program and all its associated data permanently
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Proceed with Caution
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Update Existing Program */}
          <Link href="/programs">
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500/50 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Edit className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">
                  Update Existing Program
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Modify program details, PLOs, or GA mappings
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  View Programs
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Upload Document */}
          <Link href="/upload">
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#8B1538]/50 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-[#8B1538]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-[#8B1538]" />
                </div>
                <CardTitle className="text-2xl text-slate-900 group-hover:text-[#8B1538] transition-colors">
                  Upload Document
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Import program data from Word or PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-[#8B1538] hover:bg-[#6B1028] text-white">
                  Upload File
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
