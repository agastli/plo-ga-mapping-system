import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Trash2, Shield, Eye, Edit } from 'lucide-react';

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  
  // Assignment form state
  const [assignmentType, setAssignmentType] = useState<'university' | 'college' | 'cluster' | 'department'>('department');
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>();
  const [selectedClusterId, setSelectedClusterId] = useState<number | undefined>();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();

  // Queries
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.users.list.useQuery();
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: clusters } = trpc.clusters.list.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();

  // Mutations
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'User role updated successfully' });
      refetchUsers();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createAssignmentMutation = trpc.users.createAssignment.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Assignment created successfully' });
      refetchUsers();
      setIsAssignmentDialogOpen(false);
      resetAssignmentForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAssignmentMutation = trpc.users.deleteAssignment.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Assignment deleted successfully' });
      refetchUsers();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAllAssignmentsMutation = trpc.users.deleteAllAssignments.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'All assignments deleted successfully' });
      refetchUsers();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetAssignmentForm = () => {
    setAssignmentType('department');
    setSelectedCollegeId(undefined);
    setSelectedClusterId(undefined);
    setSelectedDepartmentId(undefined);
  };

  const handleRoleChange = (userId: number, newRole: 'admin' | 'viewer' | 'editor') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleCreateAssignment = () => {
    if (!selectedUserId) return;

    const input: any = {
      userId: selectedUserId,
      assignmentType,
    };

    if (assignmentType === 'college' && selectedCollegeId) {
      input.collegeId = selectedCollegeId;
    } else if (assignmentType === 'cluster' && selectedClusterId) {
      input.clusterId = selectedClusterId;
    } else if (assignmentType === 'department' && selectedDepartmentId) {
      input.departmentId = selectedDepartmentId;
    } else if (assignmentType !== 'university') {
      toast({ title: 'Error', description: 'Please select a valid assignment', variant: 'destructive' });
      return;
    }

    createAssignmentMutation.mutate(input);
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignmentMutation.mutate({ assignmentId });
    }
  };

  const handleDeleteAllAssignments = (userId: number) => {
    if (confirm('Are you sure you want to delete ALL assignments for this user?')) {
      deleteAllAssignmentsMutation.mutate({ userId });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'editor': return <Edit className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return null;
    }
  };

  const getAssignmentDisplay = (assignment: any) => {
    const type = assignment.assignmentType;
    if (type === 'university') return 'University-wide';
    if (type === 'college') {
      const college = colleges?.find(c => c.id === assignment.collegeId);
      return `College: ${college?.nameEn || 'Unknown'}`;
    }
    if (type === 'cluster') {
      const cluster = clusters?.find(c => c.id === assignment.clusterId);
      return `Cluster: ${cluster?.nameEn || 'Unknown'}`;
    }
    if (type === 'department') {
      const dept = departments?.find(d => d.id === assignment.departmentId);
      return `Department: ${dept?.nameEn || 'Unknown'}`;
    }
    return 'Unknown';
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and access permissions
        </p>
      </div>

      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {user.name || 'Unnamed User'}
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {user.email || 'No email'} • Joined {new Date(user.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'viewer' | 'editor')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assignments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Access Assignments</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsAssignmentDialogOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Assignment
                    </Button>
                    {user.assignments.length > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAllAssignments(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
                {user.assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignments yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.assignments.map((assignment) => (
                      <Badge key={assignment.id} variant="secondary" className="flex items-center gap-1">
                        {getAssignmentDisplay(assignment)}
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Access Assignment</DialogTitle>
            <DialogDescription>
              Assign this user access to specific organizational units
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assignment Type</Label>
              <Select
                value={assignmentType}
                onValueChange={(value) => setAssignmentType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University-wide</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="cluster">Cluster</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignmentType === 'college' && (
              <div className="space-y-2">
                <Label>College</Label>
                <Select
                  value={selectedCollegeId?.toString()}
                  onValueChange={(value) => setSelectedCollegeId(parseInt(value))}
                >
                  <SelectTrigger>
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
              </div>
            )}

            {assignmentType === 'cluster' && (
              <div className="space-y-2">
                <Label>Cluster</Label>
                <Select
                  value={selectedClusterId?.toString()}
                  onValueChange={(value) => setSelectedClusterId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters?.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id.toString()}>
                        {cluster.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {assignmentType === 'department' && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={selectedDepartmentId?.toString()}
                  onValueChange={(value) => setSelectedDepartmentId(parseInt(value))}
                >
                  <SelectTrigger>
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
              </div>
            )}

            <Button
              onClick={handleCreateAssignment}
              disabled={createAssignmentMutation.isPending}
              className="w-full"
            >
              {createAssignmentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
