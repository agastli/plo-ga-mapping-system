import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface TemplateEditorProps {
  template?: any;
  onClose: () => void;
}

export default function TemplateEditor({ template, onClose }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [format, setFormat] = useState<"pdf" | "excel" | "word" | "csv">(template?.format || "pdf");
  const [includeCharts, setIncludeCharts] = useState(template?.config?.includeCharts ?? true);
  const [includeMetrics, setIncludeMetrics] = useState(template?.config?.includeMetrics ?? true);
  const [includeTables, setIncludeTables] = useState(template?.config?.includeTables ?? true);
  const [includeTimestamp, setIncludeTimestamp] = useState(template?.config?.includeTimestamp ?? true);
  const [headerText, setHeaderText] = useState(template?.config?.customBranding?.headerText || "");
  const [footerText, setFooterText] = useState(template?.config?.customBranding?.footerText || "");
  const [isPublic, setIsPublic] = useState(template?.isPublic === 1);

  const createTemplate = trpc.templates.create.useMutation();
  const updateTemplate = trpc.templates.update.useMutation();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const config = {
      includeCharts,
      includeMetrics,
      includeTables,
      includeTimestamp,
      customBranding: {
        headerText: headerText.trim() || undefined,
        footerText: footerText.trim() || undefined,
      },
    };

    try {
      if (template) {
        // Update existing template
        await updateTemplate.mutateAsync({
          id: template.id,
          name,
          description: description.trim() || undefined,
          format,
          config,
          isPublic,
        });
        toast.success("Template updated successfully");
      } else {
        // Create new template
        await createTemplate.mutateAsync({
          name,
          description: description.trim() || undefined,
          format,
          config,
          isPublic,
        });
        toast.success("Template created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(template ? "Failed to update template" : "Failed to create template");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/qu-logo.png" alt="QU Logo" className="h-14" />
              <div>
                <h1 className="text-xl font-bold text-[#8B1538]">PLO-GA Mapping System</h1>
                <p className="text-sm text-gray-600">Academic Planning & Quality Assurance Office</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#8B1538]">
            {template ? "Edit Template" : "Create New Template"}
          </h2>
          <p className="text-gray-600 mt-2">
            Configure your custom export template settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Name and describe your template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Executive Summary Report"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this template is for..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Options</CardTitle>
                <CardDescription>Choose what to include in the report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeCharts">Include Charts</Label>
                    <p className="text-sm text-gray-500">Add visual charts to the report</p>
                  </div>
                  <Switch
                    id="includeCharts"
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeMetrics">Include Metrics</Label>
                    <p className="text-sm text-gray-500">Show key performance metrics</p>
                  </div>
                  <Switch
                    id="includeMetrics"
                    checked={includeMetrics}
                    onCheckedChange={setIncludeMetrics}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeTables">Include Tables</Label>
                    <p className="text-sm text-gray-500">Add detailed data tables</p>
                  </div>
                  <Switch
                    id="includeTables"
                    checked={includeTables}
                    onCheckedChange={setIncludeTables}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeTimestamp">Include Timestamp</Label>
                    <p className="text-sm text-gray-500">Show report generation date/time</p>
                  </div>
                  <Switch
                    id="includeTimestamp"
                    checked={includeTimestamp}
                    onCheckedChange={setIncludeTimestamp}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Branding</CardTitle>
                <CardDescription>Add custom header and footer text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="headerText">Header Text</Label>
                  <Input
                    id="headerText"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g., Confidential - Internal Use Only"
                  />
                </div>
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input
                    id="footerText"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="e.g., Academic Planning & Quality Assurance Office"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>Control who can see this template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic">Make Public</Label>
                    <p className="text-sm text-gray-500">Allow others to use this template</p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>Summary of your template settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Format</p>
                  <p className="text-sm text-gray-600 capitalize">{format}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Content</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {includeCharts && <li>✓ Charts</li>}
                    {includeMetrics && <li>✓ Metrics</li>}
                    {includeTables && <li>✓ Tables</li>}
                    {includeTimestamp && <li>✓ Timestamp</li>}
                  </ul>
                </div>
                {(headerText || footerText) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Branding</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {headerText && <li>✓ Custom Header</li>}
                      {footerText && <li>✓ Custom Footer</li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              className="w-full bg-[#8B1538] hover:bg-[#6B1028]"
              disabled={createTemplate.isPending || updateTemplate.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {template ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>

        {/* Footer */}
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
      </div>
    </div>
  );
}
