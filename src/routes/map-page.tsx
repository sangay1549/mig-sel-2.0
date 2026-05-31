import { useNavigate } from 'react-router';
import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map';
import { ArrowLeft, Layers, MapPin } from 'lucide-react';

export const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <GrievanceMap />

      <button
        onClick={() => navigate(-1)}
        className="glass absolute top-4 left-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <ArrowLeft className="text-foreground h-5 w-5" />
      </button>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="glass flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all hover:scale-105">
          <Layers className="text-foreground h-5 w-5" />
        </button>
        <button className="glass flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all hover:scale-105">
          <MapPin className="text-foreground h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
