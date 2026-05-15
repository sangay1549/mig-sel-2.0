import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/root-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { HomePage } from './home-page';
import { LoginPage } from './login-page';
import { SignUpPage } from './sign-up-page';
import { ForgotPasswordPage } from './forgot-password-page';
import { ResetPasswordPage } from './reset-password-page';
import { TicketsListPage } from './tickets-list-page';
import { TicketDetailPage } from './ticket-detail-page';
import { SubmitTicketPage } from './submit-ticket-page';
import { MapPage } from './map-page';
import { MyReportsPage } from './my-reports-page';
import { AdminDashboardPage } from './admin/admin-dashboard-page';
import { AdminTicketDetailPage } from './admin/admin-ticket-detail-page';
import { NotFoundPage } from './not-found-page';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/tickets', element: <TicketsListPage /> },
      { path: '/tickets/:id', element: <TicketDetailPage /> },
      { path: '/report', element: <SubmitTicketPage /> },
      { path: '/map', element: <MapPage /> },

      // Routes that require an authenticated user
      {
        element: <ProtectedRoute />,
        children: [{ path: '/my-reports', element: <MyReportsPage /> }],
      },

      // Admin routes (also protected)
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/tickets/:id', element: <AdminTicketDetailPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
