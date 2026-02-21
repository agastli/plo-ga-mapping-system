import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Database, BarChart3, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Premium Header with QU Logo */}
      <div className="container mx-auto px-4 pt-4 max-w-6xl">
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
            <Button variant="default" size="lg" asChild className="bg-[#8B1538] hover:bg-[#6B1028]">
              <Link href="/programs">
                <Database className="mr-2 h-4 w-4" />
                View Programs
              </Link>
            </Button>
          </div>
        </div>
      </header>
      </div>

      {/* Hero Section with Elegant Design */}
      <main className="container mx-auto px-4">
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-[#8B1538]/10 text-[#8B1538] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>🎓 Qatar University Academic Planning & Quality Assurance Office</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Program Learning Outcomes to
            <span className="block text-[#8B1538] mt-2">Graduate Attributes Mapping</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            A comprehensive bilingual system for managing, analyzing, and visualizing PLO-GA mappings 
            across academic programs with professional reporting and analytics
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-[#8B1538] hover:bg-[#6B1028] text-lg px-8 py-6">
              <Link href="/upload">
                <FileUp className="mr-2 h-5 w-5" />
                Upload Document
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/5">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Link>
            </Button>
          </div>
        </section>

        {/* Feature Cards with Premium Design */}
        <section className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Upload Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#8B1538]/30 bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-[#8B1538]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="h-7 w-7 text-[#8B1538]" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Upload Documents</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Upload Word documents in our template format to automatically extract PLOs, mappings, 
                  and justifications with intelligent parsing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-[#8B1538] hover:bg-[#6B1028]">
                  <Link href="/upload">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Manage Programs Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#8B1538]/30 bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-[#8B1538]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="h-7 w-7 text-[#8B1538]" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Manage Programs</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Browse and manage PLOs mapping to Graduate Attributes with inline editing, full CRUD operations, 
                  and comprehensive audit logging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-[#8B1538] hover:bg-[#6B1028]">
                  <Link href="/programs">Browse Programs</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#8B1538]/30 bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-[#8B1538]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-[#8B1538]" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Analytics Dashboard</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Explore alignment statistics at program, department, college, and university levels 
                  with interactive charts and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-[#8B1538] hover:bg-[#6B1028]">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bilingual Support Banner */}
        <section className="py-12">
          <Card className="bg-gradient-to-r from-[#8B1538] to-[#6B1028] text-white border-0 shadow-2xl">
            <CardContent className="py-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Bilingual Support | الدعم ثنائي اللغة</h3>
                    <p className="text-white/90 text-lg">
                      Full support for English and Arabic with proper RTL layout
                    </p>
                  </div>
                </div>
                <div className="text-6xl font-bold opacity-80">العربية</div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Workflow Infographic Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h3>
            <p className="text-xl text-slate-600">Simple, efficient workflow from upload to export</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/120166005/IYBJTpGUpDPwnqKc.png" 
              alt="PLO-GA Mapping System Workflow" 
              className="w-full rounded-2xl shadow-2xl border-4 border-[#8B1538]/10"
            />
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-slate-600">Everything you need for comprehensive PLO-GA mapping management</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { icon: CheckCircle2, emoji: "📄", title: "Automated Extraction", desc: "Parse Word documents with intelligent template recognition" },
              { icon: CheckCircle2, emoji: "✏️", title: "Inline Editing", desc: "Edit PLOs, mappings, and justifications directly in the interface" },
              { icon: CheckCircle2, emoji: "📊", title: "Multi-Format Export", desc: "Export to Word, Excel, and PDF with professional formatting" },
              { icon: CheckCircle2, emoji: "🔄", title: "Smart Updates", desc: "Update existing programs without losing data integrity" },
              { icon: CheckCircle2, emoji: "📈", title: "Visual Analytics", desc: "Interactive dashboards with drill-down capabilities" },
              { icon: CheckCircle2, emoji: "🔍", title: "Audit Logging", desc: "Track all changes with comprehensive audit trails" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#8B1538]/10 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                  {feature.emoji}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-slate-900 mb-1">{feature.title}</h4>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 max-w-5xl mx-auto">
          <Card className="border-2 border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
              <CardTitle className="text-3xl text-[#8B1538]">About the System</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none p-8">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                This system helps academic institutions manage the mapping of Program Learning Outcomes (PLOs) to 
                Graduate Attributes (GAs) and their 21 related competencies. Designed specifically for Qatar University's 
                academic quality assurance processes, it provides a comprehensive solution for:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Automated extraction from Word documents",
                  "Manual data entry with validation",
                  "Statistical analysis at multiple levels",
                  "Interactive dashboards with insights",
                  "Full bilingual English/Arabic support",
                  "Role-based access control",
                  "Professional document generation",
                  "Comprehensive audit logging"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#8B1538] rounded-full"></div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Premium Footer */}
      <div className="container mx-auto px-4 pb-6 mt-20 max-w-6xl">
        <footer className="bg-[#821F45] rounded-lg shadow-lg">
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/qu-log-white-transparent.jpg" alt="Qatar University" className="h-14 w-auto" />
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
