import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  BarChart3, 
  Shield,
  LogOut,
  Eye,
  Search,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ViewerDashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: accessiblePrograms } = trpc.users.getAccessiblePrograms.useQuery();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get only programs accessible to this viewer
  const allMyPrograms = accessiblePrograms || [];

  const stats = [
    {
      title: "My Programs",
      value: allMyPrograms.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Mappings",
      value: allMyPrograms.reduce((sum, p) => sum + (p.mappingCount || 0), 0),
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total PLOs",
      value: allMyPrograms.reduce((sum, p) => sum + (p.ploCount || 0), 0),
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

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
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  <Shield className="w-4 h-4 mr-1" />
                  Viewer (Read-Only)
                </Badge>
                <button
                  onClick={() => setLocation('/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B1538] text-white hover:bg-[#6B1028] rounded-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B1538] text-white hover:bg-[#6B1028] rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Title and Welcome */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Viewer Dashboard</h2>
          <p className="text-lg text-gray-600">Welcome, {user?.name || 'Viewer'}</p>
        </div>

        {/* Intro Panel */}
        <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-bold text-blue-700 mb-2">What can you do here?</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            As a <strong>Viewer</strong>, you have read-only access to the PLO-GA Mapping System for the programs assigned to you. Here is what you can do:
          </p>
          <ul className="mt-2 text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>Browse Your Programs</strong> — view the academic programs and their Program Learning Outcomes (PLOs).</li>
            <li><strong>Review Mappings</strong> — explore how each PLO is mapped to Graduate Attributes (GAs) and competencies, along with weighting factors and justifications.</li>
            <li><strong>View Analytics</strong> — see alignment charts and coverage reports for your assigned programs.</li>
            <li><strong>Download Reports</strong> — export mapping documents and analytics as Word, PDF, or Excel files.</li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">You have view-only access. To make changes, contact an administrator or editor assigned to your program.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link href="/program-browser">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#8B1538]/30 h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-6 rounded-full bg-blue-50">
                    <Search className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Browse Programs</h3>
                    <p className="text-gray-600">
                      View and explore your assigned programs with detailed PLO and mapping information
                    </p>
                  </div>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                    <Eye className="h-5 w-5 mr-2" />
                    View Programs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#8B1538]/30 h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-6 rounded-full bg-purple-50">
                    <BarChart3 className="h-12 w-12 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">View Analytics</h3>
                    <p className="text-gray-600">
                      Access comprehensive analytics and statistics for your assigned programs
                    </p>
                  </div>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Open Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
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
