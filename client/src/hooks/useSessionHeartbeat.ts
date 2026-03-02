import { useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const INACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * Sends a heartbeat to the server every 2 minutes while the user is active.
 * If the server returns a 401/403 (session expired due to inactivity), the
 * user is redirected to /login with an "expired" query param.
 *
 * Usage: call this hook once in a top-level authenticated layout component.
 */
export function useSessionHeartbeat() {
  const [, setLocation] = useLocation();
  const lastActivityRef = useRef(Date.now());
  const heartbeatMutation = trpc.auth.heartbeat.useMutation({
    onError: (err) => {
      // If the server rejects the session (inactivity expiry), redirect to login
      const code = (err as any)?.data?.code ?? (err as any)?.shape?.data?.code;
      if (code === 'FORBIDDEN' || code === 'UNAUTHORIZED' || (err.message && err.message.toLowerCase().includes('inactiv'))) {
        setLocation('/login?reason=expired');
      }
    },
  });

  const sendHeartbeat = useCallback(() => {
    // Only send if the user has been active in the last 5 minutes
    const idleMs = Date.now() - lastActivityRef.current;
    if (idleMs < 5 * 60 * 1000) {
      heartbeatMutation.mutate();
    }
  }, [heartbeatMutation]);

  useEffect(() => {
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    INACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, updateActivity, { passive: true }));

    // Send an initial heartbeat on mount
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      INACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, updateActivity));
      clearInterval(interval);
    };
  }, [sendHeartbeat]);
}
