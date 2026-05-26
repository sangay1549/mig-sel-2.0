import { GrievanceMap } from '@/features/auth/grievance/components/grievance-map';
import { MapDock } from '@/components/layout/map-dock';
import { FilterLayersSheet } from '@/features/auth/grievance/components/filter-layers-sheet';
import { useMapFilters } from '@/features/auth/grievance/hooks/use-map-filters';
import { useMyLocation } from '@/hooks/use-my-location';

export const MapPage = () => {
  const {
    filters,
    isLayerSheetOpen,
    setIsLayerSheetOpen,
    toggleCategory,
    setMapStyle,
    setShowResolved,
    setTimeframe,
  } = useMapFilters();

  const { userLocation, isLocating, error, locate } = useMyLocation();

  return (
    <div className="bg-background flex h-dvh flex-col overflow-hidden font-sans">
      <GrievanceMap filters={filters} userLocation={userLocation} onMapStyleChange={setMapStyle} />
      <MapDock
        onOpenLayers={() => setIsLayerSheetOpen(true)}
        onLocate={locate}
        isLocating={isLocating}
        locationError={error}
      />
      <FilterLayersSheet
        open={isLayerSheetOpen}
        onOpenChange={setIsLayerSheetOpen}
        filters={filters}
        onMapStyleChange={setMapStyle}
        onToggleCategory={toggleCategory}
        onShowResolvedChange={setShowResolved}
        onTimeframeChange={setTimeframe}
      />
    </div>
  );
};
