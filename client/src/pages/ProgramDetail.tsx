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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit2, Save, X, Download, ChevronDown, Home, Trash2, Plus } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function ProgramDetail() {
  const { id } = useParams();
  const programId = parseInt(id || "0");


  const { data: matrixData, refetch } = trpc.mappings.getMatrix.useQuery({ programId });
  const updatePLO = trpc.plos.update.useMutation();
  const deletePLO = trpc.plos.delete.useMutation();
  const createPLO = trpc.plos.create.useMutation();
  const updateMapping = trpc.mappings.upsert.useMutation();
  const updateJustification = trpc.justifications.upsert.useMutation();
  const exportDocument = trpc.export.generate.useMutation();
  const updateProgram = trpc.programs.update.useMutation();
  
  const { data: allColleges } = trpc.colleges.list.useQuery();
  const { data: allDepartments } = trpc.departments.list.useQuery();
  const { data: allClusters } = trpc.clusters.list.useQuery();
  
  const program = matrixData?.program;
  const plos = matrixData?.plos || [];
  const competencies = matrixData?.competencies || [];
  const graduateAttributes = matrixData?.graduateAttributes || [];
  const mappings = matrixData?.mappings || [];
  const justifications = matrixData?.justifications || [];
  
  // Editing states
  const [editingPLO, setEditingPLO] = useState<number | null>(null);
  const [editingPLOText, setEditingPLOText] = useState("");
  const [deletingPLO, setDeletingPLO] = useState<number | null>(null);
  const [addingPLO, setAddingPLO] = useState(false);
  const [newPLOCode, setNewPLOCode] = useState("");
  const [newPLODescription, setNewPLODescription] = useState("");
  const [editingJustification, setEditingJustification] = useState<number | null>(null);
  const [editingJustificationText, setEditingJustificationText] = useState("");
  
  // Program editing states
  const [editingProgram, setEditingProgram] = useState(false);
  const [editProgramNameEn, setEditProgramNameEn] = useState("");
  const [editProgramNameAr, setEditProgramNameAr] = useState("");
  const [editProgramCode, setEditProgramCode] = useState("");
  const [editLanguage, setEditLanguage] = useState<"en" | "ar" | "both">("en");
  const [editCollegeId, setEditCollegeId] = useState<number | undefined>(undefined);
  const [editClusterId, setEditClusterId] = useState<number | undefined>(undefined);
  const [editDepartmentId, setEditDepartmentId] = useState<number | undefined>(undefined);
  
  // Group competencies by GA
  const competenciesByGA = graduateAttributes.map(ga => ({
    ga,
    competencies: competencies.filter(c => c.gaId === ga.id)
  }));
  
  // Create a lookup map for weights: ploId_competencyId -> weight
  const weightMap = new Map<string, any>();
  mappings.forEach(m => {
    weightMap.set(`${m.mapping.ploId}_${m.competency.id}`, m.mapping.weight);
  });
  
  // Debug logging
  if (mappings.length > 0) {
    console.log('[ProgramDetail] Mappings count:', mappings.length);
    console.log('[ProgramDetail] First mapping:', mappings[0]);
    console.log('[ProgramDetail] WeightMap size:', weightMap.size);
    console.log('[ProgramDetail] First weight sample:', Array.from(weightMap.entries())[0]);
  }

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
                    setEditLanguage(program.language as "en" | "ar" | "both");
                    const currentDept = allDepartments?.find(d => d.id === program.departmentId);
                    setEditCollegeId(currentDept?.collegeId);
                    setEditClusterId(currentDept?.clusterId || undefined);
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
                          language: editLanguage,
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
                    value={editCollegeId || ""}
                    onChange={(e) => {
                      const collegeId = parseInt(e.target.value);
                      setEditCollegeId(collegeId);
                      setEditClusterId(undefined);
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
              {/* Cluster field - only show if college has clusters */}
              {(editingProgram && allClusters?.filter(c => c.collegeId === editCollegeId).length > 0) || (!editingProgram && matrixData?.cluster) ? (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Cluster</p>
                  {editingProgram ? (
                    <select
                      value={editClusterId || ""}
                      onChange={(e) => {
                        setEditClusterId(parseInt(e.target.value));
                        setEditDepartmentId(undefined);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-lg"
                      disabled={!editCollegeId}
                    >
                      <option value="">Select cluster</option>
                      {allClusters?.filter(c => c.collegeId === editCollegeId).map(cluster => (
                        <option key={cluster.id} value={cluster.id}>
                          {cluster.nameEn}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg text-gray-900">{matrixData?.cluster?.nameEn || matrixData?.cluster?.nameAr || 'N/A'}</p>
                  )}
                </div>
              ) : null}
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
                        // Filter by college
                        if (editCollegeId && dept.collegeId !== editCollegeId) return false;
                        // If cluster is selected, filter by cluster
                        if (editClusterId && dept.clusterId !== editClusterId) return false;
                        return true;
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
                {editingProgram ? (
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value as "en" | "ar" | "both")}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-lg"
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="ar">🇶🇦 Arabic</option>
                    <option value="both">🌐 Both</option>
                  </select>
                ) : (
                  <p className="text-lg text-gray-900">
                    {program.language === 'en' ? '🇬🇧 English' : program.language === 'ar' ? '🇶🇦 Arabic' : '🌐 Both'}
                  </p>
                )}
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPLO(plo)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeletingPLO(plo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No PLOs defined for this program</p>
            )}
            
            {/* Add New PLO Form */}
            {addingPLO ? (
              <div className="mt-4 p-4 border-2 border-dashed border-[#8B1538] rounded-lg">
                <h4 className="font-semibold text-[#8B1538] mb-3">Add New PLO</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">PLO Code *</label>
                    <Input
                      value={newPLOCode}
                      onChange={(e) => setNewPLOCode(e.target.value)}
                      placeholder="e.g., PLO7"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description *</label>
                    <Textarea
                      value={newPLODescription}
                      onChange={(e) => setNewPLODescription(e.target.value)}
                      placeholder="Enter PLO description"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!newPLOCode || !newPLODescription) {
                          toast.error("Please fill in all fields");
                          return;
                        }
                        try {
                          const sortOrder = (plos?.length || 0) + 1;
                          await createPLO.mutateAsync({
                            programId,
                            code: newPLOCode,
                            descriptionEn: program?.language === 'ar' ? undefined : newPLODescription,
                            descriptionAr: program?.language === 'en' ? undefined : newPLODescription,
                            sortOrder,
                          });
                          await refetch();
                          toast.success("PLO added successfully");
                          setAddingPLO(false);
                          setNewPLOCode("");
                          setNewPLODescription("");
                        } catch (error) {
                          toast.error("Failed to add PLO");
                        }
                      }}
                      className="bg-[#8B1538] hover:bg-[#6B1028]"
                    >
                      <Save className="mr-1 h-3 w-3" />
                      Save PLO
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAddingPLO(false);
                        setNewPLOCode("");
                        setNewPLODescription("");
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingPLO(true)}
                  className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New PLO
                </Button>
              </div>
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
      
      {/* Delete PLO Confirmation Dialog */}
      <AlertDialog open={deletingPLO !== null} onOpenChange={() => setDeletingPLO(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PLO?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this PLO and all its associated mappings and justifications.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (deletingPLO) {
                  try {
                    await deletePLO.mutateAsync({ id: deletingPLO });
                    await refetch();
                    toast.success("PLO deleted successfully");
                    setDeletingPLO(null);
                  } catch (error) {
                    toast.error("Failed to delete PLO");
                  }
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
