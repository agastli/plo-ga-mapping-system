import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit2, Save, X, Download, ChevronDown, Home } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function ProgramDetail() {
  const { id } = useParams();
  const programId = parseInt(id || "0");


  const { data: matrixData, refetch } = trpc.mappings.getMatrix.useQuery({ programId });
  const updatePLO = trpc.plos.update.useMutation();
  const updateMapping = trpc.mappings.upsert.useMutation();
  const updateJustification = trpc.justifications.upsert.useMutation();
  const exportDocument = trpc.export.generate.useMutation();
  const updateProgram = trpc.programs.update.useMutation();
  
  const { data: allColleges } = trpc.colleges.list.useQuery();
  const { data: allDepartments } = trpc.departments.list.useQuery();
  
  const program = matrixData?.program;
  const plos = matrixData?.plos || [];
  const competencies = matrixData?.competencies || [];
  const graduateAttributes = matrixData?.graduateAttributes || [];
  const mappings = matrixData?.mappings || [];
  const justifications = matrixData?.justifications || [];
  
  // Editing states
  const [editingPLO, setEditingPLO] = useState<number | null>(null);
  const [editingPLOText, setEditingPLOText] = useState("");
  const [editingJustification, setEditingJustification] = useState<number | null>(null);
  const [editingJustificationText, setEditingJustificationText] = useState("");
  
  // Program editing states
  const [editingProgram, setEditingProgram] = useState(false);
  const [editProgramNameEn, setEditProgramNameEn] = useState("");
  const [editProgramNameAr, setEditProgramNameAr] = useState("");
  const [editProgramCode, setEditProgramCode] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState<number | undefined>(undefined);
  
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

  // Handle PLO edit
  const handleEditPLO = (plo: typeof plos[0]) => {
    setEditingPLO(plo.id);
    setEditingPLOText(plo.descriptionEn || plo.descriptionAr || "");
  };

  const handleSavePLO = async (plo: typeof plos[0]) => {
    try {
      await updatePLO.mutateAsync({
        id: plo.id,
        descriptionEn: program?.language === "en" ? editingPLOText : undefined,
        descriptionAr: program?.language === "ar" ? editingPLOText : undefined,
      });
      await refetch();
      setEditingPLO(null);
      toast.success("PLO updated successfully");
    } catch (error) {
      toast.error("Failed to update PLO");
    }
  };

  // Handle mapping weight edit
  const handleWeightChange = async (ploId: number, competencyId: number, newWeight: string) => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 0 || weight > 1) {
      toast.error("Weight must be between 0 and 1");
      return;
    }
    
    try {
      await updateMapping.mutateAsync({
        ploId,
        competencyId,
        weight: newWeight,
      });
      await refetch();
      toast.success("Mapping updated successfully");
    } catch (error) {
      toast.error("Failed to update mapping");
    }
  };

  // Handle justification edit
  const handleEditJustification = (justification: typeof justifications[0]) => {
    setEditingJustification(justification.justification.id);
    setEditingJustificationText(justification.justification.textEn || justification.justification.textAr || "");
  };

  const handleSaveJustification = async (justification: typeof justifications[0]) => {
    try {
      await updateJustification.mutateAsync({
        programId,
        gaId: justification.justification.gaId,
        competencyId: justification.justification.competencyId,
        textEn: program?.language === "en" ? editingJustificationText : undefined,
        textAr: program?.language === "ar" ? editingJustificationText : undefined,
      });
      await refetch();
      setEditingJustification(null);
      toast.success("Justification updated successfully");
    } catch (error) {
      toast.error("Failed to update justification");
    }
  };

  // Handle export
  const handleExport = async (format: 'word' | 'excel' | 'pdf') => {
    try {
      const result = await exportDocument.mutateAsync({ programId, format });
      // Download the file
      window.open(`/api/download/${encodeURIComponent(result.filePath)}`, '_blank');
      toast.success(`Document exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export document");
    }
  };

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
    <div className="min-h-screen bg-amber-50">
      {/* Header with QU Logo */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/qu-logo.png" alt="Qatar University" className="h-12 w-auto" />
              <div className="border-l-2 border-[#8B1538] pl-4">
                <h2 className="text-lg font-bold text-[#8B1538]">Program Details</h2>
                <p className="text-sm text-slate-600">Academic Planning & Quality Assurance Office</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" asChild className="text-[#8B1538] hover:bg-[#8B1538]/10">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-[#8B1538] hover:bg-[#8B1538]/10">
                <Link href="/programs">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#8B1538] hover:bg-[#6B1028]">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('word')}>
                    📄 Export as Word (.docx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    📊 Export as Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    📃 Export as PDF (.pdf)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Program Information */}
        <Card className="mb-6 border-2 border-[#8B1538]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#8B1538]/10 to-white border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-[#8B1538]">Program Information</CardTitle>
              {!editingProgram ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProgram(true);
                    setEditProgramNameEn(program.nameEn || "");
                    setEditProgramNameAr(program.nameAr || "");
                    setEditProgramCode(program.code || "");
                    setEditDepartmentId(program.departmentId);
                  }}
                  className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProgram(false)}
                    className="border-gray-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await updateProgram.mutateAsync({
                          id: programId,
                          nameEn: editProgramNameEn || undefined,
                          nameAr: editProgramNameAr || undefined,
                          code: editProgramCode || undefined,
                          departmentId: editDepartmentId,
                        });
                        await refetch();
                        setEditingProgram(false);
                        toast.success("Program information updated successfully");
                      } catch (error) {
                        toast.error("Failed to update program information");
                      }
                    }}
                    className="bg-[#8B1538] hover:bg-[#6B1028]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Program Name (English)</p>
                {editingProgram ? (
                  <Input
                    value={editProgramNameEn}
                    onChange={(e) => setEditProgramNameEn(e.target.value)}
                    className="text-lg"
                    placeholder="Enter program name in English"
                  />
                ) : (
                  <p className="text-lg text-gray-900 font-semibold">{program.nameEn || 'N/A'}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Program Name (Arabic)</p>
                {editingProgram ? (
                  <Input
                    value={editProgramNameAr}
                    onChange={(e) => setEditProgramNameAr(e.target.value)}
                    className="text-lg"
                    placeholder="Enter program name in Arabic"
                    dir="rtl"
                  />
                ) : (
                  <p className="text-lg text-gray-900 font-semibold" dir="rtl">{program.nameAr || 'N/A'}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Program Code</p>
                {editingProgram ? (
                  <Input
                    value={editProgramCode}
                    onChange={(e) => setEditProgramCode(e.target.value)}
                    className="text-lg"
                    placeholder="Enter program code"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{program.code}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">College</p>
                {editingProgram ? (
                  <select
                    value={allDepartments?.find(d => d.id === editDepartmentId)?.collegeId || ""}
                    onChange={(e) => {
                      const collegeId = parseInt(e.target.value);
                      // Reset department when college changes
                      setEditDepartmentId(undefined);
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-lg"
                  >
                    <option value="">Select college</option>
                    {allColleges?.map(college => (
                      <option key={college.id} value={college.id}>
                        {college.nameEn}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-lg text-gray-900">{matrixData?.college?.nameEn || matrixData?.college?.nameAr || 'N/A'}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Department</p>
                {editingProgram ? (
                  <select
                    value={editDepartmentId || ""}
                    onChange={(e) => setEditDepartmentId(parseInt(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-lg"
                    disabled={!allDepartments?.find(d => d.id === editDepartmentId)?.collegeId}
                  >
                    <option value="">Select department</option>
                    {allDepartments
                      ?.filter(dept => {
                        const currentCollege = allDepartments.find(d => d.id === editDepartmentId)?.collegeId;
                        return currentCollege ? dept.collegeId === currentCollege : true;
                      })
                      .map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nameEn}
                        </option>
                      ))}
                  </select>
                ) : (
                  <p className="text-lg text-gray-900">{matrixData?.department?.nameEn || matrixData?.department?.nameAr || 'N/A'}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Language</p>
                <p className="text-lg text-gray-900">
                  {program.language === 'en' ? '🇬🇧 English' : program.language === 'ar' ? '🇶🇦 Arabic' : '🌐 Both'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Last Updated</p>
                <p className="text-lg text-gray-900">{new Date(program.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PLOs */}
        <Card className="mb-6 border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#8B1538]/5 to-white border-b">
            <CardTitle className="text-2xl text-[#8B1538] flex items-center gap-2">
              🎯 Program Learning Outcomes ({plos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plos && plos.length > 0 ? (
              <div className="space-y-3">
                {plos.map((plo) => (
                  <div key={plo.id} className="border-l-4 border-[#8B1538] pl-4 py-2 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">{plo.code}</p>
                        {editingPLO === plo.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editingPLOText}
                              onChange={(e) => setEditingPLOText(e.target.value)}
                              className="w-full"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSavePLO(plo)}>
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingPLO(null)}>
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700">{plo.descriptionEn || plo.descriptionAr}</p>
                        )}
                      </div>
                      {editingPLO !== plo.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEditPLO(plo)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No PLOs defined for this program</p>
            )}
          </CardContent>
        </Card>

        {/* Mapping Matrix - Transposed: PLOs as columns, Competencies as rows */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>PLO-Competency Mapping Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {plos.length > 0 && competencies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    {/* Header row: Graduate Attributes + PLO codes */}
                    <tr className="bg-[#8B1538] text-white">
                      <th className="border border-gray-300 p-2 text-left font-semibold w-48">Graduate Attributes</th>
                      <th className="border border-gray-300 p-2 text-left font-semibold w-64">Supporting Competencies</th>
                      {plos.map(plo => (
                        <th
                          key={plo.id}
                          className="border border-gray-300 p-2 text-center font-semibold"
                        >
                          {plo.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {competenciesByGA.map(({ ga, competencies: comps }) => (
                      <>
                        {/* GA Section Row */}
                        <tr key={`ga-${ga.id}`} className="bg-[#C8A882]">
                          <td
                            colSpan={2}
                            className="border border-gray-300 p-2 font-bold text-[#8B1538]"
                          >
                            {ga.code}: {ga.nameEn}
                          </td>
                          {plos.map(plo => (
                            <td key={`ga-${ga.id}-plo-${plo.id}`} className="border border-gray-300 p-2 bg-[#C8A882]"></td>
                          ))}
                        </tr>
                        {/* Competency Rows */}
                        {comps.map(comp => (
                          <tr key={comp.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 bg-gray-50"></td>
                            <td className="border border-gray-300 p-2 text-sm bg-gray-50">
                              {comp.code} – {comp.nameEn || comp.nameAr}
                            </td>
                            {plos.map(plo => {
                              const weight = weightMap.get(`${plo.id}_${comp.id}`);
                              return (
                                <td
                                  key={`${plo.id}-${comp.id}`}
                                  className="border border-gray-300 p-1 text-center"
                                >
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={weight || "0"}
                                    onChange={(e) => handleWeightChange(plo.id, comp.id, e.target.value)}
                                    className="w-16 h-8 text-center text-sm p-1"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </>
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
                  <div key={item.justification.id} className="border-l-4 border-[#8B1538] pl-4 py-2 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold mb-2">{item.competency.code}: {item.competency.nameEn || item.competency.nameAr}</p>
                        {editingJustification === item.justification.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingJustificationText}
                              onChange={(e) => setEditingJustificationText(e.target.value)}
                              className="w-full"
                              rows={4}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveJustification(item)}>
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingJustification(null)}>
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {item.justification.textEn || item.justification.textAr}
                          </p>
                        )}
                      </div>
                      {editingJustification !== item.justification.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEditJustification(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No justifications defined for this program</p>
            )}
          </CardContent>
        </Card>
      </main>

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
