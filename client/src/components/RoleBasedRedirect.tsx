import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

/**
 * Component that redirects users to their role-specific dashboard
 * Used on the homepage to route authenticated users appropriately
 */
export default function RoleBasedRedirect() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to login page
        setLocation('/login');
      } else {
        // Logged in, redirect based on role
        switch (user.role) {
          case 'admin':
            setLocation('/admin-dashboard');
            break;
          case 'editor':
            setLocation('/editor-dashboard');
            break;
          case 'viewer':
            setLocation('/viewer-dashboard');
            break;
          default:
            setLocation('/login');
        }
      }
    }
  }, [user, isLoading, setLocation]);

  // Show loading spinner while checking authentication
  return (
    <div className="flex items-center justify-center h-screen bg-amber-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B1538] mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
