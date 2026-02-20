import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ProgramDetail() {
  const { id } = useParams();
  const programId = parseInt(id || "0");

  const { data: matrixData } = trpc.mappings.getMatrix.useQuery({ programId });
  
  const program = matrixData?.program;
  const plos = matrixData?.plos || [];
  const competencies = matrixData?.competencies || [];
  const graduateAttributes = matrixData?.graduateAttributes || [];
  const mappings = matrixData?.mappings || [];
  const justifications = matrixData?.justifications || [];
  
  // Group competencies by GA
  const competenciesByGA = graduateAttributes.map(ga => ({
    ga,
    competencies: competencies.filter(c => c.gaId === ga.id)
  }));
  
  // Create a lookup map for weights: ploId_competencyId -> weight
  const weightMap = new Map<string, string>();
  mappings.forEach(m => {
    weightMap.set(`${m.mapping.ploId}_${m.competency.id}`, m.mapping.weight);
  });

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/programs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{program.nameEn}</h1>

        {/* PLOs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Program Learning Outcomes ({plos?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {plos && plos.length > 0 ? (
              <div className="space-y-3">
                {plos.map((plo) => (
                  <div key={plo.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <p className="font-semibold">{plo.code}</p>
                    <p className="text-gray-700">{plo.descriptionEn || plo.descriptionAr}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No PLOs defined for this program</p>
            )}
          </CardContent>
        </Card>

        {/* Mapping Matrix */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>PLO-Competency Mapping Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {plos.length > 0 && competencies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    {/* GA Headers */}
                    <tr className="bg-[#8B4513] text-white">
                      <th className="border border-gray-300 p-2 text-left font-semibold">PLO</th>
                      {competenciesByGA.map(({ ga, competencies: comps }) => (
                        <th
                          key={ga.id}
                          colSpan={comps.length}
                          className="border border-gray-300 p-2 text-center font-semibold"
                        >
                          {ga.code}: {ga.nameEn}
                        </th>
                      ))}
                    </tr>
                    {/* Competency Headers */}
                    <tr className="bg-[#D2B48C]">
                      <th className="border border-gray-300 p-2"></th>
                      {competenciesByGA.map(({ competencies: comps }) =>
                        comps.map(comp => (
                          <th
                            key={comp.id}
                            className="border border-gray-300 p-2 text-center font-medium text-xs"
                          >
                            {comp.code}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {plos.map(plo => (
                      <tr key={plo.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-semibold bg-[#F5DEB3]">
                          {plo.code}
                        </td>
                        {competenciesByGA.map(({ competencies: comps }) =>
                          comps.map(comp => {
                            const weight = weightMap.get(`${plo.id}_${comp.id}`);
                            return (
                              <td
                                key={comp.id}
                                className="border border-gray-300 p-2 text-center"
                              >
                                {weight || "-"}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No mapping data available</p>
            )}
            <p className="text-gray-600 mt-4">
              Total mappings: {mappings.length}
            </p>
          </CardContent>
        </Card>

        {/* Justifications */}
        <Card>
          <CardHeader>
            <CardTitle>Justifications ({justifications?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {justifications && justifications.length > 0 ? (
              <div className="space-y-4">
                {justifications.map((item) => (
                  <div key={item.justification.id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <p className="font-semibold mb-2">{item.competency.code}: {item.competency.nameEn}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {item.justification.textEn || item.justification.textAr}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No justifications defined for this program</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
