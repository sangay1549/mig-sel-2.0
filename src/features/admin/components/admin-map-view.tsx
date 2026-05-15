import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useMapTickets } from '@/features/map/api/use-map-tickets';
import { GMC_BOUNDS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/features/map/types';
import { TicketStatusBadge } from '@/features/tickets/components/ticket-status-badge';
import type { TicketStatus } from '@/features/tickets/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { useEffect, useMemo } from 'react';
import type { MapTicketPin } from '@/features/map/types';
import 'leaflet/dist/leaflet.css';

const createClusterIcon = (count: number, isUrgent: boolean) =>
  divIcon({
    html: `<div class="${isUrgent ? 'bg-destructive' : 'bg-primary'} text-primary-foreground flex size-10 items-center justify-center rounded-full text-sm font-bold shadow-lg border-2 border-white">${count}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const createPinIcon = (priority: string) =>
  divIcon({
    html: `<div class="size-4 rounded-full border-2 border-white shadow ${priority === 'urgent' ? 'bg-destructive' : 'bg-primary'}"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const ClusterLayer = ({ pins }: { pins: MapTicketPin[] }) => {
  const clusters = useMemo(() => {
    const grid = new Map<string, MapTicketPin[]>();

    pins.forEach((pin) => {
      const key = `${Math.round(pin.latitude * 100)},${Math.round(pin.longitude * 100)}`;
      const existing = grid.get(key) ?? [];
      existing.push(pin);
      grid.set(key, existing);
    });

    return Array.from(grid.entries()).map(([key, clusterPins]) => {
      key.split(',').map(Number);
      const avgLat = clusterPins.reduce((s, p) => s + p.latitude, 0) / clusterPins.length;
      const avgLng = clusterPins.reduce((s, p) => s + p.longitude, 0) / clusterPins.length;
      const hasUrgent = clusterPins.some((p) => p.priority_level === 'urgent');

      return {
        position: [avgLat, avgLng] as [number, number],
        pins: clusterPins,
        count: clusterPins.length,
        hasUrgent,
      };
    });
  }, [pins]);

  return (
    <>
      {clusters.map((cluster) =>
        cluster.count === 1 ? (
          <Marker
            key={cluster.pins[0].id}
            position={cluster.position}
            icon={createPinIcon(cluster.pins[0].priority_level)}
          >
            <Popup>
              <div className="min-w-[200px] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{cluster.pins[0].category_name}</span>
                  <TicketStatusBadge status={cluster.pins[0].status as TicketStatus} />
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {cluster.pins[0].description}
                </p>
                <Button variant="link" size="xs" asChild>
                  <Link to={`/admin/tickets/${cluster.pins[0].id}`}>View details</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ) : (
          <Marker
            key={`cluster-${cluster.position[0]}-${cluster.position[1]}`}
            position={cluster.position}
            icon={createClusterIcon(cluster.count, cluster.hasUrgent)}
          >
            <Popup>
              <div className="space-y-2">
                <p className="text-sm font-semibold">{cluster.count} issues near here</p>
                {cluster.pins.slice(0, 5).map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{pin.category_name}</span>
                    <TicketStatusBadge status={pin.status as TicketStatus} />
                  </div>
                ))}
                {cluster.count > 5 ? (
                  <p className="text-muted-foreground text-xs">+{cluster.count - 5} more</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ),
      )}
    </>
  );
};

const FitBounds = ({ pins }: { pins: MapTicketPin[] }) => {
  const map = useMap();

  useEffect(() => {
    if (pins.length > 0) {
      const latLngs = pins.map((p) => [p.latitude, p.longitude] as [number, number]);
      if (latLngs.length > 0) {
        map.fitBounds(latLngs, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [pins, map]);

  return null;
};

export const AdminMapView = () => {
  const { data: pins, isLoading } = useMapTickets();

  if (isLoading) {
    return (
      <div className="bg-muted flex h-[500px] items-center justify-center rounded-sm">
        <p className="text-muted-foreground text-sm">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] overflow-hidden rounded-sm">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        maxBounds={GMC_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pins ? <ClusterLayer pins={pins} /> : null}
        {pins ? <FitBounds pins={pins} /> : null}
      </MapContainer>
    </div>
  );
};
