import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ProgramDetail() {
  const { id } = useParams();
  const programId = parseInt(id || "0");

  const { data: program } = trpc.programs.getById.useQuery({ id: programId });
  const { data: plos } = trpc.plos.listByProgram.useQuery({ programId });
  const { data: mappings } = trpc.mappings.listByProgram.useQuery({ programId });
  const { data: justifications } = trpc.justifications.listByProgram.useQuery({ programId });

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

        {/* Mappings Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mappings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Total mappings: {mappings?.length || 0}
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
                    <p className="font-semibold mb-2">{item.ga.nameEn}</p>
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
