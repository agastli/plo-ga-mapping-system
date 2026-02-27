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
  Search
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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Title and Welcome */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Viewer Dashboard</h2>
          <p className="text-lg text-gray-600">Welcome, {user?.name || 'Viewer'}</p>
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
