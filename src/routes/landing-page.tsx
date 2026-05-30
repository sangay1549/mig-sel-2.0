import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useSignInWithGoogle } from '@/features/auth/api/use-sign-in-with-google';
import { useSession } from '@/features/auth/api/use-session';
import { supabase } from '@/lib/supabase';
import { Shield, MapPin, Zap } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession();
  const signInWithGoogle = useSignInWithGoogle();
  const dbCheckedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && session) {
      const metadataRole = session.user?.app_metadata?.role ?? session.user?.user_metadata?.role;
      if (metadataRole === 'admin' || metadataRole === 'inspector' || metadataRole === 'official') {
        if (metadataRole === 'admin') navigate('/dashboard', { replace: true });
        else if (metadataRole === 'inspector') navigate('/inspector', { replace: true });
        else if (metadataRole === 'official') navigate('/official', { replace: true });
        return;
      }
      if (!dbCheckedRef.current) {
        dbCheckedRef.current = true;
        (async () => {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          const role = data?.role;
          if (role === 'admin') navigate('/dashboard', { replace: true });
          else if (role === 'inspector') navigate('/inspector', { replace: true });
          else if (role === 'official') navigate('/official', { replace: true });
          else navigate('/community', { replace: true });
        })();
      }
    }
  }, [session, isLoading, navigate]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="gradient-green absolute inset-0" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
            <span className="text-3xl font-black text-white">G</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            GMC Civic
            <br />
            Connect
          </h1>
          <p className="mt-2 text-sm font-medium text-white/70">
            Gelephu Mindfulness City
          </p>
        </div>

        <div className="mb-10 grid w-full max-w-xs sm:max-w-sm md:max-w-md grid-cols-3 gap-3">
          {[
            { icon: MapPin, label: 'Report Issues' },
            { icon: Zap, label: 'Track Status' },
            { icon: Shield, label: 'Community' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-sm"
            >
              <Icon className="h-5 w-5 text-white" />
              <span className="text-[10px] font-semibold text-white/80">{label}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm md:max-w-md space-y-3">
          <Button
            onClick={() => signInWithGoogle.mutate()}
            disabled={signInWithGoogle.isPending}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-bold text-emerald-900 shadow-lg transition-all hover:bg-white/90 hover:shadow-xl active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                fill="#EA4335"
              />
            </svg>
            {signInWithGoogle.isPending ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <p className="text-center text-xs text-white/50">
            Secure civic platform for Gelephu residents
          </p>
        </div>
      </div>
    </div>
  );
};
