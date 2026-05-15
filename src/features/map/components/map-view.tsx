import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useMapTickets } from '../api/use-map-tickets';
import { DEFAULT_CENTER, DEFAULT_ZOOM, GMC_BOUNDS } from '../types';
import { Button } from '@/components/ui/button';
import { TicketStatusBadge } from '@/features/tickets/components/ticket-status-badge';
import type { TicketStatus } from '@/features/tickets/types';
import { Link } from 'react-router';
import 'leaflet/dist/leaflet.css';

const urgentIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const resolvedIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getIcon = (priority: string, status: string) => {
  if (status === 'resolved' || status === 'closed') return resolvedIcon;
  if (priority === 'urgent') return urgentIcon;
  return defaultIcon;
};

type MapClickHandlerProps = {
  onMapClick: (lat: number, lng: number) => void;
  interactive?: boolean;
};

const MapClickHandler = ({ onMapClick, interactive }: MapClickHandlerProps) => {
  useMapEvents({
    click: (e) => {
      if (interactive) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

type MapViewProps = {
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  height?: string;
};

export const MapView = ({
  interactive,
  onLocationSelect,
  selectedLocation,
  height = '400px',
}: MapViewProps) => {
  const { data: pins } = useMapTickets();
  const [error] = useState(false);

  const handleClick = (lat: number, lng: number) => {
    onLocationSelect?.(lat, lng);
  };

  if (error) {
    return (
      <div className="bg-muted flex items-center justify-center rounded-sm" style={{ height }}>
        <p className="text-muted-foreground text-sm">Map unavailable</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="overflow-hidden rounded-sm">
      <MapContainer
        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        maxBounds={GMC_BOUNDS}
        maxBoundsViscosity={1.0}
        whenReady={() => {}}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {interactive ? <MapClickHandler onMapClick={handleClick} interactive /> : null}

        {pins?.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={getIcon(pin.priority_level, pin.status)}
          >
            <Popup>
              <div className="min-w-[200px] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{pin.category_name}</span>
                  <TicketStatusBadge status={pin.status as TicketStatus} />
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs">{pin.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {pin.support_count > 0 ? `${pin.support_count} supports` : ''}
                  </span>
                  <Button variant="link" size="xs" asChild>
                    <Link to={`/tickets/${pin.id}`}>View details</Link>
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedLocation ? (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>Selected location</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
};
