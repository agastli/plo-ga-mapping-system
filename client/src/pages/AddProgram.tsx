import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type PLOInput = {
  tempId: string;
  code: string;
  descriptionEn: string;
  descriptionAr: string;
  sortOrder: number;
};

type MappingInput = {
  ploTempId: string;
  competencyId: number;
  weight: string;
};

type JustificationInput = {
  ploTempId: string;
  competencyId: number;
  textEn: string;
  textAr: string;
};

export default function AddProgram() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Program Information
  const [programNameEn, setProgramNameEn] = useState("");
  const [programNameAr, setProgramNameAr] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [language, setLanguage] = useState<"en" | "ar" | "both">("en");
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>(undefined);
  const [selectedClusterId, setSelectedClusterId] = useState<number | undefined>(undefined);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  
  // Step 2: PLOs
  const [plos, setPlos] = useState<PLOInput[]>([]);
  
  // Step 3: Mappings
  const [mappings, setMappings] = useState<MappingInput[]>([]);
  
  // Step 4: Justifications
  const [justifications, setJustifications] = useState<JustificationInput[]>([]);
  
  // Queries
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: clusters } = trpc.clusters.listByCollege.useQuery(
    { collegeId: selectedCollegeId! },
    { enabled: !!selectedCollegeId }
  );
  const { data: departments } = trpc.departments.list.useQuery();
  const { data: graduateAttributes } = trpc.graduateAttributes.list.useQuery();
  const { data: competencies } = trpc.competencies.list.useQuery();
  
  // Mutations
  const createProgram = trpc.programs.create.useMutation();
  const createPLO = trpc.plos.create.useMutation();
  const upsertMapping = trpc.mappings.upsert.useMutation();
  const upsertJustification = trpc.justifications.upsert.useMutation();
  
  // Filter departments by selected college and cluster
  const filteredDepartments = departments?.filter(d => {
    if (!selectedCollegeId) return false;
    if (d.collegeId !== selectedCollegeId) return false;
    // If college has clusters and one is selected, filter by cluster
    if (clusters && clusters.length > 0 && selectedClusterId) {
      return d.clusterId === selectedClusterId;
    }
    // If college has no clusters, show all departments
    return true;
  }) || [];
  
  // Group competencies by GA
  const competenciesByGA = graduateAttributes?.map(ga => ({
    ga,
    competencies: competencies?.filter(c => c.gaId === ga.id) || []
  })) || [];
  
  // Add new PLO
  const addPLO = () => {
    const tempId = `temp-${Date.now()}`;
    setPlos([...plos, {
      tempId,
      code: `PLO-${plos.length + 1}`,
      descriptionEn: "",
      descriptionAr: "",
      sortOrder: plos.length + 1,
    }]);
  };
  
  // Remove PLO
  const removePLO = (tempId: string) => {
    setPlos(plos.filter(p => p.tempId !== tempId));
    // Also remove related mappings and justifications
    setMappings(mappings.filter(m => m.ploTempId !== tempId));
    setJustifications(justifications.filter(j => j.ploTempId !== tempId));
  };
  
  // Update PLO
  const updatePLO = (tempId: string, field: keyof PLOInput, value: string | number) => {
    setPlos(plos.map(p => p.tempId === tempId ? { ...p, [field]: value } : p));
  };
  
  // Get or create mapping
  const getMapping = (ploTempId: string, competencyId: number): string => {
    const mapping = mappings.find(m => m.ploTempId === ploTempId && m.competencyId === competencyId);
    return mapping?.weight || "";
  };
  
  // Update mapping
  const updateMapping = (ploTempId: string, competencyId: number, weight: string) => {
    const existing = mappings.find(m => m.ploTempId === ploTempId && m.competencyId === competencyId);
    if (existing) {
      setMappings(mappings.map(m => 
        m.ploTempId === ploTempId && m.competencyId === competencyId 
          ? { ...m, weight } 
          : m
      ));
    } else {
      setMappings([...mappings, { ploTempId, competencyId, weight }]);
    }
  };
  
  // Get or create justification
  const getJustification = (ploTempId: string, competencyId: number): { textEn: string; textAr: string } => {
    const just = justifications.find(j => j.ploTempId === ploTempId && j.competencyId === competencyId);
    return { textEn: just?.textEn || "", textAr: just?.textAr || "" };
  };
  
  // Update justification
  const updateJustification = (ploTempId: string, competencyId: number, field: "textEn" | "textAr", value: string) => {
    const existing = justifications.find(j => j.ploTempId === ploTempId && j.competencyId === competencyId);
    if (existing) {
      setJustifications(justifications.map(j => 
        j.ploTempId === ploTempId && j.competencyId === competencyId 
          ? { ...j, [field]: value } 
          : j
      ));
    } else {
      setJustifications([...justifications, { 
        ploTempId, 
        competencyId, 
        textEn: field === "textEn" ? value : "",
        textAr: field === "textAr" ? value : "",
      }]);
    }
  };
  
  // Validation
  const validateStep1 = () => {
    if (!programNameEn.trim() && !programNameAr.trim()) {
      toast.error("Please enter program name in at least one language");
      return false;
    }
    if (!programCode.trim()) {
      toast.error("Please enter program code");
      return false;
    }
    if (!selectedDepartmentId) {
      toast.error("Please select a department");
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    // Step 2 is optional - only validate if PLOs exist
    if (plos.length === 0) {
      return true; // Allow empty PLOs
    }
    for (const plo of plos) {
      if (!plo.descriptionEn.trim() && !plo.descriptionAr.trim()) {
        toast.error(`PLO ${plo.code} must have a description in at least one language`);
        return false;
      }
    }
    return true;
  };
  
  const validateStep3 = () => {
    // Step 3 is optional - only validate if mappings exist
    const nonEmptyMappings = mappings.filter(m => m.weight.trim() !== "");
    if (nonEmptyMappings.length === 0) {
      return true; // Allow empty mappings
    }
    for (const mapping of nonEmptyMappings) {
      const weight = parseFloat(mapping.weight);
      if (isNaN(weight) || weight < 0 || weight > 1) {
        toast.error("All weights must be between 0 and 1");
        return false;
      }
    }
    return true;
  };
  
  // Navigation
  const goToNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(currentStep + 1);
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Submit
  const handleSubmit = async () => {
    if (!validateStep1()) {
      toast.error("Please complete all required fields in Program Information");
      return;
    }
    
    // Validate optional steps only if they have data
    if (plos.length > 0 && !validateStep2()) {
      return;
    }
    if (mappings.length > 0 && !validateStep3()) {
      return;
    }
    
    try {
      toast.info("Creating program...");
      
      // 1. Create program
      const programResult = await createProgram.mutateAsync({
        departmentId: selectedDepartmentId!,
        nameEn: programNameEn.trim() || undefined,
        nameAr: programNameAr.trim() || undefined,
        code: programCode.trim(),
        language,
      });
      
      const programId = programResult.id;
      
      // 2. Create PLOs and build mapping from tempId to real ID
      const ploIdMap = new Map<string, number>();
      for (const plo of plos) {
        const ploResult = await createPLO.mutateAsync({
          programId,
          code: plo.code,
          descriptionEn: plo.descriptionEn.trim() || undefined,
          descriptionAr: plo.descriptionAr.trim() || undefined,
          sortOrder: plo.sortOrder,
        });
        ploIdMap.set(plo.tempId, ploResult.id);
      }
      
      // 3. Create mappings (only non-empty weights)
      const nonEmptyMappings = mappings.filter(m => m.weight.trim() !== "");
      for (const mapping of nonEmptyMappings) {
        const ploId = ploIdMap.get(mapping.ploTempId);
        if (ploId) {
          await upsertMapping.mutateAsync({
            ploId,
            competencyId: mapping.competencyId,
            weight: mapping.weight,
          });
        }
      }
      
      // 4. Create justifications (only non-empty)
      const nonEmptyJustifications = justifications.filter(j => 
        j.textEn.trim() !== "" || j.textAr.trim() !== ""
      );
      for (const just of nonEmptyJustifications) {
        const ploId = ploIdMap.get(just.ploTempId);
        if (ploId) {
          await upsertJustification.mutateAsync({
            ploId,
            competencyId: just.competencyId,
            textEn: just.textEn.trim() || undefined,
            textAr: just.textAr.trim() || undefined,
          });
        }
      }
      
      toast.success("Program created successfully!");
      setLocation(`/programs/${programId}`);
    } catch (error) {
      console.error("Error creating program:", error);
      toast.error("Failed to create program. Please try again.");
    }
  };
  
  const steps = [
    { number: 1, title: "Program Info" },
    { number: 2, title: "PLOs" },
    { number: 3, title: "Mappings" },
    { number: 4, title: "Justifications" },
  ];
  
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src="/qu-logo.png" alt="Qatar University" className="h-12 w-auto" />
                <div className="border-l-2 border-[#8B1538] pl-4">
                  <h2 className="text-lg font-bold text-[#8B1538]">Add New Program</h2>
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
                    Back to Programs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step.number
                        ? "bg-[#8B1538] text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="text-sm mt-2 font-medium text-gray-700">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 ${
                      currentStep > step.number ? "bg-[#8B1538]" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <Card className="border-2 border-[#8B1538]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#8B1538]/10 to-white border-b">
            <CardTitle className="text-2xl text-[#8B1538]">
              {currentStep === 1 && "Step 1: Program Information"}
              {currentStep === 2 && "Step 2: Program Learning Outcomes"}
              {currentStep === 3 && "Step 3: Competency Mappings"}
              {currentStep === 4 && "Step 4: Justifications"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Step 1: Program Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="programNameEn" className="text-base font-semibold">
                      Program Name (English) *
                    </Label>
                    <Input
                      id="programNameEn"
                      value={programNameEn}
                      onChange={(e) => setProgramNameEn(e.target.value)}
                      placeholder="Enter program name in English"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="programNameAr" className="text-base font-semibold">
                      Program Name (Arabic)
                    </Label>
                    <Input
                      id="programNameAr"
                      value={programNameAr}
                      onChange={(e) => setProgramNameAr(e.target.value)}
                      placeholder="أدخل اسم البرنامج بالعربية"
                      className="mt-2"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="programCode" className="text-base font-semibold">
                      Program Code *
                    </Label>
                    <Input
                      id="programCode"
                      value={programCode}
                      onChange={(e) => setProgramCode(e.target.value)}
                      placeholder="e.g., CS-BSC"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language" className="text-base font-semibold">
                      Language *
                    </Label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "en" | "ar" | "both")}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-2"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="college" className="text-base font-semibold">
                      College *
                    </Label>
                    <select
                      id="college"
                      value={selectedCollegeId || ""}
                      onChange={(e) => {
                        setSelectedCollegeId(parseInt(e.target.value));
                        setSelectedClusterId(undefined);
                        setSelectedDepartmentId(undefined);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-2"
                    >
                      <option value="">Select college</option>
                      {colleges?.map(college => (
                        <option key={college.id} value={college.id}>
                          {college.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  {clusters && clusters.length > 0 && (
                    <div>
                      <Label htmlFor="cluster" className="text-base font-semibold">
                        Cluster *
                      </Label>
                      <select
                        id="cluster"
                        value={selectedClusterId || ""}
                        onChange={(e) => {
                          setSelectedClusterId(parseInt(e.target.value));
                          setSelectedDepartmentId(undefined);
                        }}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background mt-2"
                        disabled={!selectedCollegeId}
                      >
                        <option value="">Select cluster</option>
                        {clusters.map(cluster => (
                          <option key={cluster.id} value={cluster.id}>
                            {cluster.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                {(clusters && clusters.length > 0 ? selectedClusterId : selectedCollegeId) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="department" className="text-base font-semibold">
                        Department *
                      </Label>
                    <select
                      id="department"
                      value={selectedDepartmentId || ""}
                      onChange={(e) => setSelectedDepartmentId(parseInt(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background mt-2"
                      disabled={!selectedCollegeId}
                    >
                      <option value="">Select department</option>
                      {filteredDepartments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Step 2: PLOs */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">Add Program Learning Outcomes for this program</p>
                  <Button
                    onClick={addPLO}
                    className="bg-[#8B1538] hover:bg-[#6B1028]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add PLO
                  </Button>
                </div>
                
                {plos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No PLOs added yet. Click "Add PLO" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plos.map((plo, index) => (
                      <Card key={plo.tempId} className="border-2 border-gray-200">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-[#8B1538]">PLO #{index + 1}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePLO(plo.tempId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <Label>PLO Code</Label>
                              <Input
                                value={plo.code}
                                onChange={(e) => updatePLO(plo.tempId, "code", e.target.value)}
                                placeholder="e.g., PLO-1"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Description (English) *</Label>
                              <Textarea
                                value={plo.descriptionEn}
                                onChange={(e) => updatePLO(plo.tempId, "descriptionEn", e.target.value)}
                                placeholder="Enter PLO description in English"
                                className="mt-1"
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label>Description (Arabic)</Label>
                              <Textarea
                                value={plo.descriptionAr}
                                onChange={(e) => updatePLO(plo.tempId, "descriptionAr", e.target.value)}
                                placeholder="أدخل وصف PLO بالعربية"
                                className="mt-1"
                                rows={3}
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Step 3: Mappings */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Enter weights (0-1) for each PLO-Competency mapping. Leave blank for no mapping.
                </p>
                
                {plos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Please add PLOs in Step 2 first.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#8B1538]/10">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                            PLO
                          </th>
                          {competenciesByGA.map(({ ga, competencies: comps }) => (
                            comps.map(comp => (
                              <th
                                key={comp.id}
                                className="border border-gray-300 px-2 py-2 text-center font-semibold text-sm"
                                title={comp.descriptionEn || comp.descriptionAr || ""}
                              >
                                {comp.code}
                              </th>
                            ))
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {plos.map(plo => (
                          <tr key={plo.tempId}>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {plo.code}
                            </td>
                            {competenciesByGA.map(({ ga, competencies: comps }) => (
                              comps.map(comp => (
                                <td key={comp.id} className="border border-gray-300 px-2 py-2">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={getMapping(plo.tempId, comp.id)}
                                    onChange={(e) => updateMapping(plo.tempId, comp.id, e.target.value)}
                                    className="w-20 text-center"
                                    placeholder="0-1"
                                  />
                                </td>
                              ))
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Step 4: Justifications */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <p className="text-gray-600 mb-4">
                  Provide justifications for each PLO-Competency mapping (optional but recommended).
                </p>
                
                {plos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Please add PLOs in Step 2 first.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {plos.map(plo => {
                      // Get all non-empty mappings for this PLO
                      const ploMappings = mappings.filter(
                        m => m.ploTempId === plo.tempId && m.weight.trim() !== ""
                      );
                      
                      if (ploMappings.length === 0) return null;
                      
                      return (
                        <Card key={plo.tempId} className="border-2 border-gray-200">
                          <CardHeader className="bg-gray-50">
                            <CardTitle className="text-lg text-[#8B1538]">
                              {plo.code}: {plo.descriptionEn || plo.descriptionAr}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-6">
                            {ploMappings.map(mapping => {
                              const comp = competencies?.find(c => c.id === mapping.competencyId);
                              if (!comp) return null;
                              
                              const just = getJustification(plo.tempId, comp.id);
                              
                              return (
                                <div key={comp.id} className="border-l-4 border-[#8B1538] pl-4">
                                  <h4 className="font-semibold text-gray-700 mb-3">
                                    {comp.code}: {comp.descriptionEn || comp.descriptionAr}
                                    <span className="ml-2 text-sm text-gray-500">(Weight: {mapping.weight})</span>
                                  </h4>
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-sm">Justification (English)</Label>
                                      <Textarea
                                        value={just.textEn}
                                        onChange={(e) => updateJustification(plo.tempId, comp.id, "textEn", e.target.value)}
                                        placeholder="Enter justification in English"
                                        className="mt-1"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Justification (Arabic)</Label>
                                      <Textarea
                                        value={just.textAr}
                                        onChange={(e) => updateJustification(plo.tempId, comp.id, "textAr", e.target.value)}
                                        placeholder="أدخل المبرر بالعربية"
                                        className="mt-1"
                                        rows={2}
                                        dir="rtl"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="border-[#8B1538] text-[#8B1538]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-3">
            {currentStep === 1 && (
              <Button
                onClick={handleSubmit}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Save className="mr-2 h-4 w-4" />
                Create Program (Skip Details)
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button
                onClick={goToNextStep}
                className="bg-[#8B1538] hover:bg-[#6B1028]"
              >
                {currentStep === 1 ? "Add PLOs (Optional)" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Create Program
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
