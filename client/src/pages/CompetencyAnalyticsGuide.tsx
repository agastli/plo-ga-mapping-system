import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, BookOpen } from "lucide-react";
import PageFooter from "@/components/PageFooter";

export default function CompetencyAnalyticsGuide() {
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
            onClick={() => setLocation("/analytics/competencies")}
            className="bg-[#A91D3A] text-white px-4 py-2 rounded hover:bg-[#8B1538] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Competency Analytics
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
            Competency Analytics Guide
          </h1>
          <p className="text-lg text-gray-600">
            Understanding competency usage, coverage patterns, and gap analysis
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">📊 Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              The Competency Analytics dashboard provides detailed insights into how the 21 competencies
              (organized under 5 Graduate Attributes) are utilized across academic programs. This analysis
              helps identify which competencies are well-covered and which may require additional curriculum attention.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="font-semibold text-blue-900">Purpose:</p>
              <p className="text-blue-800">
                This dashboard enables granular assessment of competency integration, gap identification,
                and strategic curriculum planning at the competency level.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The 21 Competencies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">🎯 The 21 Competencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-[#8B1538] mb-2">GA1: Competent</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>C1-1:</strong> Subject-matter mastery</li>
                  <li><strong>C1-2:</strong> Critical-thinking skills</li>
                  <li><strong>C1-3:</strong> Problem-solving skills</li>
                  <li><strong>C1-4:</strong> Research, and Novel and Adaptive Thinking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#A91D3A] mb-2">GA2: Life-long Learner</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>C2-1:</strong> Self-awareness</li>
                  <li><strong>C2-2:</strong> Adaptability</li>
                  <li><strong>C2-3:</strong> Adaptive Thinking</li>
                  <li><strong>C2-4:</strong> Desire for life-long learning</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#C73E1D] mb-2">GA3: Well Rounded</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>C3-1:</strong> Cultured</li>
                  <li><strong>C3-2:</strong> Effective communication skills</li>
                  <li><strong>C3-3:</strong> Awareness of local and international issues</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#D4A017] mb-2">GA4: Ethically & Socially Responsible</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>C4-1:</strong> Embody the Arabic-Islamic identity</li>
                  <li><strong>C4-2:</strong> Embrace diversity</li>
                  <li><strong>C4-3:</strong> Professional and ethical conduct</li>
                  <li><strong>C4-4:</strong> Civically engaged</li>
                  <li><strong>C4-5:</strong> Community and Global Engagement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#2E8B57] mb-2">GA5: Entrepreneurial</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>C5-1:</strong> Creativity and innovation</li>
                  <li><strong>C5-2:</strong> Collaborative</li>
                  <li><strong>C5-3:</strong> Management</li>
                  <li><strong>C5-4:</strong> Interpersonal</li>
                  <li><strong>C5-5:</strong> Leadership</li>
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
                The percentage of programs that include at least one PLO mapped to the competency.
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                Coverage Rate = (Programs with competency mapping / Total Programs) × 100%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Example:</strong> If 40 out of 50 programs map to C1-1, the coverage rate is 80%.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. Average Weight</h3>
              <p className="text-gray-700 mb-2">
                The average competency score across all programs, calculated using a sum-based approach:
              </p>
              <div className="bg-gray-100 p-4 rounded space-y-2">
                <div className="font-mono text-sm">
                  <strong>Per Program:</strong><br/>
                  Competency Score = SUM of all mapping weights (0.0 to 1.0)
                </div>
                <div className="font-mono text-sm mt-2">
                  <strong>Across Programs:</strong><br/>
                  Avg Weight = AVERAGE of competency scores across all programs
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Interpretation:</strong> Higher weights indicate stronger emphasis on that competency in program curricula.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">3. Total Mappings</h3>
              <p className="text-gray-700 mb-2">
                The count of all PLO-to-competency mappings (with non-zero weights) for a specific competency.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Note:</strong> More mappings suggest the competency is addressed by multiple PLOs across programs.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">4. Justification Completeness</h3>
              <p className="text-gray-700 mb-2">
                The percentage of competency mappings that include written justifications explaining the alignment.
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                Completeness = (Mappings with justification / Total mappings) × 100%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Quality Indicator:</strong> Higher completeness indicates better documentation of curriculum design rationale.
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
              <h3 className="font-bold text-lg mb-2">All Competencies by Coverage Rate</h3>
              <p className="text-gray-700">
                A bar chart showing all 21 competencies sorted by coverage rate (highest to lowest).
                This helps identify which competencies are widely adopted and which are underutilized.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-2">
                <p className="text-green-900"><strong>High Coverage (≥80%):</strong> Competency is well-integrated across programs</p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-2">
                <p className="text-yellow-900"><strong>Medium Coverage (50-79%):</strong> Competency has moderate adoption</p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mt-2">
                <p className="text-red-900"><strong>Low Coverage (&lt;50%):</strong> Competency may be a curriculum gap</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">All Competencies by Average Weight</h3>
              <p className="text-gray-700">
                Shows the mean mapping weight for all 21 competencies, indicating the strength of emphasis
                when the competency is addressed.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Use Case:</strong> Identify which competencies receive strong emphasis versus light coverage.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Underutilized Competencies (Gaps)</h3>
              <p className="text-gray-700">
                Highlights competencies with coverage below 50%, indicating potential curriculum gaps that
                may need attention.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Action Item:</strong> Review whether low-coverage competencies should be more explicitly addressed.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Coverage vs Weight Scatter Plot</h3>
              <p className="text-gray-700">
                A scatter plot showing the relationship between coverage rate (x-axis) and average weight (y-axis).
                This reveals different patterns of competency integration.
              </p>
              <div className="bg-blue-50 p-3 mt-2 rounded">
                <p className="text-blue-900 font-semibold mb-2">Quadrant Interpretation:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li><strong>High Coverage, High Weight:</strong> Core competencies (well-integrated and emphasized)</li>
                  <li><strong>High Coverage, Low Weight:</strong> Broadly mentioned but lightly emphasized</li>
                  <li><strong>Low Coverage, High Weight:</strong> Specialized competencies (niche but important)</li>
                  <li><strong>Low Coverage, Low Weight:</strong> Potential gaps or optional competencies</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Competency by Department Heatmap</h3>
              <p className="text-gray-700">
                A cross-analysis showing which departments emphasize which competencies. Darker colors indicate
                higher average weights.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Insight:</strong> Reveals disciplinary patterns in competency emphasis and opportunities for cross-departmental learning.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gap Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-[#8B1538]">🔍 Gap Analysis Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Gap analysis identifies competencies that may be underrepresented in the curriculum. A competency
              is flagged as "underutilized" if its coverage rate falls below 50%.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-bold text-yellow-900 mb-2">Why 50% threshold?</h3>
              <p className="text-yellow-800">
                If fewer than half of programs address a competency, it suggests the competency may not be
                receiving adequate attention at the institutional level. This threshold is adjustable based
                on institutional priorities.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-blue-900 mb-2">What to do with gaps?</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Verify if the competency is relevant to all programs or discipline-specific</li>
                <li>Review program learning outcomes to see if the competency is implicitly addressed</li>
                <li>Consider curriculum development initiatives to address genuine gaps</li>
                <li>Update PLO-competency mappings if existing PLOs already address the competency</li>
              </ol>
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
                Shows aggregate competency analytics across all programs. Use this for institutional-level
                curriculum assessment and strategic planning.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">By College</h3>
              <p className="text-gray-700">
                Filters data to show competency usage within a specific college. Useful for college-level
                curriculum review and identifying college-specific strengths.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">By Program</h3>
              <p className="text-gray-700">
                Displays competency analytics for a single program. Ideal for program-level assessment,
                accreditation reporting, and curriculum development.
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
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-900 mb-2">High Coverage + High Weight</h3>
              <p className="text-green-800">
                These are your institution's core competencies. They are widely addressed and strongly emphasized.
                Examples might include C1-1 (Subject-matter mastery) or C3-2 (Effective communication skills).
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-blue-900 mb-2">High Coverage + Low Weight</h3>
              <p className="text-blue-800">
                These competencies are broadly mentioned but may receive light emphasis. Consider whether
                they need stronger integration or if light coverage is appropriate.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-bold text-purple-900 mb-2">Low Coverage + High Weight</h3>
              <p className="text-purple-800">
                These are specialized competencies that are strongly emphasized in specific programs but not
                widely adopted. This pattern is expected for discipline-specific competencies.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-bold text-red-900 mb-2">Low Coverage + Low Weight</h3>
              <p className="text-red-800">
                These competencies may represent curriculum gaps. Investigate whether they should be more
                explicitly addressed or if they are not applicable to most programs.
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
                <strong>Identify Gaps:</strong> Review competencies with coverage below 50% and determine if
                they represent genuine curriculum gaps or discipline-specific competencies.
              </li>
              <li>
                <strong>Analyze Patterns:</strong> Use the scatter plot to understand different patterns of
                competency integration (core, broad, specialized, or gap).
              </li>
              <li>
                <strong>Department Comparison:</strong> Review the heatmap to identify departments with unique
                competency emphases and opportunities for cross-departmental collaboration.
              </li>
              <li>
                <strong>Improve Documentation:</strong> Address competencies with low justification completeness
                by documenting the rationale for PLO-competency mappings.
              </li>
              <li>
                <strong>Strategic Planning:</strong> Use competency analytics to inform curriculum development
                initiatives and resource allocation decisions.
              </li>
              <li>
                <strong>Trend Monitoring:</strong> Export data regularly to track changes in competency coverage
                and emphasis as programs evolve.
              </li>
            </ol>
          </CardContent>
        </Card>

      </div>
      <PageFooter />

    </div>
  );
}
