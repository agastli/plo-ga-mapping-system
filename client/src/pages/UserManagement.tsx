import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Trash2, Shield, Eye, EyeOff, Edit, LogOut, Edit2, Home, Search, X } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { useLocation } from 'wouter';

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  // Create user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  
  // Edit user form state
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // Password visibility state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'viewer'>('all');

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
  
  // Filtered users based on search query and role filter
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

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

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'User updated successfully' });
      refetchUsers();
      setIsEditUserDialogOpen(false);
      resetEditUserForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'User deleted successfully' });
      refetchUsers();
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
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

  const resetEditUserForm = () => {
    setEditUserId(null);
    setEditUsername('');
    setEditPassword('');
    setEditName('');
    setEditEmail('');
  };

  const handleEditUser = (user: any) => {
    setEditUserId(user.id);
    setEditUsername(user.username);
    setEditPassword('');
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editUserId) return;
    
    updateUserMutation.mutate({
      userId: editUserId,
      name: editName || undefined,
      email: editEmail || undefined,
      password: editPassword || undefined,
    });
  };

  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ userId: userToDelete });
    }
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

  const [, setLocation] = useLocation();
  const { data: currentUser } = trpc.auth.me.useQuery();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-7xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/qu-logo.png" alt="QU Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold text-[#8B1538]">User Management</h1>
              <p className="text-sm text-gray-600">Manage user roles and access permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setLocation('/admin-dashboard')} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Administrator</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          </div>
        </header>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin-dashboard" },
            { label: "User Management" },
          ]}
        />

      {/* Intro Panel */}
      <div className="bg-white border-l-4 border-[#8B1538] rounded-lg shadow-sm p-5 mb-4">
        <h2 className="text-base font-bold text-[#8B1538] mb-2">What can you do on this page?</h2>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li><strong>Create Users</strong> — add new system users with a username, password, name, email, and role.</li>
          <li><strong>Assign Roles</strong> — set each user as Admin, Editor, or Viewer to control their level of access.</li>
          <li><strong>Assign Programs</strong> — grant Editors and Viewers access to specific colleges, departments, or individual programs.</li>
          <li><strong>Edit User Info</strong> — update a user’s name, email, or password at any time.</li>
          <li><strong>Remove Users</strong> — delete accounts that are no longer needed (you cannot delete your own account).</li>
          <li><strong>Search &amp; Filter</strong> — use the search bar or role filter to quickly find a specific user.</li>
        </ul>
      </div>

      {/* Search, Filter, and Create User bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreateUserDialogOpen(true)} className="bg-[#8B1538] hover:bg-[#6d1030] text-white whitespace-nowrap">
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Result count */}
      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users?.length || 0} user{(users?.length || 0) !== 1 ? 's' : ''}
        {(searchQuery || roleFilter !== 'all') && (
          <button
            onClick={() => { setSearchQuery(''); setRoleFilter('all'); }}
            className="ml-2 text-[#8B1538] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 && !usersLoading ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : null}
        {filteredUsers.map((user) => (
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentUser?.id}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
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
              <div className="relative">
                <Input
                  id="password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
            <DialogDescription>
              Update user details. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Leave empty to keep current password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showEditPassword ? "Hide password" : "Show password"}
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter full name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
                className="flex-1"
              >
                {updateUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update User
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditUserDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone. All user data and assignments will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 pb-6 mt-20 max-w-7xl">
        <footer className="bg-[#821F45] rounded-lg shadow-lg">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/qu-logo.png" alt="Qatar University" className="h-10 w-auto brightness-0 invert" />
              <div className="text-sm">
                <p className="font-semibold text-white">© 2026 Qatar University. All rights reserved.</p>
              </div>
            </div>
            <div className="text-sm text-right">
              <p className="text-white">PLO-GA Mapping System v1.0</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
