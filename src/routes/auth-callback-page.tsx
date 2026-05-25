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
      const { error: initError } = await supabase.auth.initialize();
      if (initError) {
        if (!cancelled) navigate('/');
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!cancelled) {
        if (error || !session) {
          navigate('/');
          return;
        }
        redirectByRole(session);
      }
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
