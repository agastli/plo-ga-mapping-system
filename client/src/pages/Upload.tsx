import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload as UploadIcon, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Upload() {
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: departments } = trpc.departments.listByCollege.useQuery(
    { collegeId: parseInt(selectedCollege) },
    { enabled: !!selectedCollege }
  );
  const { data: programs } = trpc.programs.listByDepartment.useQuery(
    { departmentId: parseInt(selectedDepartment) },
    { enabled: !!selectedDepartment }
  );

  const parseMutation = trpc.document.parse.useMutation();
  const importMutation = trpc.document.import.useMutation();

  // Reset dependent selections when parent changes
  useEffect(() => {
    setSelectedDepartment("");
    setSelectedProgram("");
  }, [selectedCollege]);

  useEffect(() => {
    setSelectedProgram("");
  }, [selectedDepartment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsedData(null);
    }
  };

  const handleParse = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!selectedProgram) {
      toast.error("Please select a program first");
      return;
    }

    setParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const fileContent = base64.split(',')[1]; // Remove data:*/*;base64, prefix

        const result = await parseMutation.mutateAsync({
          fileContent,
          fileName: file.name,
        });

        if (result.success && result.data) {
          setParsedData(result.data);
          toast.success("Document parsed successfully!");
        } else {
          toast.error("Failed to parse document");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to parse document");
      console.error(error);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !selectedProgram) {
      toast.error("Please parse a document and select a program");
      return;
    }

    setImporting(true);
    try {
      await importMutation.mutateAsync({
        programId: parseInt(selectedProgram),
        plos: parsedData.plos,
        mappings: parsedData.mappings,
        justifications: parsedData.justifications,
      });

      toast.success("Data imported successfully!");
      setFile(null);
      setParsedData(null);
      setSelectedCollege("");
      setSelectedDepartment("");
      setSelectedProgram("");
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with QU Logo */}
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
            <div className="flex gap-3">
              <Button variant="outline" asChild className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="default" asChild className="bg-[#8B1538] hover:bg-[#6B1028]">
                <Link href="/programs">
                  View Programs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-[#8B1538]">Upload Mapping Document</h1>
        <p className="text-gray-700 mb-8">
          Upload an Excel file (.xlsx) in the standard PLO-GA mapping template format
        </p>

        {/* Step 1: Select College, Department, and Program */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* College Card */}
          <Card className="shadow-md border-[#8B1538]/20 bg-white">
            <CardHeader className="bg-gradient-to-br from-[#8B1538]/5 to-transparent">
              <CardTitle className="text-[#8B1538]">Step 1: College</CardTitle>
              <CardDescription>Select college</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger id="college">
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges?.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Department Card */}
          <Card className="shadow-md border-[#8B1538]/20 bg-white">
            <CardHeader className="bg-gradient-to-br from-[#8B1538]/5 to-transparent">
              <CardTitle className="text-[#8B1538]">Step 2: Department</CardTitle>
              <CardDescription>Select department</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={!selectedCollege}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Program Card */}
          <Card className="shadow-md border-[#8B1538]/20 bg-white">
            <CardHeader className="bg-gradient-to-br from-[#8B1538]/5 to-transparent">
              <CardTitle className="text-[#8B1538]">Step 3: Program</CardTitle>
              <CardDescription>Select program</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProgram} onValueChange={setSelectedProgram} disabled={!selectedDepartment}>
                <SelectTrigger id="program" className="truncate">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs?.map((prog) => (
                    <SelectItem key={prog.id} value={prog.id.toString()} className="max-w-full">
                      <span className="block truncate" title={prog.nameEn}>{prog.nameEn}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Step 4: Upload Document */}
        {selectedProgram && (
          <Card className="mb-6 shadow-md border-[#8B1538]/20 bg-white">
            <CardHeader className="bg-gradient-to-br from-[#8B1538]/5 to-transparent">
              <CardTitle className="text-[#8B1538]">Step 4: Upload Document</CardTitle>
              <CardDescription>Choose an .xlsx file to upload and parse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>

              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleParse} disabled={!file || parsing} className="w-full bg-[#8B1538] hover:bg-[#6B1028]">
                {parsing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Parsing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Parse Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Parsed Data Preview */}
        {parsedData && (
          <>
            <Card className="mb-6 shadow-md border-[#8B1538]/20 bg-white">
              <CardHeader className="bg-gradient-to-br from-[#8B1538]/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-[#8B1538]">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Parsing Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Program</Label>
                    <p className="font-medium">{parsedData.programInfo.programNameEn || "Not found"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Department</Label>
                    <p className="font-medium">{parsedData.programInfo.departmentEn || "Not found"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">College</Label>
                    <p className="font-medium">{parsedData.programInfo.collegeEn || "Not found"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Language</Label>
                    <p className="font-medium">{parsedData.programInfo.language === "ar" ? "Arabic" : "English"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#8B1538]/10">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#8B1538]">{parsedData.plos.length}</p>
                    <p className="text-sm text-gray-600">PLOs Extracted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#8B1538]">{parsedData.mappings.length}</p>
                    <p className="text-sm text-gray-600">Mappings Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#8B1538]">{parsedData.justifications.length}</p>
                    <p className="text-sm text-gray-600">Justifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Import Data */}
            <Card className="shadow-md border-[#8B1538]/20 bg-white">
              <CardHeader className="bg-gradient-to-br from-[#8B1538]/5 to-transparent">
                <CardTitle className="text-[#8B1538]">Step 5: Save to Database</CardTitle>
                <CardDescription>Import the parsed data into the selected program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Importing will add PLOs and mappings to the selected program. Existing data will not be overwritten.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleImport} disabled={importing} className="w-full bg-[#8B1538] hover:bg-[#6B1028]">
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Import Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <div className="container mx-auto px-4 pb-6 mt-20 max-w-6xl">
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
