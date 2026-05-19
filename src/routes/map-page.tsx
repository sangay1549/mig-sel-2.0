import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map.tsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Leaf } from 'lucide-react';

export const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcf9f8' }}>
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6" style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: '#154212' }}>
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#1c1b1b' }}>Migsel</span>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase" style={{ backgroundColor: '#d6e4cc', color: '#3e4a38' }}>
            Complaint Portal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{ color: '#42493e' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{ color: '#42493e' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit
          </Button>
        </div>
      </nav>

      <main className="mx-auto px-4 py-6 sm:px-6" style={{ maxWidth: '1200px' }}>
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1c1b1b' }}>Report an Issue</h1>
          <p className="mt-1 text-sm" style={{ color: '#72796e' }}>
            Select a location on the map or use your current location to file a complaint.
          </p>
        </div>
        <div className="animate-slide-up overflow-hidden rounded-xl border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div className="p-4">
            <GrievanceMap />
          </div>
        </div>
      </main>
    </div>
  );
};
