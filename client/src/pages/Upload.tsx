import { useState } from "react";
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
  const [file, setFile] = useState<File | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const { data: programs } = trpc.programs.list.useQuery();
  const parseMutation = trpc.document.parse.useMutation();
  const importMutation = trpc.document.import.useMutation();

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

        if (result.success) {
          setParsedData(result.data);
          toast.success("Document parsed successfully!");
        } else {
          toast.error(result.error || "Failed to parse document");
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
      setSelectedProgram("");
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Upload Mapping Document</h1>
        <p className="text-gray-600 mb-8">
          Upload a Word document (.docx) in the standard PLO-GA mapping template format
        </p>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 1: Select Document</CardTitle>
            <CardDescription>Choose a .docx file to upload and parse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                accept=".docx"
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

            <Button onClick={handleParse} disabled={!file || parsing} className="w-full">
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

        {/* Parsed Data Preview */}
        {parsedData && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600">{parsedData.plos.length}</p>
                    <p className="text-sm text-gray-600">PLOs Extracted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{parsedData.mappings.length}</p>
                    <p className="text-sm text-gray-600">Mappings Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{parsedData.justifications.length}</p>
                    <p className="text-sm text-gray-600">Justifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select Target Program</CardTitle>
                <CardDescription>Choose which program to import this data into</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="program">Program</Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger id="program" className="mt-2">
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.map((item) => (
                        <SelectItem key={item.program.id} value={item.program.id.toString()}>
                          {item.program.nameEn} - {item.department.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Importing will add PLOs and mappings to the selected program. Existing data will not be overwritten.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleImport} disabled={!selectedProgram || importing} className="w-full">
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
    </div>
  );
}
