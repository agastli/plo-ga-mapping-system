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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import {
  Loader2, ArrowLeft, Activity, RefreshCw, Trash2, Info, Shield,
  Clock, Search, ChevronUp, ChevronDown, ChevronsUpDown, History,
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────
type SortKey = 'username' | 'role' | 'lastLogin' | 'ip' | 'duration';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatIpAddress(ip: string | null) {
  if (!ip) return '—';
  return ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip;
}

function formatDuration(loginAt: Date, logoutAt: Date | null): string {
  if (!logoutAt) return 'Active';
  const ms = logoutAt.getTime() - loginAt.getTime();
  if (ms < 0) return '—';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function durationMs(loginAt: Date, logoutAt: Date | null): number {
  if (!logoutAt) return Infinity;
  return logoutAt.getTime() - loginAt.getTime();
}

// ── Login History Drawer ───────────────────────────────────────────────────────
function LoginHistoryDrawer({
  open,
  onClose,
  userId,
  username,
  role,
}: {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  username: string;
  role: string;
}) {
  const { data: history, isLoading } = trpc.auth.getLoginHistoryByUserId.useQuery(
    { userId: userId! },
    { enabled: open && userId !== null }
  );

  const roleColor = role === 'admin'
    ? 'bg-purple-100 text-purple-800'
    : role === 'editor' ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-700';

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#8B1538]" />
            Login History
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 mt-1">
            <span className="font-medium text-slate-800">{username}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColor}`}>
              {role}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-[#8B1538]" />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <History className="h-10 w-10 opacity-30" />
              <p className="text-sm">No login records found for this user.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">
                {history.length} login event{history.length !== 1 ? 's' : ''} — most recent first
              </p>
              {history.map((entry, idx) => {
                const dur = formatDuration(entry.loginAt, entry.logoutAt);
                const isActive = dur === 'Active';
                return (
                  <div key={entry.id} className="rounded-lg border bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 w-5 text-right">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-medium tabular-nums">
                            {format(entry.loginAt, 'MMM dd, yyyy  HH:mm:ss')}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            IP: <span className="font-mono">{formatIpAddress(entry.ipAddress)}</span>
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                        {dur}
                      </span>
                    </div>
                    {entry.logoutAt && (
                      <p className="text-xs text-slate-400 mt-1.5 ml-7">
                        Logged out: {format(entry.logoutAt, 'HH:mm:ss')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
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

  // Drawer
  const [drawerUser, setDrawerUser] = useState<{ id: number; username: string; role: string } | null>(null);

  const utils = trpc.useUtils();

  const { data: allUsers, isLoading: usersLoading } = trpc.users.list.useQuery();
  const { data: historyWithDuration, isLoading: historyLoading, refetch } = trpc.auth.getLoginHistoryWithDuration.useQuery();

  const deleteOlderThan = trpc.auth.deleteLoginHistoryOlderThan.useMutation({
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} record(s) older than ${deleteOlderDays} days.`);
      utils.auth.getLoginHistoryWithDuration.invalidate();
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

  // Build a map: userId -> most recent history row
  const lastEventMap = useMemo(() => {
    const map = new Map<number, { ipAddress: string | null; loginAt: Date; logoutAt: Date | null; }>();
    if (!historyWithDuration) return map;
    for (const entry of historyWithDuration) {
      if (!map.has(entry.userId)) {
        map.set(entry.userId, {
          ipAddress: entry.ipAddress ?? null,
          loginAt: new Date(entry.loginAt),
          logoutAt: entry.logoutAt ? new Date(entry.logoutAt) : null,
        });
      }
    }
    return map;
  }, [historyWithDuration]);

  // Merged rows: one per registered user
  const rows = useMemo(() => {
    if (!allUsers) return [];
    let list = allUsers.map(u => {
      const event = lastEventMap.get(u.id);
      return {
        id: u.id,
        username: u.username ?? '—',
        role: u.role,
        lastLoginAt: event?.loginAt ?? null,
        logoutAt: event?.logoutAt ?? null,
        ipAddress: event?.ipAddress ?? null,
      };
    });

    if (inactivityFilter !== 'all') {
      const now = Date.now();
      list = list.filter(u => {
        if (inactivityFilter === 'never') return u.lastLoginAt === null;
        const days = parseInt(inactivityFilter, 10);
        if (u.lastLoginAt === null) return true;
        return Math.floor((now - u.lastLoginAt.getTime()) / 86400000) > days;
      });
    }

    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      if (sortKey === 'username') { av = a.username; bv = b.username; }
      else if (sortKey === 'role') { av = a.role; bv = b.role; }
      else if (sortKey === 'lastLogin') {
        av = a.lastLoginAt ? a.lastLoginAt.getTime() : 0;
        bv = b.lastLoginAt ? b.lastLoginAt.getTime() : 0;
      } else if (sortKey === 'ip') { av = formatIpAddress(a.ipAddress); bv = formatIpAddress(b.ipAddress); }
      else if (sortKey === 'duration') {
        av = a.lastLoginAt ? durationMs(a.lastLoginAt, a.logoutAt) : -1;
        bv = b.lastLoginAt ? durationMs(b.lastLoginAt, b.logoutAt) : -1;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allUsers, lastEventMap, inactivityFilter, searchUser, sortKey, sortDir]);

  const isLoading = usersLoading || historyLoading;

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
              timestamp, IP address, and session duration. Sessions expire automatically after 2 hours of inactivity.
              Click a username to view the full login history for that user.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Shield className="h-4 w-4 text-[#8B1538] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">One Row per User</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Each row shows the most recent login. Click a username to view the full audit trail.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-slate-50 rounded-md p-3">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Session Expiry</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sessions expire after 2 hours of inactivity. Explicit logouts are stamped immediately.
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
            <CardDescription>One row per registered user — most recent login. Click a username to view full history.</CardDescription>
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
                      <TableHead className="cursor-pointer select-none hover:text-[#8B1538]" onClick={() => handleSort('duration')}>
                        Duration <SortIcon col="duration" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          {searchUser || inactivityFilter !== 'all' ? 'No users match the current filters.' : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    ) : rows.map((u, idx) => {
                      const roleColor = u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'editor' ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700';
                      const dur = u.lastLoginAt ? formatDuration(u.lastLoginAt, u.logoutAt) : '—';
                      const isActive = dur === 'Active';
                      return (
                        <TableRow key={u.id} className="hover:bg-slate-50">
                          <TableCell className="pl-4 text-gray-400">{idx + 1}</TableCell>
                          <TableCell>
                            <button
                              className="font-medium text-[#8B1538] hover:underline flex items-center gap-1.5 group"
                              onClick={() => setDrawerUser({ id: u.id, username: u.username, role: u.role })}
                            >
                              {u.username}
                              <History className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </button>
                          </TableCell>
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
                          <TableCell className="text-sm tabular-nums">
                            {u.lastLoginAt ? (
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                                {dur}
                              </span>
                            ) : <span className="text-gray-400 italic">—</span>}
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

      {/* Login History Drawer */}
      <LoginHistoryDrawer
        open={drawerUser !== null}
        onClose={() => setDrawerUser(null)}
        userId={drawerUser?.id ?? null}
        username={drawerUser?.username ?? ''}
        role={drawerUser?.role ?? ''}
      />

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
