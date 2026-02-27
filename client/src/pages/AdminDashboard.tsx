import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Upload, 
  Settings,
  Database,
  Shield,
  LogOut,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();
  const { data: users } = trpc.users.list.useQuery();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const stats = [
    {
      title: "Total Programs",
      value: programs?.length || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Mappings",
      value: programs?.reduce((sum, p) => sum + (p.mappingCount || 0), 0) || 0,
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total PLOs",
      value: programs?.reduce((sum, p) => sum + (p.ploCount || 0), 0) || 0,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const quickLinks = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
    },
    {
      title: "Program Management",
      description: "Add, edit, and delete programs",
      href: "/programs",
      icon: FileText,
      color: "text-green-600",
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
      description: "Comprehensive system analytics",
      href: "/analytics",
      icon: BarChart3,
      color: "text-orange-600",
    },
    {
      title: "Organizational Structure",
      description: "Manage colleges, departments, and clusters",
      href: "/admin/structure",
      icon: Building2,
      color: "text-indigo-600",
    },
    {
      title: "System Settings",
      description: "Configure system settings and templates",
      href: "/templates",
      icon: Settings,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md rounded-lg mx-4 my-4">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/qu-logo.png" alt="QU Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-[#8B1538]">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name || user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
              <Link href="/admin-dashboard">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Administrator</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#8B1538] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/qu-logo.png" alt="Qatar University" className="h-10 w-auto brightness-0 invert" />
              <div className="text-sm">
                <p className="font-semibold">© 2026 Qatar University. All rights reserved.</p>
              </div>
            </div>
            <div className="text-sm text-right">
              <p>PLO-GA Mapping System v1.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
