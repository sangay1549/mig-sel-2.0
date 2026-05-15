import { Outlet } from 'react-router';
import { Navbar } from './navbar';

export const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
