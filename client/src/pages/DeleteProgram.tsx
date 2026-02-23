import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Home, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
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

export default function DeleteProgram() {
  const [, setLocation] = useLocation();
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: colleges, isLoading: collegesLoading } = trpc.colleges.list.useQuery();
  const { data: allClusters } = trpc.clusters.list.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();

  const deleteProgram = trpc.programs.delete.useMutation({
    onSuccess: () => {
      toast.success("Program deleted successfully", {
        description: "All related data has been removed.",
      });
      setLocation("/programs");
    },
    onError: (error) => {
      toast.error("Failed to delete program", {
        description: error.message,
      });
    },
  });

  // Get clusters for selected college
  const clusters = selectedCollegeId && allClusters
    ? allClusters.filter((c: any) => c.collegeId === parseInt(selectedCollegeId))
    : [];
  const hasCluster = clusters.length > 0;

  // Reset selections when college changes
  const handleCollegeChange = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setSelectedClusterId("");
    setSelectedProgramId("");
  };

  // Reset program selection when cluster changes
  const handleClusterChange = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setSelectedProgramId("");
  };

  // Filter programs based on college and cluster
  const availablePrograms = programs?.filter((item) => {
    const matchesCollege = item.college.id.toString() === selectedCollegeId;
    
    if (!matchesCollege) return false;
    
    // If college has clusters, filter by selected cluster
    if (hasCluster && selectedClusterId) {
      return item.department.clusterId?.toString() === selectedClusterId;
    }
    
    // If college has clusters but none selected, don't show programs
    if (hasCluster && !selectedClusterId) {
      return false;
    }
    
    return true;
  });

  const selectedProgram = programs?.find(p => p.program.id.toString() === selectedProgramId);

  const handleDelete = () => {
    if (!selectedProgramId) return;
    deleteProgram.mutate({ id: parseInt(selectedProgramId) });
    setShowConfirmDialog(false);
  };

  const canDelete = selectedCollegeId && (!hasCluster || selectedClusterId) && selectedProgramId;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with QU Logo */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
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
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-slate-400 text-slate-600 hover:bg-slate-50">
                  <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <Trash2 className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[#8B1538]">Delete Existing Program</h1>
          <p className="text-gray-700">
            Select a program to permanently remove it and all associated data
          </p>
        </div>

        {/* Warning Alert */}
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone. Deleting a program will permanently remove:
            <ul className="list-disc list-inside mt-2 ml-2">
              <li>The program record</li>
              <li>All Program Learning Outcomes (PLOs)</li>
              <li>All PLO-GA mappings</li>
              <li>All mapping justifications</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Selection Form */}
        <Card className="shadow-lg border-red-200">
          <CardHeader>
            <CardTitle>Select Program to Delete</CardTitle>
            <CardDescription>
              Follow the steps below to select the program you want to delete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: College Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Step 1: Select College
              </label>
              <Select value={selectedCollegeId} onValueChange={handleCollegeChange} disabled={collegesLoading}>
                <SelectTrigger className="border-red-200 focus:ring-red-500">
                  <SelectValue placeholder="Select a college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges?.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Cluster Selection (if applicable) */}
            {hasCluster && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Step 2: Select Cluster
                </label>
                <Select value={selectedClusterId} onValueChange={handleClusterChange}>
                  <SelectTrigger className="border-red-200 focus:ring-red-500">
                    <SelectValue placeholder="Select a cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters.map((cluster: any) => (
                      <SelectItem key={cluster.id} value={cluster.id.toString()}>
                        {cluster.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: Program Selection */}
            {selectedCollegeId && (!hasCluster || selectedClusterId) && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {hasCluster ? "Step 3:" : "Step 2:"} Select Program
                </label>
                <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                  <SelectTrigger className="border-red-200 focus:ring-red-500">
                    <SelectValue placeholder="Select a program to delete" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrograms && availablePrograms.length > 0 ? (
                      availablePrograms.map((item) => (
                        <SelectItem key={item.program.id} value={item.program.id.toString()}>
                          {item.program.nameEn}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-programs" disabled>
                        No programs available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected Program Info */}
            {selectedProgram && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Program to be deleted:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Program:</strong> {selectedProgram.program.nameEn}</p>
                  <p><strong>Department:</strong> {selectedProgram.department.nameEn}</p>
                  <p><strong>College:</strong> {selectedProgram.college.nameEn}</p>
                  <p><strong>PLOs:</strong> {selectedProgram.ploCount} will be deleted</p>
                  <p><strong>Mappings:</strong> {selectedProgram.mappingCount} will be deleted</p>
                </div>
              </div>
            )}

            {/* Delete Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                asChild
                className="flex-1"
              >
                <Link href="/admin">Cancel</Link>
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!canDelete || deleteProgram.isPending}
                onClick={() => setShowConfirmDialog(true)}
              >
                {deleteProgram.isPending ? "Deleting..." : "Delete Program"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the program{" "}
              <strong>"{selectedProgram?.program.nameEn}"</strong> and remove all associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
