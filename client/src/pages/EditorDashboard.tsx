import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  BarChart3, 
  Upload, 
  Shield,
  LogOut,
  Edit,
  Eye
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function EditorDashboard() {
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

  // Get only programs accessible to this editor
  const myPrograms = accessiblePrograms || [];

  const stats = [
    {
      title: "My Programs",
      value: myPrograms.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Mappings",
      value: myPrograms.reduce((sum, p) => sum + (p.mappingCount || 0), 0),
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total PLOs",
      value: myPrograms.reduce((sum, p) => sum + (p.ploCount || 0), 0),
      icon: Edit,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const quickLinks = [
    {
      title: "My Programs",
      description: "View and edit programs assigned to you",
      icon: FileText,
      href: "/programs",
      color: "text-blue-600",
    },
    {
      title: "Upload Documents",
      description: "Upload and parse PLO documents",
      href: "/upload",
      icon: Upload,
      color: "text-purple-600",
    },
    {
      title: "View Analytics",
      description: "Analytics for your assigned programs",
      href: "/analytics",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-md rounded-lg mx-4 my-4">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/qu-logo.png" alt="QU Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-[#8B1538]">Editor Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name || user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Editor</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link) => (
              <Link key={link.title} href={link.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50`}>
                        <link.icon className={`h-6 w-6 ${link.color}`} />
                      </div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* My Programs List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Assigned Programs</h2>
          {myPrograms.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No programs assigned yet</p>
                <p className="text-sm text-gray-500 mt-2">Contact your administrator to get program access</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPrograms.map((program) => (
                <Link key={program.program.id} href={`/programs/${program.program.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{program.program.code}</Badge>
                        <Edit className="h-4 w-4 text-gray-400" />
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
    </div>
  );
}
