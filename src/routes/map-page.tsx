import { useState, useEffect, useRef, useMemo } from 'react';
import { Locate, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fixes missing leaflet marker styles in bundlers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapPageProps {
  onSelectLocation?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

// Strict geographical boundaries for Sarpang Dzongkhag, Bhutan
const SARPANG_BOUNDS: L.LatLngBoundsExpression = [
  [26.7, 89.95], // Southwest
  [27.15, 90.75], // Northeast
];

const SARPANG_CENTER: [number, number] = [26.8642, 90.4877];

export const MapPage = ({
  onSelectLocation: externalOnSelectLocation,
  selectedLocation: externalSelectedLocation,
}: MapPageProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [internalSelectedLocation, setInternalSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const onSelectLocation = useMemo(
    () =>
      externalOnSelectLocation ??
      ((lat: number, lng: number) => setInternalSelectedLocation({ lat, lng })),
    [externalOnSelectLocation],
  );
  const selectedLocation = externalSelectedLocation ?? internalSelectedLocation;

  // 1. Initialize the native Leaflet map once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance manually
    const map = L.map(mapContainerRef.current, {
      center: SARPANG_CENTER,
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: SARPANG_BOUNDS,
      maxBoundsViscosity: 1.0,
      scrollWheelZoom: true,
    });

    // Add standard Google-style OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Click handler event listener inside Sarpang district boundary
    map.on('click', (e: L.LeafletMouseEvent) => {
      const bounds = L.latLngBounds(SARPANG_BOUNDS);
      if (bounds.contains(e.latlng)) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      } else {
        alert('Please select a location within Sarpang Dzongkhag.');
      }
    });

    mapRef.current = map;

    // Cleanup map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onSelectLocation]);

  // 2. React to prop updates when selectedLocation changes (Add/Move Pin)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedLocation) {
      const pos: [number, number] = [selectedLocation.lat, selectedLocation.lng];

      // Update or create the marker pin position
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        markerRef.current = L.marker(pos, { icon: DefaultIcon }).addTo(map).bindPopup(`
            <div style="text-align: center; font-family: sans-serif; font-size: 12px;">
              <p style="margin: 0; font-weight: bold; color: #0f172a;">Sarpang Location</p>
              <p style="margin: 2px 0 0 0; color: #64748b; font-family: monospace;">
                ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}
              </p>
            </div>
          `);
      }

      // Pan to the selected target smoothly
      map.setView(pos, map.getZoom());
    } else {
      // Remove marker if location cleared
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [selectedLocation]);

  // 3. Geolocation browser feature action ("Find Me")
  const handleFindMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!navigator.geolocation) {
      alert('Your browser does not support tracking features.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLatLng = L.latLng(latitude, longitude);
        const bounds = L.latLngBounds(SARPANG_BOUNDS);

        if (bounds.contains(userLatLng)) {
          onSelectLocation(latitude, longitude);
        } else {
          alert(
            'Your detected location is outside Sarpang Dzongkhag. Map centered back to Sarpang.',
          );
          if (mapRef.current) {
            mapRef.current.setView(SARPANG_CENTER, 12);
          }
        }
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Couldn't grab GPS location. Please tap manually inside Sarpang.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="isolation-blur relative h-[60vh] min-h-[450px] w-full overflow-hidden rounded-xl">
      {/* Floating Control: Find Me button */}
      <button
        onClick={handleFindMe}
        disabled={isLocating}
        type="button"
        className="absolute right-5 bottom-5 z-[9999] flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-md transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
      >
        {isLocating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
        ) : (
          <Locate className="h-3.5 w-3.5 text-blue-500" />
        )}
        {isLocating ? 'Locating...' : 'Find Me'}
      </button>

      {/* Real Map Root Target Div */}
      <div ref={mapContainerRef} className="z-0 h-full w-full" style={{ background: '#f8fafc' }} />
    </div>
  );
};
