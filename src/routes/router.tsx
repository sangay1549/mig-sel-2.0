import { createBrowserRouter, redirect } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getUserRole } from '@/lib/role-query';
import { AppShell } from '@/components/layout/app-shell';
import { LandingPage } from './landing-page';
import { LoginPage } from './login-page';
import { AdminPage } from './admin-page';
import { InspectorPage } from './inspector-page';
import { NotFoundPage } from './not-found-page';
import { AuthCallbackPage } from './auth-callback-page';
import { MapPage } from './map-page';
import { ReportPage } from './report-page';
import { ComplaintDetailPage } from './complaint-detail-page';
import { LeaderboardPage } from './leaderboard-page';
import { CommunityPage } from './community-page';
import { HomePage } from './home-page';
import { LifeUpdatePage } from './life-update-page';
import { MyReportsPage } from './my-reports-page';
import { MyPostsPage } from './my-posts-page';

import { ShopPage } from './shop-page';
import { ProfilePage } from './profile-page';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { AdminRoute } from '@/components/layout/admin-route';
import { InspectorRoute } from '@/components/layout/inspector-route';
import { OfficialRoute } from '@/components/layout/official-route';
import { OfficialPage } from './official-page';

export const router = createBrowserRouter([
  {
    path: '/',
    loader: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const role = await getUserRole(session);

      if (role === 'admin') return redirect('/dashboard');
      if (role === 'inspector') return redirect('/inspector');
      if (role === 'official') return redirect('/official');
      return redirect('/community');
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
    element: <AppShell />,
    children: [
      {
        path: '/home',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <HomePage /> }],
      },
      {
        path: '/map',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <MapPage /> }],
      },
      {
        path: '/report',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <ReportPage /> }],
      },
      {
        path: '/leaderboard',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <LeaderboardPage /> }],
      },
      {
        path: '/community',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <CommunityPage /> }],
      },
      {
        path: '/life-update',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <LifeUpdatePage /> }],
      },
      {
        path: '/shop',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <ShopPage /> }],
      },
      {
        path: '/my-reports',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <MyReportsPage /> }],
      },
      {
        path: '/my-posts',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <MyPostsPage /> }],
      },
      {
        path: '/profile',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <ProfilePage /> }],
      },
      {
        path: '/inspector',
        element: <ProtectedRoute />,
        children: [
          {
            element: <InspectorRoute />,
            children: [{ index: true, element: <InspectorPage /> }],
          },
        ],
      },
      {
        path: '/official',
        element: <ProtectedRoute />,
        children: [
          {
            element: <OfficialRoute />,
            children: [{ index: true, element: <OfficialPage /> }],
          },
        ],
      },
    ],
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
