import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Copy, FileText, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import TemplateEditor from "@/components/TemplateEditor";
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

export default function ReportTemplates() {
  const [, setLocation] = useLocation();
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { data: templates, refetch } = trpc.templates.list.useQuery();
  const deleteTemplate = trpc.templates.delete.useMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate.mutateAsync({ id });
      toast.success("Template deleted successfully");
      refetch();
      setDeletingTemplateId(null);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    refetch();
  };

  // Header and Footer components
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
        <button
          onClick={() => setLocation("/programs")}
          className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B1028] transition-colors"
        >
          View Programs
        </button>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="bg-[#821F45] rounded-lg shadow-lg mt-8">
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/qu-log-white-transparent.png" alt="Qatar University" className="h-14 w-auto" />
          </div>
          <div className="text-center md:text-right">
            <p className="text-white font-medium">PLO-GA Mapping Management System</p>
            <p className="text-white text-sm opacity-90">© 2026 Qatar University. All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8">
        <Header />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#8B1538]">Report Templates</h2>
            <p className="text-gray-600 mt-2">
              Create and manage custom export templates for analytics reports
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-[#8B1538] hover:bg-[#6B1028]">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* User Templates */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#8B1538] mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            My Templates
          </h3>
          {templates?.userTemplates && templates.userTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.userTemplates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {template.isPublic === 1 && (
                          <Globe className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium capitalize">{template.format}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Includes:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {template.config.includeCharts && <li>Charts</li>}
                          {template.config.includeMetrics && <li>Metrics</li>}
                          {template.config.includeTables && <li>Tables</li>}
                          {template.config.includeTimestamp && <li>Timestamp</li>}
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="flex-1"
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingTemplateId(template.id)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">You haven't created any templates yet</p>
                <Button onClick={handleCreate} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Public Templates */}
        {templates?.publicTemplates && templates.publicTemplates.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-[#8B1538] mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Public Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.publicTemplates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium capitalize">{template.format}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Includes:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {template.config.includeCharts && <li>Charts</li>}
                          {template.config.includeMetrics && <li>Metrics</li>}
                          {template.config.includeTables && <li>Tables</li>}
                          {template.config.includeTimestamp && <li>Timestamp</li>}
                        </ul>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Copy template to user's templates
                          toast.info("Template duplication coming soon");
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Duplicate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingTemplateId !== null} onOpenChange={() => setDeletingTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTemplateId && handleDelete(deletingTemplateId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
