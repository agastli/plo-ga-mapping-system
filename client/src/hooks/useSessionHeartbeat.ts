import { useEffect, useRef, useCallback, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;   // send heartbeat every 2 min
const INACTIVITY_LIMIT_MS   = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_BEFORE_MS     = 5 * 60 * 1000;   // show warning 5 min before expiry
const INACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export interface SessionHeartbeatState {
  /** True when the session will expire in ≤5 minutes */
  warningVisible: boolean;
  /** Seconds remaining until expiry (only meaningful when warningVisible=true) */
  secondsRemaining: number;
  /** Call this to reset the inactivity timer and hide the warning */
  stayLoggedIn: () => void;
}

/**
 * Sends a heartbeat to the server every 2 minutes while the user is active.
 * Shows a countdown warning 5 minutes before the 2-hour inactivity limit.
 * If the server rejects the session, redirects to /login?reason=expired.
 *
 * Usage: call this hook once in a top-level authenticated layout component.
 */
export function useSessionHeartbeat(): SessionHeartbeatState {
  const [, setLocation] = useLocation();
  const lastActivityRef = useRef(Date.now());
  const [warningVisible, setWarningVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  const heartbeatMutation = trpc.auth.heartbeat.useMutation({
    onError: (err) => {
      const code = (err as any)?.data?.code ?? (err as any)?.shape?.data?.code;
      if (
        code === 'FORBIDDEN' ||
        code === 'UNAUTHORIZED' ||
        (err.message && err.message.toLowerCase().includes('inactiv'))
      ) {
        setLocation('/login?reason=expired');
      }
    },
  });

  const sendHeartbeat = useCallback(() => {
    const idleMs = Date.now() - lastActivityRef.current;
    if (idleMs < 5 * 60 * 1000) {
      heartbeatMutation.mutate();
    }
  }, [heartbeatMutation]);

  const stayLoggedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    setWarningVisible(false);
    setSecondsRemaining(300);
    heartbeatMutation.mutate();
  }, [heartbeatMutation]);

  // Heartbeat interval
  useEffect(() => {
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    INACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, updateActivity, { passive: true }));
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => {
      INACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, updateActivity));
      clearInterval(interval);
    };
  }, [sendHeartbeat]);

  // Countdown ticker — runs every second to check inactivity and update countdown
  useEffect(() => {
    const tick = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      const msUntilExpiry = INACTIVITY_LIMIT_MS - idleMs;

      if (msUntilExpiry <= 0) {
        // Already expired — the next heartbeat/request will redirect; pre-emptively redirect
        setLocation('/login?reason=expired');
        return;
      }

      if (msUntilExpiry <= WARNING_BEFORE_MS) {
        setWarningVisible(true);
        setSecondsRemaining(Math.ceil(msUntilExpiry / 1000));
      } else {
        setWarningVisible(false);
        setSecondsRemaining(300);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [setLocation]);

  return { warningVisible, secondsRemaining, stayLoggedIn };
}
