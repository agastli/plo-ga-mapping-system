import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, Activity, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function UserLoginTracking() {
  const [, setLocation] = useLocation();
  const [limit, setLimit] = useState(100);
  
  const { data: loginHistory, isLoading, refetch } = trpc.auth.getLoginHistory.useQuery({ limit });

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy HH:mm:ss');
  };

  const formatIpAddress = (ip: string | null) => {
    if (!ip) return 'Unknown';
    // Remove IPv6 prefix for localhost
    if (ip.startsWith('::ffff:')) {
      return ip.replace('::ffff:', '');
    }
    return ip;
  };

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    
    // Extract browser and OS info
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    const osMatch = userAgent.match(/(Windows|Mac OS X|Linux|Android|iOS)/);
    
    const browser = browserMatch ? browserMatch[1] : 'Unknown';
    const os = osMatch ? osMatch[1] : 'Unknown';
    
    return `${browser} on ${os}`;
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 pt-4 max-w-6xl">
        <header className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/qu-logo.png" 
                alt="QU Logo" 
                className="h-12 w-auto"
              />
              <div className="border-l-2 border-gray-300 pl-3">
                <h1 className="text-xl font-bold text-[#8B1538]">User Login Tracking</h1>
                <p className="text-sm text-gray-600">Monitor user login activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setLocation('/admin-dashboard')}
                className="gap-2 bg-[#8B1538] text-white hover:bg-[#6D1028]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                size="sm"
                onClick={() => refetch()}
                className="gap-2 bg-[#8B1538] text-white hover:bg-[#6D1028]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </header>
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl flex-1">

        {/* Login History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Login History
            </CardTitle>
            <CardDescription>
              Recent user login activity (showing last {limit} logins)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B1538]" />
              </div>
            ) : !loginHistory || loginHistory.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No login history found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device/Browser</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">{entry.userId}</TableCell>
                        <TableCell className="font-medium">{entry.username || 'N/A'}</TableCell>
                        <TableCell className="text-sm">{formatDate(entry.loginAt)}</TableCell>
                        <TableCell className="font-mono text-sm">{formatIpAddress(entry.ipAddress)}</TableCell>
                        <TableCell className="text-sm">{formatUserAgent(entry.userAgent)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            entry.loginMethod === 'password' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {entry.loginMethod || 'Unknown'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination controls */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Showing {loginHistory?.length || 0} of {loginHistory?.length || 0} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLimit(50)}
                  disabled={limit === 50}
                >
                  Show 50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLimit(100)}
                  disabled={limit === 100}
                >
                  Show 100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLimit(200)}
                  disabled={limit === 200}
                >
                  Show 200
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <footer className="mt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-[#8B1538] text-white py-6 px-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/qu-logo.png" 
                alt="QU Logo" 
                className="h-10 w-auto brightness-0 invert"
              />
              <div>
                <p className="text-sm font-medium">PLO-GA Mapping Management System</p>
                <p className="text-xs text-gray-300">© 2026 Qatar University. All rights reserved</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
