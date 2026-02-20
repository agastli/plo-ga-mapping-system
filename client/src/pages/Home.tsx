import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { FileUp, Database, BarChart3, PenTool, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">PLO-GA Mapping System</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/programs">My Programs</Link>
                </Button>
              </div>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Program Learning Outcomes to Graduate Attributes Mapping
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive bilingual system for managing, analyzing, and visualizing PLO-GA mappings across academic programs
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileUp className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload Word documents in our template format to automatically extract PLOs, mappings, and justifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/upload">Upload Document</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <PenTool className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Manually input PLOs, mapping weights, and justifications through interactive forms with validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/manual-entry">Manual Entry</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Database className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Manage Programs</CardTitle>
              <CardDescription>
                View, edit, and manage all program mappings with full CRUD operations and audit logging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/programs">View Programs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Explore alignment statistics at program, department, college, and university levels with interactive charts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow col-span-full md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌐</span>
                <span className="text-2xl">العربية</span>
              </div>
              <CardTitle>Bilingual Support</CardTitle>
              <CardDescription>
                Full support for English and Arabic with proper RTL layout, allowing seamless work in both languages
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>About the System</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700">
                This system helps academic institutions manage the mapping of Program Learning Outcomes (PLOs) to 
                Graduate Attributes (GAs) and their 21 related competencies. It supports:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Automated extraction from Word documents following the standard template</li>
                <li>Manual data entry with comprehensive validation</li>
                <li>Statistical analysis of alignment at multiple organizational levels</li>
                <li>Interactive dashboards with drill-down capabilities</li>
                <li>Full bilingual support for English and Arabic</li>
                <li>Role-based access control and audit logging</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>PLO-GA Mapping Management System © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
