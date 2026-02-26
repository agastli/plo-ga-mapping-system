import { useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'editor' | 'viewer' | 'admin-or-editor';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!isLoading) {
      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        setLocation(redirectTo);
        return;
      }

      // If specific role is required
      if (requireRole && user) {
        if (requireRole === 'admin-or-editor') {
          if (user.role !== 'admin' && user.role !== 'editor') {
            setLocation('/unauthorized');
          }
        } else if (user.role !== requireRole) {
          setLocation('/unauthorized');
        }
      }
    }
  }, [user, isLoading, requireAuth, requireRole, redirectTo, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B1538]" />
      </div>
    );
  }

  // If authentication is required but user is not logged in, show nothing (redirect will happen)
  if (requireAuth && !user) {
    return null;
  }

  // If role is required and user doesn't have it, show nothing (redirect will happen)
  if (requireRole && user) {
    if (requireRole === 'admin-or-editor') {
      if (user.role !== 'admin' && user.role !== 'editor') {
        return null;
      }
    } else if (user.role !== requireRole) {
      return null;
    }
  }

  return <>{children}</>;
}
