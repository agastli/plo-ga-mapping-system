import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { data: user, isLoading: checkingAuth } = trpc.auth.me.useQuery();

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    if (user) {
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
          break;
      }
    }
  }, [user, setLocation]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success('Login successful');
      setLocation('/');
    },
    onError: (error) => {
      toast.error(error.message || 'Invalid username or password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon-50 to-maroon-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/qu-logo.png" 
              alt="QU Logo" 
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">PLOs-GAs Mapping System</CardTitle>
          <CardDescription>
            Sign in to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            
            <div className="mt-4 space-y-2 text-center text-sm">
              <button
                type="button"
                onClick={() => setLocation('/forgot-password')}
                className="text-[#8B1538] hover:underline block w-full"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setLocation('/recover-username')}
                className="text-[#8B1538] hover:underline block w-full"
              >
                Forgot Username?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
