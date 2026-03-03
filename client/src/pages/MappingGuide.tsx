import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Target, ListChecks, FlaskConical, PenLine, BarChart2, CheckCircle2, PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageFooter from "@/components/PageFooter";
import Breadcrumb from "@/components/Breadcrumb";

const YOUTUBE_VIDEO_ID = "LxyPgXKbwFw";

export default function MappingGuide() {
  const [, setLocation] = useLocation();
  const [videoOpen, setVideoOpen] = useState(false);

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
            onClick={() => window.history.back()}
            className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
          >
            Back to Program
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8 max-w-5xl">
        <Header />

        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <Breadcrumb
            className="mb-3"
            items={[
              { label: "Programs", href: "/programs" },
              { label: "Mapping Guide" },
            ]}
          />
          <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Program
          </Button>
          <h1 className="text-4xl font-bold text-[#8B1538] mb-2">
            A Practical Guide to Mapping PLOs to Graduate Attributes
          </h1>
          <p className="text-lg text-muted-foreground">
            Step-by-step methodology for mapping Program Learning Outcomes to Qatar University's Graduate Attributes and competencies.
          </p>
        </div>

        {/* Video Card */}
        <Card className="mb-6 border-2 border-[#8B1538]/30">
          <CardHeader className="bg-gradient-to-r from-[#8B1538]/10 to-white border-b">
            <CardTitle className="flex items-center text-[#8B1538]">
              <PlayCircle className="mr-2 h-5 w-5" />
              Video Tutorial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center gap-6">
              {/* YouTube thumbnail */}
              <div
                className="relative cursor-pointer rounded-lg overflow-hidden shadow-md flex-shrink-0"
                style={{ width: 280, height: 158 }}
                onClick={() => setVideoOpen(true)}
                title="Watch the video tutorial"
              >
                <img
                  src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`}
                  alt="Video tutorial thumbnail"
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="bg-[#8B1538] rounded-full p-3 shadow-lg">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#8B1538] mb-2">
                  Mapping PLOs to Graduate Attributes — Practical Walkthrough
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Watch this tutorial for a visual, step-by-step demonstration of the mapping process, including how to assign
                  weighting factors and write defensible justifications using real engineering PLOs as examples.
                </p>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="bg-[#8B1538] text-white px-5 py-2 rounded hover:bg-[#6B1028] transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <PlayCircle className="h-4 w-4" />
                  Watch Video
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Popup Modal */}
        {videoOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setVideoOpen(false)}
          >
            <div
              className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
              style={{ width: "min(860px, 95vw)", aspectRatio: "16/9" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow transition-colors"
                title="Close video"
              >
                <X className="h-5 w-5" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
                title="Mapping PLOs to Graduate Attributes"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Section 1: QU Graduate Attributes Framework */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <Target className="mr-2 h-5 w-5" />
              1. The QU Graduate Attributes Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Qatar University has established five core Graduate Attributes that every graduate is expected to embody.
              These attributes represent the holistic development of a QU student, extending beyond disciplinary knowledge.
              Each attribute is supported by specific, measurable competencies, resulting in a total of <strong>21 competencies</strong>.
              The goal of the mapping exercise is to determine which of a program's PLOs contribute to the development of each competency.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#8B1538] text-white">
                    <th className="px-4 py-2 text-left font-semibold rounded-tl">#</th>
                    <th className="px-4 py-2 text-left font-semibold">Graduate Attribute</th>
                    <th className="px-4 py-2 text-left font-semibold rounded-tr">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["GA1", "Competent", "Possessing the fundamental knowledge and skills of one's discipline."],
                    ["GA2", "Life-long Learner", "Demonstrating the ability and motivation for continuous personal and professional growth."],
                    ["GA3", "Well-Rounded", "Having a broad awareness of cultural, social, and global issues."],
                    ["GA4", "Ethically and Socially Responsible", "Adhering to professional ethics and contributing positively to society."],
                    ["GA5", "Entrepreneurial", "Exhibiting creativity, leadership, and the ability to manage resources effectively."],
                  ].map(([code, name, desc], i) => (
                    <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                      <td className="px-4 py-2 font-semibold text-[#8B1538] border-b border-gray-100">{code}</td>
                      <td className="px-4 py-2 font-medium border-b border-gray-100">{name}</td>
                      <td className="px-4 py-2 text-gray-600 border-b border-gray-100">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: The 21 Competencies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <ListChecks className="mr-2 h-5 w-5" />
              2. Understanding the 21 Competencies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Before mapping can begin, it is essential to have a clear and practical understanding of what each competency means.
              The tables below break down each competency with a definition and a practical engineering example.
            </p>

            {/* GA1 */}
            <div>
              <h3 className="text-base font-bold text-[#8B1538] mb-2">Graduate Attribute 1: Competent</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#8B1538]/10 text-[#8B1538]">
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Code</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Competency</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Definition</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Engineering Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["C1-1", "Subject-matter mastery", "Deep and accurate knowledge of the discipline's core theories, principles, and methods.", "Applying principles of thermodynamics and fluid mechanics to design a heat exchanger."],
                      ["C1-2", "Critical-thinking skills", "The ability to analyze information objectively, evaluate evidence, and form reasoned judgments.", "Interpreting experimental data to determine the feasibility of a new chemical reaction."],
                      ["C1-3", "Problem-solving skills", "The systematic process of identifying a problem, generating potential solutions, and implementing the most effective one.", "Diagnosing a structural failure in a bridge and proposing a detailed remediation design."],
                      ["C1-4", "Research and adaptive thinking", "The ability to find, evaluate, and apply new knowledge, and to think creatively beyond established methods.", "Using literature review and simulation tools to optimize a novel circuit design for lower power consumption."],
                    ].map(([code, name, def, ex], i) => (
                      <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                        <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100">{code}</td>
                        <td className="px-3 py-2 font-medium border border-gray-100">{name}</td>
                        <td className="px-3 py-2 text-gray-600 border border-gray-100">{def}</td>
                        <td className="px-3 py-2 text-gray-500 italic border border-gray-100">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GA2 */}
            <div>
              <h3 className="text-base font-bold text-[#8B1538] mb-2">Graduate Attribute 2: Life-long Learner</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#8B1538]/10 text-[#8B1538]">
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Code</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Competency</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Definition</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Engineering Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["C2-1", "Self-awareness", "Understanding one's own strengths, limitations, values, and their impact on others.", "An engineer reflecting on gaps in their project management skills after a project delay and seeking relevant training."],
                      ["C2-2", "Adaptability", "The ability to adjust effectively to new conditions, tools, requirements, or changing environments.", "Switching from a traditional waterfall design approach to an agile methodology when project requirements become dynamic."],
                      ["C2-3", "Adaptive thinking", "Generating new ideas, frameworks, or approaches when standard methods are insufficient to solve a problem.", "Devising an unconventional sensor placement strategy for a monitoring system when standard configurations fail."],
                      ["C2-4", "Desire for life-long learning", "The intrinsic motivation to continuously update knowledge and skills throughout one's career.", "Proactively pursuing professional certifications (e.g., PMP, LEED) and reading current research journals after graduation."],
                    ].map(([code, name, def, ex], i) => (
                      <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                        <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100">{code}</td>
                        <td className="px-3 py-2 font-medium border border-gray-100">{name}</td>
                        <td className="px-3 py-2 text-gray-600 border border-gray-100">{def}</td>
                        <td className="px-3 py-2 text-gray-500 italic border border-gray-100">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GA3 */}
            <div>
              <h3 className="text-base font-bold text-[#8B1538] mb-2">Graduate Attribute 3: Well-Rounded</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#8B1538]/10 text-[#8B1538]">
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Code</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Competency</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Definition</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Engineering Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["C3-1", "Cultured", "A broad awareness of history, arts, and diverse human experiences, and an appreciation of cultural differences.", "Understanding how local cultural norms influence the design of public infrastructure in different countries."],
                      ["C3-2", "Effective communication", "The ability to convey technical and non-technical information clearly and persuasively in writing, speech, and visuals.", "Writing a technical project report for a supervisor and presenting key findings to a non-specialist client."],
                      ["C3-3", "Awareness of local and international issues", "Understanding the social, environmental, economic, and geopolitical challenges at both local and global scales.", "Recognizing how national water scarcity challenges in Qatar directly shape the design constraints for new desalination systems."],
                    ].map(([code, name, def, ex], i) => (
                      <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                        <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100">{code}</td>
                        <td className="px-3 py-2 font-medium border border-gray-100">{name}</td>
                        <td className="px-3 py-2 text-gray-600 border border-gray-100">{def}</td>
                        <td className="px-3 py-2 text-gray-500 italic border border-gray-100">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GA4 */}
            <div>
              <h3 className="text-base font-bold text-[#8B1538] mb-2">Graduate Attribute 4: Ethically and Socially Responsible</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#8B1538]/10 text-[#8B1538]">
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Code</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Competency</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Definition</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Engineering Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["C4-1", "Arabic-Islamic identity", "Embodying the values, ethics, and cultural heritage of the Arab-Islamic civilization.", "Integrating principles of sustainability and resource preservation found in Islamic environmental ethics into engineering practice."],
                      ["C4-2", "Embrace diversity", "Respecting and valuing differences in culture, background, gender, and perspective within a professional environment.", "Working effectively and inclusively in a multicultural engineering team with members from five different countries."],
                      ["C4-3", "Professional and ethical conduct", "Adherence to professional codes of ethics and demonstrating honesty and responsibility in all professional contexts.", "Refusing to approve or falsify safety test results for a product despite commercial pressure from a client."],
                      ["C4-4", "Civically engaged", "Active participation in the betterment of one's community through professional or voluntary contributions.", "Volunteering professional engineering expertise to design accessible public facilities for people with disabilities."],
                      ["C4-5", "Community and global engagement", "Contributing to the well-being of local communities and participating in global professional networks.", "Joining an international engineering society (e.g., IEEE) and contributing to a local sustainability initiative in Qatar."],
                    ].map(([code, name, def, ex], i) => (
                      <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                        <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100">{code}</td>
                        <td className="px-3 py-2 font-medium border border-gray-100">{name}</td>
                        <td className="px-3 py-2 text-gray-600 border border-gray-100">{def}</td>
                        <td className="px-3 py-2 text-gray-500 italic border border-gray-100">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GA5 */}
            <div>
              <h3 className="text-base font-bold text-[#8B1538] mb-2">Graduate Attribute 5: Entrepreneurial</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#8B1538]/10 text-[#8B1538]">
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Code</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Competency</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Definition</th>
                      <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Engineering Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["C5-1", "Creativity and innovation", "Generating original ideas and novel solutions that add value or solve problems in new ways.", "Designing a smart energy management system using IoT sensors and machine learning to reduce a building's energy consumption."],
                      ["C5-2", "Collaborative", "Working productively with others toward a shared goal, respecting the contributions and expertise of all team members.", "Co-designing a complex water treatment plant as part of a multidisciplinary project team including chemists and environmental scientists."],
                      ["C5-3", "Management", "The ability to plan, organize, and coordinate resources (time, budget, personnel) and tasks to achieve objectives efficiently.", "Successfully managing the timeline, budget, and deliverables of a semester-long capstone engineering project."],
                      ["C5-4", "Interpersonal", "Building and maintaining positive and effective professional relationships, demonstrating empathy and emotional intelligence.", "Mediating a technical disagreement between two team members during a high-pressure project deadline."],
                      ["C5-5", "Leadership", "Inspiring and guiding others toward a shared vision, taking initiative, and accepting responsibility for outcomes.", "Leading a student engineering team to win a national design competition by motivating members and coordinating their efforts."],
                    ].map(([code, name, def, ex], i) => (
                      <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                        <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100">{code}</td>
                        <td className="px-3 py-2 font-medium border border-gray-100">{name}</td>
                        <td className="px-3 py-2 text-gray-600 border border-gray-100">{def}</td>
                        <td className="px-3 py-2 text-gray-500 italic border border-gray-100">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: 4-Step Mapping Methodology */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <ListChecks className="mr-2 h-5 w-5" />
              3. The 4-Step Mapping Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-gray-700 leading-relaxed">
              To ensure your mapping is accurate, consistent, and defensible, follow this four-step process for each of the 21 competencies.
            </p>
            {[
              {
                step: "Step 1: Understand the Competency",
                body: "Before attempting to map, refer back to the tables above. You must have a clear, practical understanding of the competency's meaning.",
              },
              {
                step: "Step 2: Identify Explicit Links in PLOs",
                body: 'Read through your program\'s entire list of PLOs. For the competency you are mapping, ask: "Does this PLO explicitly address this competency?" The connection must be direct and obvious from the text of the PLO. Do not infer weak or indirect connections.',
              },
              {
                step: "Step 3: Assign Weights",
                body: "The weight reflects how strongly and directly a PLO contributes to a competency. The sum of all weights for a single competency must equal exactly 0 or 1. No other sums are permitted.",
                extra: (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#8B1538]/10 text-[#8B1538]">
                          <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">Weight</th>
                          <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]/20">When to Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["1.0", "A single PLO fully and comprehensively addresses the competency on its own."],
                          ["0.5 / 0.5", "Two PLOs each contribute a distinct and roughly equal dimension to the competency."],
                          ["0.7 / 0.3 (or similar)", "Two or more PLOs contribute, but one is clearly the primary driver. Weights must reflect relative contribution."],
                          ["0 (unmapped)", "No PLO in your program explicitly addresses the competency. This is a finding that signals a potential curriculum gap."],
                        ].map(([w, desc], i) => (
                          <tr key={w} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                            <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100 whitespace-nowrap">{w}</td>
                            <td className="px-3 py-2 text-gray-600 border border-gray-100">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                step: "Step 4: Write a Defensible Justification",
                body: "This is the most critical step. Your justification must explain how the selected PLO(s) develop the competency, quoting the specific language from the PLO text as evidence. A vague justification is not acceptable.",
              },
            ].map(({ step, body, extra }) => (
              <div key={step} className="border-l-4 border-[#8B1538] pl-4">
                <h3 className="text-base font-bold text-[#8B1538] mb-1">{step}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{body}</p>
                {extra}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 4: Case Study */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <FlaskConical className="mr-2 h-5 w-5" />
              4. Practical Application: Engineering Case Study
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The seven ABET-accredited engineering programs at Qatar University share the same seven PLOs (ABET Student Outcomes).
              This provides a consistent case study for mapping.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#8B1538] text-white">
                    <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]">#</th>
                    <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]">PLO Title</th>
                    <th className="px-3 py-2 text-left font-semibold border border-[#8B1538]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["PLO1", "Problem Solving", "Identify, formulate, and solve complex engineering problems."],
                    ["PLO2", "Design", "Apply engineering design to produce solutions that meet specified needs."],
                    ["PLO3", "Communication", "Communicate effectively with a range of audiences."],
                    ["PLO4", "Ethics & Responsibility", "Recognize ethical/professional responsibilities and make informed judgments."],
                    ["PLO5", "Teamwork", "Function effectively on a team to provide leadership and meet objectives."],
                    ["PLO6", "Experimentation", "Develop and conduct experiments, analyze data, and draw conclusions."],
                    ["PLO7", "Life-long Learning", "Acquire and apply new knowledge as needed."],
                  ].map(([code, name, desc], i) => (
                    <tr key={code} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}>
                      <td className="px-3 py-2 font-semibold text-[#8B1538] border border-gray-100">{code}</td>
                      <td className="px-3 py-2 font-medium border border-gray-100">{name}</td>
                      <td className="px-3 py-2 text-gray-600 border border-gray-100">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-[#8B1538]">Key mapping examples from this case study:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>C1-1 (Subject Mastery)</strong> — split 0.5 to PLO1 and 0.5 to PLO2, as both are required to demonstrate mastery.</li>
                <li><strong>C1-2 (Critical Thinking)</strong> — maps 1.0 to PLO6 (Experimentation), as data analysis and drawing conclusions are the core of critical thinking in engineering.</li>
                <li><strong>C3-3 (Awareness of Issues)</strong> — split 0.5 to PLO2 (Design) and 0.5 to PLO4 (Responsibility).</li>
                <li><strong>Unmapped competencies</strong> — Self-awareness, Adaptive thinking, Arabic-Islamic identity, and Interpersonal skills are unmapped (sum = 0), as they are not explicitly addressed by the ABET outcomes. This is a curriculum finding, not an error.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Writing Justifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <PenLine className="mr-2 h-5 w-5" />
              5. Writing Defensible Justifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              A strong justification is the difference between a credible mapping and a questionable one.
              It provides the evidence and reasoning behind your weighting decisions.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-bold text-red-700 mb-2">Poor Justification</p>
                <p className="text-sm text-gray-700 italic">
                  "This competency is aligned with the PLO based on direct evidence."
                </p>
                <p className="text-xs text-red-600 mt-2">This is a conclusion, not a justification. It provides no evidence.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-bold text-green-700 mb-2">Good Justification</p>
                <p className="text-sm text-gray-700 italic">
                  "The competency is mapped to PLO6, which requires students to 'analyze and interpret data, and use engineering judgment to draw conclusions.' This process of data analysis and evidence-based judgment is the clearest and most direct expression of critical thinking skills in a professional engineering context."
                </p>
                <p className="text-xs text-green-600 mt-2">Quotes the PLO and explains the logical connection.</p>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#8B1538] mb-2">Example: Justifying a Split Weight</h3>
              <p className="text-sm text-gray-600 mb-2">For <strong>C3-3 (Awareness of Issues)</strong>, mapped to PLO2 (0.5) and PLO4 (0.5):</p>
              <blockquote className="border-l-4 border-[#8B1538] pl-4 text-sm text-gray-700 italic bg-amber-50 py-3 pr-3 rounded-r-lg">
                "The competency is developed through two PLOs. First, PLO2 requires that design solutions consider 'public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors.' Second, PLO4 requires students to make informed judgments that consider the 'impact of engineering solutions in global, economic, environmental, and societal contexts.' Because both PLOs explicitly address awareness of broad societal and global issues from distinct but equally important perspectives (design and ethics), the competency is split equally between them."
              </blockquote>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Impact on Assessment Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <BarChart2 className="mr-2 h-5 w-5" />
              6. How Mapping Impacts Assessment Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              The weights you assign are not merely descriptive; they are mathematical coefficients used to calculate student achievement scores for each competency.
            </p>
            <div className="bg-[#8B1538]/5 border border-[#8B1538]/20 rounded-lg p-4 text-center">
              <p className="text-base font-bold text-[#8B1538]">Competency Score = Σ (PLO Score × Mapping Weight)</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-[#8B1538] mb-1">Scenario A — Single Mapping (Weight = 1.0)</p>
                <p className="text-gray-600">If C1-2 (Critical Thinking) maps 1.0 to PLO6, and a student scores 75% on PLO6, their competency score is <strong>75%</strong>.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-[#8B1538] mb-1">Scenario B — Split Mapping (0.5 / 0.5)</p>
                <p className="text-gray-600">If C1-1 maps 0.5 to PLO1 and 0.5 to PLO2, and a student scores 80% on PLO1 and 90% on PLO2, their score is (80% × 0.5) + (90% × 0.5) = <strong>85%</strong>.</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
              <strong className="text-[#8B1538]">Why Accuracy Matters:</strong> If you map a competency to a PLO that does not actually assess it, the resulting competency score will be calculated from irrelevant data, producing misleading evidence about student achievement. This compromises the integrity of accreditation reports and program improvement efforts.
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-[#8B1538]">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Conclusion: 5 Key Principles for Accurate Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                ["Understand Before You Map", "Study the competency definitions thoroughly before assigning any weights."],
                ["Map Only What is Explicit", "Do not infer weak or indirect connections. The link must be direct and obvious from the PLO text."],
                ["Ensure Weights are Deliberate and Justifiable", "Weights must reflect the actual contribution of each PLO and sum to exactly 0 or 1."],
                ["Treat Unmapped Competencies as Findings", "A zero-sum row is valuable information about your curriculum, not a failure in mapping."],
                ["Write Specific, PLO-Referenced Justifications", "Your justification is the evidence that makes your mapping credible and defensible."],
              ].map(([title, desc], i) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8B1538] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#8B1538]">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              For questions about the mapping process or assistance with interpreting the competency definitions, please contact the
              Academic Planning &amp; Quality Assurance Office at Qatar University. You can also re-watch the video tutorial above for a
              visual walkthrough of the complete mapping workflow.
            </p>
          </CardContent>
        </Card>

      </div>
      <div className="container mx-auto max-w-5xl px-4">
        <PageFooter />
      </div>
    </div>
  );
}
