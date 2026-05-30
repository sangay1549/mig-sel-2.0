import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/features/auth/api/use-session';

export const useIsOfficial = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['profile-role-official', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      const metadataRole =
        (session.user?.app_metadata?.role as string | undefined) ??
        (session.user?.user_metadata?.role as string | undefined);
      return (data?.role ?? metadataRole) === 'official';
    },
    enabled: !!session?.user?.id,
  });
};
