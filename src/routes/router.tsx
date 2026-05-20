import { createBrowserRouter, redirect } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LandingPage } from './landing-page';
import { AdminPage } from './admin-page';
import { LoginPage } from './login-page';
import { NotFoundPage } from './not-found-page';
import { AuthCallbackPage } from './auth-callback-page';
import { MapPage } from './map-page';
import { ComplaintDetailPage } from './complaint-detail-page';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AdminRoute } from '@/components/layout/admin-route';

export const router = createBrowserRouter([
  {
    path: '/',
    loader: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') return redirect('/dashboard');
      return redirect('/map');
    },
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/map',
    element: <ProtectedRoute />,
    children: [{ index: true, element: <MapPage /> }],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          { index: true, element: <AdminPage /> },
          { path: 'complaint/:id', element: <ComplaintDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
