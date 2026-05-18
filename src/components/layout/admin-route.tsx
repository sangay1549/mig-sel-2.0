import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/features/auth/api/use-session';

export const AdminRoute = () => {
  const { data: session } = useSession();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-role', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) return null;

  if (profile?.role !== 'admin') return <Navigate to="/map" replace />;

  return <Outlet />;
};
