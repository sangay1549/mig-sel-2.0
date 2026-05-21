import { Navigate, Outlet } from 'react-router';
import { useIsAdmin } from '@/features/auth/api/use-is-admin';

export const AdminRoute = () => {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return null;

  if (!isAdmin) return <Navigate to="/map" replace />;

  return <Outlet />;
};
