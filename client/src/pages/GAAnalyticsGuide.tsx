import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, BookOpen } from "lucide-react";
import PageFooter from "@/components/PageFooter";

export default function GAAnalyticsGuide() {
  const [, setLocation] = useLocation();

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
            className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={() => setLocation("/analytics/ga")}
            className="bg-[#A91D3A] text-white px-4 py-2 rounded hover:bg-[#8B1538] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to GA Analytics
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8">
        <Header />

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#8B1538] mb-2 flex items-center gap-3">
            <BookOpen className="h-10 w-10" />
            Graduate Attributes Analytics Guide
          </h1>
          <p className="text-lg text-gray-600">
            Understanding GA coverage, alignment, and assessment methodology
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">📊 Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              The Graduate Attributes (GA) Analytics dashboard provides comprehensive insights into how well
              academic programs align with Qatar University's five Graduate Attributes. Each GA represents
              a key competency area that graduates should demonstrate upon completion of their programs.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="font-semibold text-blue-900">Purpose:</p>
              <p className="text-blue-800">
                This dashboard helps identify which GAs are well-covered across programs and which may need
                additional attention or curriculum development.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The 5 Graduate Attributes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">🎯 The Five Graduate Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-[#8B1538] pl-4">
                <h3 className="font-bold text-lg">GA1: Competent</h3>
                <p className="text-gray-600">Subject-matter mastery, critical thinking, problem-solving, and research skills</p>
                <p className="text-sm text-gray-500 mt-1">Competencies: C1-1, C1-2, C1-3, C1-4</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                  <li>C1-1: Subject-matter mastery</li>
                  <li>C1-2: Critical-thinking skills</li>
                  <li>C1-3: Problem-solving skills</li>
                  <li>C1-4: Research, and Novel and Adaptive Thinking</li>
                </ul>
              </div>
              <div className="border-l-4 border-[#A91D3A] pl-4">
                <h3 className="font-bold text-lg">GA2: Life-long Learner</h3>
                <p className="text-gray-600">Self-awareness, adaptability, and continuous learning mindset</p>
                <p className="text-sm text-gray-500 mt-1">Competencies: C2-1, C2-2, C2-3, C2-4</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                  <li>C2-1: Self-awareness</li>
                  <li>C2-2: Adaptability</li>
                  <li>C2-3: Adaptive Thinking</li>
                  <li>C2-4: Desire for life-long learning</li>
                </ul>
              </div>
              <div className="border-l-4 border-[#C73E1D] pl-4">
                <h3 className="font-bold text-lg">GA3: Well Rounded</h3>
                <p className="text-gray-600">Cultural awareness, effective communication, and global perspective</p>
                <p className="text-sm text-gray-500 mt-1">Competencies: C3-1, C3-2, C3-3</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                  <li>C3-1: Cultured</li>
                  <li>C3-2: Effective communication skills</li>
                  <li>C3-3: Awareness of local and international issues</li>
                </ul>
              </div>
              <div className="border-l-4 border-[#D4A017] pl-4">
                <h3 className="font-bold text-lg">GA4: Ethically & Socially Responsible</h3>
                <p className="text-gray-600">Arabic-Islamic identity, diversity appreciation, ethical conduct, and civic engagement</p>
                <p className="text-sm text-gray-500 mt-1">Competencies: C4-1, C4-2, C4-3, C4-4, C4-5</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                  <li>C4-1: Embody the Arabic-Islamic identity</li>
                  <li>C4-2: Embrace diversity</li>
                  <li>C4-3: Professional and ethical conduct</li>
                  <li>C4-4: Civically engaged</li>
                  <li>C4-5: Community and Global Engagement</li>
                </ul>
              </div>
              <div className="border-l-4 border-[#2E8B57] pl-4">
                <h3 className="font-bold text-lg">GA5: Entrepreneurial</h3>
                <p className="text-gray-600">Creativity, innovation, collaboration, management, and leadership</p>
                <p className="text-sm text-gray-500 mt-1">Competencies: C5-1, C5-2, C5-3, C5-4, C5-5</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 ml-4">
                  <li>C5-1: Creativity and innovation</li>
                  <li>C5-2: Collaborative</li>
                  <li>C5-3: Management</li>
                  <li>C5-4: Interpersonal</li>
                  <li>C5-5: Leadership</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Explained */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">📈 Key Metrics Explained</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">1. Coverage Rate</h3>
              <p className="text-gray-700 mb-2">
                The percentage of programs that map to at least one competency within a Graduate Attribute.
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                Coverage Rate = (Programs with GA mapping / Total Programs) × 100%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Example:</strong> If 45 out of 50 programs map to GA1, the coverage rate is 90%.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. Average Alignment Score</h3>
              <p className="text-gray-700 mb-2">
                The GA alignment score is calculated using a hierarchical sum-based approach:
              </p>
              <div className="bg-gray-100 p-4 rounded space-y-2">
                <div className="font-mono text-sm">
                  <strong>Program Level:</strong><br/>
                  Competency Score = SUM of all mapping weights (0.0 to 1.0)<br/>
                  GA Score = AVERAGE of competency scores × 100%
                </div>
                <div className="font-mono text-sm mt-2">
                  <strong>University/College Level:</strong><br/>
                  Competency Score = AVERAGE of competency scores across programs<br/>
                  GA Score = AVERAGE of competency scores × 100%
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Example:</strong> If GA1 has 4 competencies with scores 1.00, 1.00, 1.00, 1.00, then GA1 = (1.00 + 1.00 + 1.00 + 1.00) / 4 × 100 = 100%
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Interpretation:</strong> Higher scores (closer to 100%) indicate stronger and more complete alignment with that GA.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">3. Total Mappings</h3>
              <p className="text-gray-700 mb-2">
                The count of all PLO-to-competency mappings (with non-zero weights) for a GA.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Note:</strong> A higher count suggests more comprehensive integration of the GA across program learning outcomes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visualizations Explained */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">📊 Understanding the Visualizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">GA Coverage Distribution Chart</h3>
              <p className="text-gray-700">
                A bar chart showing the coverage rate for each GA. This helps identify which GAs are widely
                adopted across programs and which may be underrepresented.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-2">
                <p className="text-green-900"><strong>High Coverage (≥80%):</strong> GA is well-integrated across programs</p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-2">
                <p className="text-yellow-900"><strong>Medium Coverage (50-79%):</strong> GA has moderate adoption</p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2">
                <p className="text-red-900"><strong>Low Coverage (&lt;50%):</strong> GA may need curriculum attention</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Average Alignment Scores Chart</h3>
              <p className="text-gray-700">
                Shows the mean mapping weight for each GA, indicating the strength of alignment between
                program PLOs and GA competencies.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Use Case:</strong> Compare relative emphasis on different GAs across the university.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">GA Coverage Profile (Radar Chart)</h3>
              <p className="text-gray-700">
                A radar chart providing a visual "fingerprint" of GA coverage across the institution.
                The shape reveals balance (or imbalance) in GA emphasis.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Ideal Shape:</strong> A relatively balanced pentagon indicates comprehensive GA coverage.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">GA by College Heatmap</h3>
              <p className="text-gray-700">
                A cross-analysis showing which colleges emphasize which GAs. Darker colors indicate
                higher alignment scores.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Insight:</strong> Reveals disciplinary patterns in GA emphasis (e.g., Engineering may emphasize GA1 & GA5).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filtering Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">🔍 Using Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">University-wide View</h3>
              <p className="text-gray-700">
                Shows aggregate GA analytics across all programs and colleges. Use this for institutional-level assessment.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">By College</h3>
              <p className="text-gray-700">
                Filters data to show GA coverage and alignment for programs within a specific college.
                Useful for college-level curriculum review.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">By Program</h3>
              <p className="text-gray-700">
                Displays GA analytics for a single program. Ideal for program-level assessment and accreditation reporting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interpretation Guidelines */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">💡 Interpretation Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-blue-900 mb-2">What does high coverage mean?</h3>
              <p className="text-blue-800">
                High coverage (≥80%) indicates that most programs include learning outcomes aligned with the GA.
                This suggests the GA is well-integrated into the curriculum.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-bold text-yellow-900 mb-2">What if a GA has low coverage?</h3>
              <p className="text-yellow-800">
                Low coverage (&lt;50%) may indicate a gap in curriculum design. Consider whether the GA should
                be more explicitly addressed in program learning outcomes or if it's discipline-specific.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-900 mb-2">How to use alignment scores?</h3>
              <p className="text-green-800">
                Higher alignment scores indicate stronger emphasis. Compare scores across GAs to identify
                institutional strengths and areas for development.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">✅ Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>Identify Gaps:</strong> Look for GAs with coverage below 60% and investigate why certain
                programs don't address them.
              </li>
              <li>
                <strong>Balance Check:</strong> Use the radar chart to assess whether GA emphasis is balanced
                or if certain attributes dominate.
              </li>
              <li>
                <strong>College Comparison:</strong> Review the heatmap to understand disciplinary patterns and
                share best practices across colleges.
              </li>
              <li>
                <strong>Program Review:</strong> Use program-level filters to support accreditation processes
                and curriculum development.
              </li>
              <li>
                <strong>Trend Analysis:</strong> Export data regularly to track changes in GA coverage over time
                as programs evolve.
              </li>
            </ol>
          </CardContent>
        </Card>

      </div>
      <PageFooter />

    </div>
  );
}
