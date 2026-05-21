import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { getUserRole } from '@/lib/role-query';
import type { Session } from '@supabase/supabase-js';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const redirectByRole = async (session: Session) => {
      const role = await getUserRole(session);

      if (!cancelled) {
        navigate(role === 'admin' ? '/dashboard' : '/map');
      }
    };

    const handleAuthCallback = async () => {
      const auth = await supabase.auth.getSession();
      const session = auth.data.session;
      const sessionError = auth.error;

      if (sessionError) {
        navigate('/login');
        return;
      }

      if (session) {
        redirectByRole(session);
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession) {
          subscription.unsubscribe();
          redirectByRole(newSession);
        }
      });
    };

    handleAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950 text-white">
      <p className="animate-pulse text-sm tracking-wide">Verifying credentials...</p>
    </div>
  );
};
