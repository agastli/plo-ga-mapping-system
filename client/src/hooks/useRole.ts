import { trpc } from "@/lib/trpc";

/**
 * Hook to check current user's role
 * Returns role checking functions for easy conditional rendering
 */
export function useRole() {
  const { data: user } = trpc.auth.me.useQuery();
  
  const role = user?.role || "viewer";
  
  return {
    role,
    isAdmin: role === "admin",
    isEditor: role === "editor" || role === "admin",
    isViewer: role === "viewer",
    canEdit: role === "admin" || role === "editor",
    canManageUsers: role === "admin",
    canDelete: role === "admin",
  };
}
