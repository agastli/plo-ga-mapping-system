import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Activity, RefreshCw, Trash2, Info, Shield, Clock, Search } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UserLoginTracking() {
  const [, setLocation] = useLocation();
  const [limit, setLimit] = useState(200);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchUser, setSearchUser] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'password' | 'oauth'>('all');
  const [deleteOlderDays, setDeleteOlderDays] = useState<string>('30');
  const [showDeleteSelectedDialog, setShowDeleteSelectedDialog] = useState(false);
  const [showDeleteOlderDialog, setShowDeleteOlderDialog] = useState(false);

  const utils = trpc.useUtils();
  const { data: loginHistory, isLoading, refetch } = trpc.auth.getLoginHistory.useQuery({ limit });

  const deleteByIds = trpc.auth.deleteLoginHistoryByIds.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} login record(s).`);
      setSelectedIds(new Set());
      utils.auth.getLoginHistory.invalidate();
    },
    onError: (err) => toast.error(err.message || 'Failed to delete records.'),
  });

  const deleteOlderThan = trpc.auth.deleteLoginHistoryOlderThan.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} record(s) older than ${deleteOlderDays} days.`);
      setSelectedIds(new Set());
      utils.auth.getLoginHistory.invalidate();
    },
    onError: (err) => toast.error(err.message || 'Failed to delete old records.'),
  });

  const formatDate = (date: Date) => format(new Date(date), 'MMM dd, yyyy HH:mm:ss');

  const formatIpAddress = (ip: string | null) => {
    if (!ip) return 'Unknown';
    return ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip;
  };

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    const osMatch = userAgent.match(/(Windows|Mac OS X|Linux|Android|iOS)/);
    return `${browserMatch ? browserMatch[1] : 'Unknown'} on ${osMatch ? osMatch[1] : 'Unknown'}`;
  };

  const filteredHistory = useMemo(() => {
    if (!loginHistory) return [];
    return loginHistory.filter((entry) => {
      const matchesUser =
        searchUser === '' ||
        (entry.username || '').toLowerCase().includes(searchUser.toLowerCase());
      const matchesMethod = filterMethod === 'all' || entry.loginMethod === filterMethod;
      return matchesUser && matchesMethod;
    });
  }, [loginHistory, searchUser, filterMethod]);

  const allVisibleSelected =
    filteredHistory.length > 0 && filteredHistory.every((e) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredHistory.forEach((e) => next.delete(e.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredHistory.forEach((e) => next.add(e.id));
        return next;
      });
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    deleteByIds.mutate({ ids: Array.from(selectedIds) });
    setShowDeleteSelectedDialog(false);
  };

  const handleDeleteOlder = () => {
    const days = parseInt(deleteOlderDays, 10);
    if (isNaN(days) || days < 1) { toast.error('Please enter a valid number of days.'); return; }
    deleteOlderThan.mutate({ days });
    setShowDeleteOlderDialog(false);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-6xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/qu-logo.png" alt="QU Logo" className="h-12 w-auto" />
              <div className="border-l-2 border-gray-300 pl-3">
                <h1 className="text-xl font-bold text-[#8B1538]">User Login Tracking</h1>
                <p className="text-sm text-gray-600">Monitor and manage user login activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => setLocation('/admin-dashboard')} className="gap-2 bg-[#8B1538] text-white hover:bg-[#6D1028]">
                <ArrowLeft className="h-4 w-4" />Back to Dashboard
              </Button>
              <Button size="sm" onClick={() => refetch()} variant="outline" className="gap-2 border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10">
                <RefreshCw className="h-4 w-4" />Refresh
              </Button>
            </div>
          </div>
        </header>
      </div>

      <div className="container mx-auto px-4 max-w-6xl flex-1">
        <Breadcrumb className="mb-4" items={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Login Tracking' }]} />

        {/* Explanatory Card */}
        <Card className="mb-6 border-l-4 border-l-[#8B1538] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-[#8B1538]">
              <Info className="h-5 w-5 flex-shrink-0" />
              About This Page
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-3">
            <p>
              This page provides a complete audit trail of all user login events recorded by the PLO-GA Mapping System.
              Each row represents a single successful login attempt and captures the username, timestamp, IP address,
              browser/device information, and authentication method used.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Shield className="h-4 w-4 text-[#8B1538] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Select &amp; Delete</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tick the checkbox on any row — or use the header checkbox to select all visible rows — then click <strong>Delete Selected</strong> to remove those records permanently.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Delete by Age</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use the <strong>Delete Older Than</strong> quick action to purge all records beyond a chosen number of days in a single operation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Search className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Filter &amp; Search</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use the search box to find records by username and the method filter to narrow results to password or OAuth logins.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by username..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="pl-8 h-9" />
          </div>
          <Select value={filterMethod} onValueChange={(v) => setFilterMethod(v as any)}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="All methods" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="oauth">OAuth</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="50">Show 50</SelectItem>
              <SelectItem value="100">Show 100</SelectItem>
              <SelectItem value="200">Show 200</SelectItem>
              <SelectItem value="500">Show 500</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="destructive" className="gap-1.5" disabled={selectedIds.size === 0 || deleteByIds.isPending} onClick={() => setShowDeleteSelectedDialog(true)}>
            <Trash2 className="h-4 w-4" />Delete Selected ({selectedIds.size})
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-600 whitespace-nowrap">Delete older than</span>
            <Input type="number" min={1} value={deleteOlderDays} onChange={(e) => setDeleteOlderDays(e.target.value)} className="h-9 w-20 text-center" />
            <span className="text-sm text-slate-600">days</span>
            <Button size="sm" variant="outline" className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50" disabled={deleteOlderThan.isPending} onClick={() => setShowDeleteOlderDialog(true)}>
              <Trash2 className="h-4 w-4" />Apply
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-[#8B1538]" />
              Login Records
              {loginHistory && (
                <Badge variant="secondary" className="ml-2">
                  {filteredHistory.length} shown / {loginHistory.length} loaded
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Each row represents one successful login event.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#8B1538]" /></div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                {loginHistory?.length === 0 ? 'No login history recorded yet.' : 'No records match the current filters.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-10 pl-4">
                        <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} aria-label="Select all visible rows" />
                      </TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device / Browser</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((entry) => (
                      <TableRow key={entry.id} className={selectedIds.has(entry.id) ? 'bg-red-50' : undefined} onClick={() => toggleRow(entry.id)} style={{ cursor: 'pointer' }}>
                        <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(entry.id)} onCheckedChange={() => toggleRow(entry.id)} aria-label={`Select row ${entry.id}`} />
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.username || <span className="text-gray-400 italic">N/A</span>}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">{formatDate(entry.loginAt)}</TableCell>
                        <TableCell className="font-mono text-sm">{formatIpAddress(entry.ipAddress)}</TableCell>
                        <TableCell className="text-sm">{formatUserAgent(entry.userAgent)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.loginMethod === 'password' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {entry.loginMethod || 'Unknown'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm: Delete Selected */}
      <AlertDialog open={showDeleteSelectedDialog} onOpenChange={setShowDeleteSelectedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} selected record(s)?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the selected login history entries. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteSelected}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: Delete Older Than */}
      <AlertDialog open={showDeleteOlderDialog} onOpenChange={setShowDeleteOlderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete records older than {deleteOlderDays} days?</AlertDialogTitle>
            <AlertDialogDescription>All login history entries recorded more than {deleteOlderDays} day(s) ago will be permanently deleted. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteOlder}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="mt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-[#8B1538] text-white py-6 px-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/qu-logo.png" alt="QU Logo" className="h-10 w-auto brightness-0 invert" />
                <div>
                  <p className="text-sm font-medium">PLO-GA Mapping Management System</p>
                  <p className="text-xs text-gray-300">&copy; 2026 Qatar University. All rights reserved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
