import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Loader2, ArrowLeft, Activity, RefreshCw, Trash2, Info, Shield, Clock, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────
type SortKey = 'username' | 'role' | 'lastLogin' | 'method' | 'ip' | 'device';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatIpAddress(ip: string | null) {
  if (!ip) return '—';
  return ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip;
}

function formatUserAgent(userAgent: string | null) {
  if (!userAgent) return '—';
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
  const osMatch = userAgent.match(/(Windows|Mac OS X|Linux|Android|iOS)/);
  return `${browserMatch ? browserMatch[1] : 'Unknown'} on ${osMatch ? osMatch[1] : 'Unknown'}`;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function UserLoginTracking() {
  const [, setLocation] = useLocation();
  const [deleteOlderDays, setDeleteOlderDays] = useState<string>('30');
  const [showDeleteOlderDialog, setShowDeleteOlderDialog] = useState(false);

  // Filters
  const [searchUser, setSearchUser] = useState('');
  const [inactivityFilter, setInactivityFilter] = useState<'all' | '7' | '30' | '90' | 'never'>('all');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('lastLogin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const utils = trpc.useUtils();
  const { data: allUsers, isLoading: usersLoading } = trpc.users.list.useQuery();
  const { data: loginSummaryRaw, isLoading: summaryLoading, refetch } = trpc.auth.getLoginHistorySummaryPerUser.useQuery();

  // We also need the full loginHistory to get IP / device for each user's last login
  const { data: loginHistory } = trpc.auth.getLoginHistory.useQuery({ limit: 500 });

  const deleteOlderThan = trpc.auth.deleteLoginHistoryOlderThan.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} record(s) older than ${deleteOlderDays} days.`);
      utils.auth.getLoginHistory.invalidate();
      utils.auth.getLoginHistorySummaryPerUser.invalidate();
    },
    onError: (err) => toast.error(err.message || 'Failed to delete old records.'),
  });

  const handleDeleteOlder = () => {
    const days = parseInt(deleteOlderDays, 10);
    if (isNaN(days) || days < 1) { toast.error('Please enter a valid number of days.'); return; }
    deleteOlderThan.mutate({ days });
    setShowDeleteOlderDialog(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'lastLogin' ? 'desc' : 'asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="inline h-3 w-3 ml-1 text-gray-400" />;
    return sortDir === 'asc'
      ? <ChevronUp className="inline h-3 w-3 ml-1 text-[#8B1538]" />
      : <ChevronDown className="inline h-3 w-3 ml-1 text-[#8B1538]" />;
  };

  // Build a map: userId -> most recent full loginHistory row (for IP + device)
  const lastEventMap = useMemo(() => {
    const map = new Map<number, { ipAddress: string | null; userAgent: string | null; loginMethod: string | null; loginAt: Date }>();
    if (!loginHistory) return map;
    // loginHistory is sorted newest-first by the server; first occurrence per userId wins
    for (const entry of loginHistory) {
      if (!map.has(entry.userId)) {
        map.set(entry.userId, {
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          loginMethod: entry.loginMethod ?? null,
          loginAt: new Date(entry.loginAt),
        });
      }
    }
    return map;
  }, [loginHistory]);

  // Merged rows: one per registered user
  const rows = useMemo(() => {
    if (!allUsers) return [];

    // Build lastLogin map from loginSummaryRaw
    const summaryMap = new Map<number, Date>();
    if (loginSummaryRaw) {
      for (const row of loginSummaryRaw) {
        summaryMap.set(row.userId, new Date(row.lastLoginAt));
      }
    }

    let list = allUsers.map(u => {
      const event = lastEventMap.get(u.id);
      const lastLoginAt = summaryMap.get(u.id) ?? null;
      return {
        id: u.id,
        username: u.username ?? '—',
        role: u.role,
        lastLoginAt,
        loginMethod: event?.loginMethod ?? null,
        ipAddress: event?.ipAddress ?? null,
        userAgent: event?.userAgent ?? null,
      };
    });

    // Inactivity filter
    if (inactivityFilter !== 'all') {
      const now = Date.now();
      list = list.filter(u => {
        if (inactivityFilter === 'never') return u.lastLoginAt === null;
        const days = parseInt(inactivityFilter, 10);
        if (u.lastLoginAt === null) return true;
        return Math.floor((now - u.lastLoginAt.getTime()) / 86400000) > days;
      });
    }

    // Search filter
    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      if (sortKey === 'username') { av = a.username; bv = b.username; }
      else if (sortKey === 'role') { av = a.role; bv = b.role; }
      else if (sortKey === 'lastLogin') {
        av = a.lastLoginAt ? a.lastLoginAt.getTime() : 0;
        bv = b.lastLoginAt ? b.lastLoginAt.getTime() : 0;
      } else if (sortKey === 'method') { av = a.loginMethod ?? ''; bv = b.loginMethod ?? ''; }
      else if (sortKey === 'ip') { av = formatIpAddress(a.ipAddress); bv = formatIpAddress(b.ipAddress); }
      else if (sortKey === 'device') { av = formatUserAgent(a.userAgent); bv = formatUserAgent(b.userAgent); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allUsers, loginSummaryRaw, lastEventMap, inactivityFilter, searchUser, sortKey, sortDir]);

  const isLoading = usersLoading || summaryLoading;

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
              This page shows the most recent login event for each registered user — including their role, last login
              timestamp, IP address, browser/device, and authentication method. Use the filters and sort controls to
              identify inactive accounts.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Shield className="h-4 w-4 text-[#8B1538] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">One Row per User</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Each row summarises the most recent login event for that user. IP address and device reflect that last event.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Delete by Age</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use <strong>Delete Older Than</strong> to purge all login history records beyond a chosen number of days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Search className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Filter &amp; Search</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use the inactivity dropdown to surface dormant accounts and the search box to find a specific user.
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
            <Input placeholder="Search by username or role…" value={searchUser} onChange={e => setSearchUser(e.target.value)} className="pl-8 h-9" />
          </div>
          <Select value={inactivityFilter} onValueChange={v => setInactivityFilter(v as any)}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="All users" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              <SelectItem value="7">Inactive &gt; 7 days</SelectItem>
              <SelectItem value="30">Inactive &gt; 30 days</SelectItem>
              <SelectItem value="90">Inactive &gt; 90 days</SelectItem>
              <SelectItem value="never">Never logged in</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-sm text-slate-600 whitespace-nowrap">Delete older than</span>
            <Input type="number" min={1} value={deleteOlderDays} onChange={e => setDeleteOlderDays(e.target.value)} className="h-9 w-20 text-center" />
            <span className="text-sm text-slate-600">days</span>
            <Button size="sm" variant="outline" className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50" disabled={deleteOlderThan.isPending} onClick={() => setShowDeleteOlderDialog(true)}>
              <Trash2 className="h-4 w-4" />Apply
            </Button>
          </div>
        </div>

        {/* Unified Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-[#8B1538]" />
              Login Records
              {rows.length > 0 && (
                <Badge variant="secondary" className="ml-2">{rows.length} user{rows.length !== 1 ? 's' : ''}</Badge>
              )}
            </CardTitle>
            <CardDescription>One row per registered user — showing their most recent login event. Click column headers to sort.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#8B1538]" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-10 pl-4">#</TableHead>
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('username')}>
                        Username <SortIcon col="username" />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('role')}>
                        Role <SortIcon col="role" />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('lastLogin')}>
                        Last Login <SortIcon col="lastLogin" />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('ip')}>
                        IP Address <SortIcon col="ip" />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('device')}>
                        Device / Browser <SortIcon col="device" />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('method')}>
                        Method <SortIcon col="method" />
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          {searchUser || inactivityFilter !== 'all' ? 'No users match the current filters.' : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    ) : rows.map((u, idx) => {
                      const now = Date.now();
                      const diffDays = u.lastLoginAt ? Math.floor((now - u.lastLoginAt.getTime()) / 86400000) : null;
                      const statusLabel = diffDays === null ? 'Never' : diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`;
                      const statusColor = diffDays === null
                        ? 'bg-gray-100 text-gray-600'
                        : diffDays <= 1 ? 'bg-green-100 text-green-800'
                        : diffDays <= 7 ? 'bg-blue-100 text-blue-800'
                        : diffDays <= 30 ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-700';
                      const roleColor = u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'editor' ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700';
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="pl-4 text-gray-400">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{u.username}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColor}`}>
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm tabular-nums">
                            {u.lastLoginAt
                              ? format(u.lastLoginAt, 'MMM dd, yyyy HH:mm')
                              : <span className="text-gray-400 italic">Never</span>}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{formatIpAddress(u.ipAddress)}</TableCell>
                          <TableCell className="text-sm">{formatUserAgent(u.userAgent)}</TableCell>
                          <TableCell>
                            {u.loginMethod ? (
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.loginMethod === 'password' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {u.loginMethod}
                              </span>
                            ) : <span className="text-gray-400 italic">—</span>}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm: Delete Older Than */}
      <AlertDialog open={showDeleteOlderDialog} onOpenChange={setShowDeleteOlderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete records older than {deleteOlderDays} days?</AlertDialogTitle>
            <AlertDialogDescription>
              All login history entries recorded more than {deleteOlderDays} day(s) ago will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
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
