import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Trash2, Shield, Eye, Edit } from 'lucide-react';

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  
  // Create user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  
  // Assignment form state
  const [assignmentType, setAssignmentType] = useState<'university' | 'college' | 'cluster' | 'department'>('department');
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | undefined>();
  const [selectedClusterId, setSelectedClusterId] = useState<number | undefined>();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);

  // Queries
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.users.list.useQuery();
  const { data: colleges } = trpc.colleges.list.useQuery();
  const { data: clusters } = trpc.clusters.list.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();
  
  // Filtered data based on selections
  const filteredDepartments = departments?.filter(dept => 
    assignmentType === 'department' && selectedCollegeId ? dept.collegeId === selectedCollegeId : true
  );
  
  const filteredPrograms = programs?.filter(prog => 
    assignmentType === 'department' && selectedDepartmentId ? prog.program.departmentId === selectedDepartmentId : false
  );

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

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'User created successfully' });
      refetchUsers();
      setIsCreateUserDialogOpen(false);
      resetCreateUserForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetCreateUserForm = () => {
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setNewEmail('');
    setNewRole('viewer');
  };

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) {
      toast({ title: 'Error', description: 'Username and password are required', variant: 'destructive' });
      return;
    }
    
    createUserMutation.mutate({
      username: newUsername,
      password: newPassword,
      name: newName || undefined,
      email: newEmail || undefined,
      role: newRole,
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentType('department');
    setSelectedCollegeId(undefined);
    setSelectedClusterId(undefined);
    setSelectedDepartmentId(undefined);
    setSelectedProgramIds([]);
  };

  const handleRoleChange = (userId: number, newRole: 'admin' | 'viewer' | 'editor') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleCreateAssignment = async () => {
    if (!selectedUserId) return;

    // Handle multiple program assignments
    if (assignmentType === 'department' && selectedProgramIds.length > 0) {
      // Create assignment for each selected program
      try {
        for (const programId of selectedProgramIds) {
          await createAssignmentMutation.mutateAsync({
            userId: selectedUserId,
            assignmentType: 'program',
            programId,
          });
        }
        toast({ title: 'Success', description: `${selectedProgramIds.length} program assignment(s) created successfully` });
        setIsAssignmentDialogOpen(false);
        resetAssignmentForm();
        refetchUsers();
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }

    // Handle other assignment types
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
    if (type === 'program') {
      const prog = programs?.find(p => p.program.id === assignment.programId);
      return `Program: ${prog?.program.nameEn || 'Unknown'} (${prog?.program.code || ''})`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user roles and access permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateUserDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
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
              <>
                <div className="space-y-2">
                  <Label>College</Label>
                  <Select
                    value={selectedCollegeId?.toString()}
                    onValueChange={(value) => {
                      setSelectedCollegeId(parseInt(value));
                      setSelectedDepartmentId(undefined);
                      setSelectedProgramIds([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select college first" />
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
                
                {selectedCollegeId && (
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={selectedDepartmentId?.toString()}
                      onValueChange={(value) => {
                        setSelectedDepartmentId(parseInt(value));
                        setSelectedProgramIds([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedDepartmentId && filteredPrograms && filteredPrograms.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Programs (one or more)</Label>
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                      {filteredPrograms.map((prog) => (
                        <label key={prog.program.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedProgramIds.includes(prog.program.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProgramIds([...selectedProgramIds, prog.program.id]);
                              } else {
                                setSelectedProgramIds(selectedProgramIds.filter(id => id !== prog.program.id));
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">
                            {prog.program.nameEn} ({prog.program.code})
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedProgramIds.length} program(s) selected
                    </p>
                  </div>
                )}
              </>
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

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with username and password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email (optional)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as 'admin' | 'editor' | 'viewer')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="w-full"
            >
              {createUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
