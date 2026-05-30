import { useNavigate } from 'react-router';
import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map';
import { ArrowLeft, Layers, MapPin, Shield } from 'lucide-react';

export const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <GrievanceMap />

      <button
        onClick={() => navigate(-1)}
        className="glass absolute top-4 left-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="glass flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all hover:scale-105">
          <Layers className="h-5 w-5 text-foreground" />
        </button>
        <button className="glass flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all hover:scale-105">
          <MapPin className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="absolute bottom-6 left-4 right-4 z-[1000] mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl">
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-green shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">Gelephu Monitoring</p>
              <p className="text-[10px] text-muted-foreground">24 active reports in your area</p>
            </div>
            <button
              onClick={() => navigate('/report')}
              className="gradient-green flex h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <MapPin className="h-4 w-4" />
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
