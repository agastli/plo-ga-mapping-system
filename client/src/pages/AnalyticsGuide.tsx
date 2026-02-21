import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, TrendingUp, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsGuide() {
  const [, setLocation] = useLocation();

  // Header and Footer components
  const Header = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/qu-logo.png" alt="QU Logo" className="h-14" />
          <div>
            <h1 className="text-xl font-bold text-[#8B1538]">PLO-GA Mapping System</h1>
            <p className="text-sm text-gray-600">Academic Planning & Quality Assurance Office</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLocation("/")}
            className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => setLocation("/analytics")}
            className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
          >
            Back to Analytics
          </button>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="bg-[#821F45] rounded-lg shadow-lg mt-8">
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
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8 max-w-5xl">
        <Header />

        {/* Page Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/analytics")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-[#8B1538] mb-2">Analytics Guide</h1>
          <p className="text-lg text-muted-foreground">
            Understanding PLO-GA Alignment Metrics and Calculations
          </p>
        </div>

        {/* Overview Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <Target className="mr-2 h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              The PLO-GA Mapping System provides comprehensive analytics to assess how well Program Learning Outcomes (PLOs) 
              align with Qatar University's Graduate Attributes (GAs) and their associated competencies. The analytics dashboard 
              presents data at multiple levels: university-wide, college-level, department-level, and program-level.
            </p>
            <p>
              This guide explains the key metrics, how they are calculated, and what they mean for quality assurance and 
              continuous improvement of academic programs.
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <Calculator className="mr-2 h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alignment Score */}
            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Alignment Score</h3>
              <p className="text-gray-700 mb-3">
                The alignment score measures how strongly a program's PLOs are mapped to the competencies. 
                It represents the average strength of all mappings for a program, college, or the entire university.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-mono text-sm mb-2"><strong>Formula:</strong></p>
                <p className="font-mono text-sm">
                  Alignment Score = (Sum of all mapping weights) / (Total number of mappings) × 100
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Example:</strong> If a program has 10 PLOs mapped to 21 competencies with weights ranging from 0.0 to 1.0, 
                  and the sum of all weights is 85, the alignment score would be: (85 / 210) × 100 = 40.5%
                </p>
              </div>
              <div className="mt-3">
                <p className="text-sm"><strong>Interpretation:</strong></p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-2">
                  <li><span className="text-green-600 font-semibold">70-100%</span>: Strong alignment - PLOs are well-mapped to competencies</li>
                  <li><span className="text-yellow-600 font-semibold">40-69%</span>: Moderate alignment - some gaps may exist</li>
                  <li><span className="text-red-600 font-semibold">0-39%</span>: Weak alignment - significant improvement needed</li>
                </ul>
              </div>
            </div>

            {/* Coverage Rate */}
            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Coverage Rate</h3>
              <p className="text-gray-700 mb-3">
                The coverage rate indicates what percentage of competencies are addressed by at least one PLO with a non-zero weight. 
                This helps identify gaps where competencies are not covered by the program.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-mono text-sm mb-2"><strong>Formula:</strong></p>
                <p className="font-mono text-sm">
                  Coverage Rate = (Number of competencies with weight &gt; 0) / (Total competencies) × 100
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Example:</strong> If 18 out of 21 competencies have at least one PLO mapped to them with a non-zero weight, 
                  the coverage rate would be: (18 / 21) × 100 = 85.7%
                </p>
              </div>
              <div className="mt-3">
                <p className="text-sm"><strong>Interpretation:</strong></p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-2">
                  <li><span className="text-green-600 font-semibold">90-100%</span>: Excellent coverage - most/all competencies addressed</li>
                  <li><span className="text-yellow-600 font-semibold">70-89%</span>: Good coverage - minor gaps exist</li>
                  <li><span className="text-red-600 font-semibold">Below 70%</span>: Insufficient coverage - significant gaps in competency mapping</li>
                </ul>
              </div>
            </div>

            {/* GA Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Graduate Attribute (GA) Breakdown</h3>
              <p className="text-gray-700 mb-3">
                The GA breakdown shows the average alignment score for each of the five Graduate Attributes. 
                This helps identify which GAs are well-covered and which need more attention.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-mono text-sm mb-2"><strong>Formula (per GA):</strong></p>
                <p className="font-mono text-sm">
                  GA Score = (Sum of weights for all competencies in this GA) / (Number of competencies in this GA × Number of PLOs) × 100
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Example:</strong> GA1 has 4 competencies. If a program has 10 PLOs and the total weights for GA1 competencies 
                  sum to 20, the GA1 score would be: (20 / (4 × 10)) × 100 = 50%
                </p>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-700">
                  The radar chart in the college analytics view visualizes this breakdown, making it easy to see which GAs 
                  are well-aligned and which may need curriculum adjustments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Levels Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <TrendingUp className="mr-2 h-5 w-5" />
              Dashboard Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">University-Level Dashboard</h3>
              <p className="text-gray-700">
                Provides a bird's-eye view of PLO-GA alignment across all colleges. Shows total colleges, programs, PLOs, 
                and the overall university alignment score. The bar chart compares colleges by their average alignment scores, 
                helping identify top performers and colleges needing support.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">College-Level Dashboard</h3>
              <p className="text-gray-700">
                Focuses on a specific college, showing department-level comparisons and GA breakdown. The radar chart 
                visualizes how well the college addresses each of the five Graduate Attributes, making it easy to spot 
                strengths and areas for improvement.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Department-Level Dashboard</h3>
              <p className="text-gray-700">
                Drills down to individual programs within a department. Shows program-level alignment scores and coverage rates, 
                allowing department chairs to identify which programs are performing well and which need curriculum review.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Using the Analytics Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <Award className="mr-2 h-5 w-5" />
              Using the Analytics for Quality Assurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Identifying Gaps</h3>
              <p className="text-gray-700">
                Low coverage rates indicate that some competencies are not being addressed by PLOs. Review these gaps 
                and consider adding or modifying PLOs to ensure all competencies are covered.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Benchmarking</h3>
              <p className="text-gray-700">
                Compare alignment scores across programs, departments, and colleges. Top performers can serve as models 
                for best practices, while lower-performing units may benefit from curriculum review and support.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Continuous Improvement</h3>
              <p className="text-gray-700">
                Track alignment scores over time (as you update mappings) to monitor the impact of curriculum changes. 
                Use the export functionality to generate reports for accreditation and quality assurance documentation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#8B1538] mb-2">Exporting Data</h3>
              <p className="text-gray-700">
                Each analytics dashboard includes export options (PNG, PDF, Word, Excel) to generate professional reports. 
                These exports include the timestamp showing when the data was generated, ensuring proper documentation for 
                accreditation and institutional research.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              For questions about the analytics dashboard or assistance with interpreting the data, please contact the 
              Academic Planning & Quality Assurance Office at Qatar University.
            </p>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </div>
  );
}
