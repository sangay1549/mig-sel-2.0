import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        navigate('/');
        return;
      }

      if (profile.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/map');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950 text-white">
      <p className="animate-pulse text-sm tracking-wide">Verifying credentials...</p>
    </div>
  );
};
