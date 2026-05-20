import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useGrievances } from '../api/use-grievances';
import { useGeoLocation } from '../hooks/use-geo-location';
import {
  Search,
  Loader2,
  Navigation,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Map as MapIcon,
  Satellite as SatelliteIcon,
  ArrowRight,
} from 'lucide-react';
import { DirectionsControl } from './directions-control';

const SARPANG_BOUNDS = L.latLngBounds([26.7032, 89.9213], [27.2401, 90.7235]);

function categoryIcon(category: string, status: string): L.DivIcon {
  const colors: Record<string, string> = {
    road: '#d97706',
    garbage: '#2563eb',
    lighting: '#ca8a04',
    drainage: '#0891b2',
    other: '#154212',
    default: '#154212',
  };

  const color = colors[category] ?? colors.default;

  const icons: Record<string, string> = {
    road: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M2 12h3.5l1.5-4 4 8 3-6 2 4H22"/><path d="M2 20V4"/></svg>`,
    garbage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`,
    lighting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
    drainage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M14 2v8a2 2 0 0 0 2 2h4"/><path d="M2 18h4a2 2 0 0 1 2 2v2"/><path d="M4 22h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H8a2 2 0 0 1-2-2V4"/></svg>`,
    other: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const svg = icons[category] ?? icons.other;

  const isResolved = status === 'resolved';

  return L.divIcon({
    html: `<div style="
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.25), 0 0 0 2px ${color}44;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
        ${isResolved ? 'opacity: 0.7; filter: saturate(0.5);' : ''}
      ">
        ${svg}
      </div>
      ${
        !isResolved
          ? `<div style="
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
      "></div>`
          : ''
      }
    </div>`,
    className: '',
    iconSize: [40, 48],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
}

function clusterIcon(count: number): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 44px;
        height: 44px;
        background: #1f2937;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 12px rgba(0,0,0,0.3), 0 0 0 3px rgba(31,41,55,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 15px;
        font-family: system-ui, sans-serif;
      ">
        ${count}
      </div>
    </div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function ClusterPopup({
  grievances,
  lat,
  lng,
  onNavigate,
}: {
  grievances: Array<{
    id: string;
    title: string;
    category: string;
    mapStatus: string;
    desc: string;
    image_url: string;
    resolved_image_url?: string;
  }>;
  lat: number;
  lng: number;
  onNavigate: (lat: number, lng: number, title: string) => void;
}) {
  return (
    <div className="max-h-[300px] max-w-[260px] overflow-y-auto font-sans">
      <p className="sticky top-0 bg-white pb-1.5 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
        {grievances.length} reports at this location
      </p>
      <div className="space-y-2">
        {grievances.map((g) => (
          <div key={g.id} className="border-t border-gray-100 pt-2 first:border-t-0 first:pt-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm leading-tight font-semibold text-gray-900">{g.title}</h4>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                  g.mapStatus === 'pending'
                    ? 'bg-red-100 text-red-700'
                    : g.mapStatus === 'in-progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {g.mapStatus === 'in-progress'
                  ? 'In Progress'
                  : g.mapStatus === 'pending'
                    ? 'Pending'
                    : 'Resolved'}
              </span>
            </div>

            {g.image_url && (
              <img
                src={g.image_url}
                alt=""
                className="mt-1.5 h-20 w-full rounded-lg object-cover"
              />
            )}

            {g.desc && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600">{g.desc}</p>
            )}

            <div className="mt-1 text-[11px] font-medium text-gray-500">
              Category:{' '}
              <strong className="text-gray-800 uppercase">{categoryLabel(g.category)}</strong>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onNavigate(lat, lng, `${grievances.length} reports`)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
      >
        <Navigation className="h-3.5 w-3.5" />
        Directions to this location
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function mapStatus(status: string): string {
  if (status === 'submitted' || status === 'in_review') return 'pending';
  if (status === 'assigned' || status === 'in_progress') return 'in-progress';
  if (status === 'resolved' || status === 'closed') return 'resolved';
  return 'pending';
}

const CATEGORY_LABELS: Record<string, string> = {
  road: 'Road Damage',
  garbage: 'Waste Management',
  lighting: 'Street Lighting',
  drainage: 'Drainage/Sewage',
  other: 'Other',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

const categoryConfig = [
  { key: 'all', label: 'All', color: '#154212' },
  { key: 'road', label: 'Road', color: '#d97706' },
  { key: 'garbage', label: 'Waste', color: '#2563eb' },
  { key: 'lighting', label: 'Lighting', color: '#ca8a04' },
  { key: 'drainage', label: 'Drainage', color: '#0891b2' },
  { key: 'other', label: 'Other', color: '#154212' },
];

function ZoomControls() {
  const map = useMap();

  return (
    <div
      className="leaflet-bottom leaflet-right flex flex-col gap-0.5"
      style={{ zIndex: 1000, marginBottom: 140, marginRight: 10 }}
    >
      <button
        onClick={() => map.zoomIn()}
        title="Zoom in"
        aria-label="Zoom in"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-t-lg bg-white shadow-md ring-1 ring-gray-200/60 transition-all hover:bg-gray-50 active:scale-95"
      >
        <Plus className="h-5 w-5 text-gray-700" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom out"
        aria-label="Zoom out"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-b-lg bg-white shadow-md ring-1 ring-gray-200/60 transition-all hover:bg-gray-50 active:scale-95"
      >
        <Minus className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
}

function SearchBox() {
  const map = useMap();
  return <MapSearch map={map} />;
}

function UserLocationDot({ accuracy }: { accuracy: number | null }) {
  const { coords: detectedCoords } = useGeoLocation();
  const map = useMap();

  useEffect(() => {
    if (!detectedCoords) return;

    const layers: L.Layer[] = [];

    if (accuracy != null && accuracy > 0 && accuracy < 500) {
      const accCircle = L.circle([detectedCoords.lat, detectedCoords.lng], {
        radius: accuracy,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.25,
      }).addTo(map);
      layers.push(accCircle);
    }

    const dot = L.circleMarker([detectedCoords.lat, detectedCoords.lng], {
      radius: 10,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.4,
      weight: 3,
      opacity: 0.9,
    }).addTo(map);
    layers.push(dot);

    const pulse = L.circleMarker([detectedCoords.lat, detectedCoords.lng], {
      radius: 6,
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.8,
      weight: 2,
    }).addTo(map);
    layers.push(pulse);

    return () => {
      layers.forEach((l) => map.removeLayer(l));
    };
  }, [detectedCoords, map, accuracy]);

  return null;
}

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { coords: detectedCoords } = useGeoLocation();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleLocate = useCallback(() => {
    setLocating(true);
    setError(null);

    if (detectedCoords) {
      map.flyTo([detectedCoords.lat, detectedCoords.lng], 15, { duration: 1.5 });
      setLocating(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocating(false);
      setError('Geolocation not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        setLocating(false);
      },
      (err) => {
        if (!mountedRef.current) return;
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. Enable access in browser settings.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('GPS/location unavailable. Make sure location is turned on.');
        } else {
          setError('Location request timed out. Try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }, [map, detectedCoords]);

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{ zIndex: 1000, marginBottom: 80, marginRight: 10 }}
    >
      {error && (
        <div
          onClick={() => setError(null)}
          className="absolute right-0 bottom-full mb-2 max-w-[220px] cursor-pointer rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm ring-1 ring-red-200"
        >
          {error}
        </div>
      )}
      <button
        onClick={handleLocate}
        disabled={locating}
        title="My Location"
        aria-label="My Location"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-gray-200/60 transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-wait disabled:opacity-50"
      >
        {locating ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-700" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-gray-700"
          >
            <line x1="12" x2="12" y1="2" y2="6" />
            <line x1="12" x2="12" y1="18" y2="22" />
            <line x1="2" x2="6" y1="12" y2="12" />
            <line x1="18" x2="22" y1="12" y2="12" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
      </button>
    </div>
  );
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function MapSearch({ map }: { map: L.Map }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prevQueryRef = useRef('');

  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      if (prevQueryRef.current !== query) {
        setIsSearching(false);
      }
      prevQueryRef.current = query;
      return;
    }

    prevQueryRef.current = query;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=5&countrycodes=BT`,
          { headers: { 'Accept-Language': 'en' } },
        );
        if (!res.ok) return;
        const data: SearchResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    map.flyTo([lat, lng], 16, { duration: 1.2 });
    setQuery(result.display_name.split(',')[0]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 z-[1000] w-[calc(100vw-2rem)] max-w-[320px]"
    >
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-lg ring-1 ring-gray-200/60 backdrop-blur-md">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search places in Sarpang..."
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
        {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      </div>
      {isOpen && results.length > 0 && (
        <div className="mt-1 max-h-60 overflow-y-auto rounded-xl bg-white shadow-lg ring-1 ring-gray-200/60">
          {results.map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(result)}
              className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-gray-50"
            >
              <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="line-clamp-2 text-gray-700">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapStyleSwitcher({
  mapStyle,
  onChange,
}: {
  mapStyle: 'street' | 'satellite';
  onChange: (style: 'street' | 'satellite') => void;
}) {
  return (
    <button
      onClick={() => onChange(mapStyle === 'street' ? 'satellite' : 'street')}
      className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 shadow-md ring-1 ring-gray-200/50 backdrop-blur-md transition-all hover:bg-white active:scale-95"
      title={mapStyle === 'street' ? 'Show satellite view' : 'Show map view'}
    >
      {mapStyle === 'street' ? (
        <>
          <SatelliteIcon className="h-4 w-4" />
          Satellite
        </>
      ) : (
        <>
          <MapIcon className="h-4 w-4" />
          Map
        </>
      )}
    </button>
  );
}

function FullscreenButton({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onchange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onchange);
    return () => document.removeEventListener('fullscreenchange', onchange);
  }, []);

  const toggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-md ring-1 ring-gray-200/50 backdrop-blur-md transition-all hover:bg-white active:scale-95"
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4 text-gray-700" />
      ) : (
        <Maximize2 className="h-4 w-4 text-gray-700" />
      )}
    </button>
  );
}

function ScaleControl() {
  const map = useMap();

  useEffect(() => {
    const scale = L.control.scale({
      position: 'bottomleft',
      imperial: false,
      metric: true,
    });
    scale.addTo(map);
    return () => {
      scale.remove();
    };
  }, [map]);

  return null;
}

function NavigateButton({
  lat,
  lng,
  title,
  onNavigate,
}: {
  lat: number;
  lng: number;
  title: string;
  onNavigate: (lat: number, lng: number, title: string) => void;
}) {
  const map = useMap();

  return (
    <button
      onClick={() => {
        map.closePopup();
        onNavigate(lat, lng, title);
      }}
      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
    >
      <Navigation className="h-3.5 w-3.5" />
      Directions
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

export const GrievanceMap = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [directionsTarget, setDirectionsTarget] = useState<{
    lat: number;
    lng: number;
    title: string;
  } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { coords: detectedCoords, accuracy } = useGeoLocation();
  const { data: grievances, isLoading, isError, error } = useGrievances();

  const DEFAULT_CENTER = { lat: 26.9312, lng: 90.4795 };

  const mappedGrievances = (grievances ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    status: g.status,
    mapStatus: mapStatus(g.status),
    lat: g.latitude === 0 && g.longitude === 0 ? DEFAULT_CENTER.lat : g.latitude,
    lng: g.latitude === 0 && g.longitude === 0 ? DEFAULT_CENTER.lng : g.longitude,
    desc: g.description,
    image_url: g.image_url,
    resolved_image_url: g.resolved_image_url,
  }));

  const filteredGrievances =
    activeFilter === 'all'
      ? mappedGrievances
      : mappedGrievances.filter((g) => g.category === activeFilter);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2 pb-2">
        {categoryConfig.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
              activeFilter === key
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
            style={
              activeFilter === key ? { backgroundColor: color, borderColor: color } : undefined
            }
          >
            {key !== 'all' && (
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            )}
            {label}
          </button>
        ))}
      </div>

      <div
        ref={mapContainerRef}
        className="group relative h-[calc(100dvh-13rem)] min-h-[400px] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-lg md:h-[550px]"
      >
        {isLoading && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/60">
            <p className="text-sm font-medium text-gray-500">Loading reports...</p>
          </div>
        )}

        {isError && (
          <div className="absolute top-4 left-4 z-[1001] rounded-xl bg-red-50 px-4 py-2 text-xs text-red-700 shadow-sm ring-1 ring-red-200">
            Failed to load reports. {error?.message}
          </div>
        )}

        <MapContainer
          center={[26.9312, 90.4795]}
          zoom={13}
          minZoom={11}
          maxZoom={17}
          maxBounds={SARPANG_BOUNDS}
          maxBoundsViscosity={1.0}
          className="z-0 h-full w-full"
          zoomControl={false}
        >
          <ScaleControl />

          {mapStyle === 'street' ? (
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          ) : (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/World_Imagery_with_Labels/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />
          )}

          <ZoomControls />

          <SearchBox />

          <UserLocationDot accuracy={accuracy} />

          <LocateButton />

          {directionsTarget && (
            <DirectionsControl
              destination={directionsTarget}
              currentCoords={detectedCoords}
              onClose={() => setDirectionsTarget(null)}
            />
          )}

          {(() => {
            const groupedByLocation = filteredGrievances.reduce<
              Map<string, typeof filteredGrievances>
            >((acc, g) => {
              const key = `${g.lat},${g.lng}`;
              if (!acc.has(key)) acc.set(key, []);
              acc.get(key)!.push(g);
              return acc;
            }, new Map());

            return Array.from(groupedByLocation.entries()).map(([key, grievances]) => {
              if (grievances.length === 1) {
                const g = grievances[0];
                return (
                  <Marker
                    key={g.id}
                    position={[g.lat, g.lng]}
                    icon={categoryIcon(g.category, g.mapStatus)}
                  >
                    <Popup>
                      <div className="max-w-[250px] font-sans">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm leading-tight font-semibold text-gray-900">
                            {g.title}
                          </h4>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              g.mapStatus === 'pending'
                                ? 'bg-red-100 text-red-700'
                                : g.mapStatus === 'in-progress'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {g.mapStatus === 'in-progress'
                              ? 'In Progress'
                              : g.mapStatus === 'pending'
                                ? 'Pending'
                                : 'Resolved'}
                          </span>
                        </div>

                        {g.image_url && (
                          <img
                            src={g.image_url}
                            alt="Complaint"
                            className="mt-2 h-32 w-full rounded-lg object-cover"
                          />
                        )}

                        {g.resolved_image_url && g.mapStatus === 'resolved' && (
                          <div className="mt-2">
                            <p className="text-[10px] font-bold tracking-wider text-green-600 uppercase">
                              Resolved — Before / After
                            </p>
                            <div className="mt-1 flex gap-1">
                              <img
                                src={g.image_url}
                                alt="Before"
                                className="h-20 w-1/2 rounded-lg object-cover ring-1 ring-gray-200"
                              />
                              <img
                                src={g.resolved_image_url}
                                alt="After"
                                className="h-20 w-1/2 rounded-lg object-cover ring-1 ring-green-300"
                              />
                            </div>
                          </div>
                        )}

                        <p className="mt-2 text-xs leading-relaxed text-gray-600">{g.desc}</p>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] font-medium text-gray-500">
                          <span>
                            Category:{' '}
                            <strong className="text-gray-800 uppercase">
                              {categoryLabel(g.category)}
                            </strong>
                          </span>
                        </div>
                        {g.lat !== DEFAULT_CENTER.lat && g.lng !== DEFAULT_CENTER.lng && (
                          <NavigateButton
                            lat={g.lat}
                            lng={g.lng}
                            title={g.title}
                            onNavigate={(lat, lng, title) =>
                              setDirectionsTarget({ lat, lng, title })
                            }
                          />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }

              return (
                <Marker
                  key={key}
                  position={[grievances[0].lat, grievances[0].lng]}
                  icon={clusterIcon(grievances.length)}
                >
                  <Tooltip>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">
                        {grievances.length} reports at this location
                      </p>
                      {grievances.map((g) => (
                        <p key={g.id} className="text-xs text-gray-600">
                          • {g.title || 'Untitled'}
                        </p>
                      ))}
                    </div>
                  </Tooltip>
                  <Popup>
                    <ClusterPopup
                      grievances={grievances}
                      lat={grievances[0].lat}
                      lng={grievances[0].lng}
                      onNavigate={(lat, lng, title) => setDirectionsTarget({ lat, lng, title })}
                    />
                  </Popup>
                </Marker>
              );
            });
          })()}
          {filteredGrievances.map((grievance) => (
            <Marker
              key={grievance.id}
              position={[grievance.lat, grievance.lng]}
              icon={categoryIcon(grievance.category, grievance.mapStatus)}
            >
              <Popup>
                <div className="max-w-[250px] font-sans">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm leading-tight font-semibold text-gray-900">
                      {grievance.title}
                    </h4>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        grievance.mapStatus === 'pending'
                          ? 'bg-red-100 text-red-700'
                          : grievance.mapStatus === 'in-progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {grievance.mapStatus === 'in-progress'
                        ? 'In Progress'
                        : grievance.mapStatus === 'pending'
                          ? 'Pending'
                          : 'Resolved'}
                    </span>
                  </div>

                  {grievance.image_url && (
                    <img
                      src={grievance.image_url}
                      alt="Complaint"
                      className="mt-2 h-32 w-full rounded-lg object-cover"
                    />
                  )}

                  {grievance.resolved_image_url && grievance.mapStatus === 'resolved' && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold tracking-wider text-green-600 uppercase">
                        Resolved — Before / After
                      </p>
                      <div className="mt-1 flex gap-1">
                        <img
                          src={grievance.image_url}
                          alt="Before"
                          className="h-20 w-1/2 rounded-lg object-cover ring-1 ring-gray-200"
                        />
                        <img
                          src={grievance.resolved_image_url}
                          alt="After"
                          className="h-20 w-1/2 rounded-lg object-cover ring-1 ring-green-300"
                        />
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{grievance.desc}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] font-medium text-gray-500">
                    <span>
                      Category:{' '}
                      <strong className="text-gray-800 uppercase">
                        {categoryLabel(grievance.category)}
                      </strong>
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/[0.03]" />

        <div className="absolute top-4 right-4 z-[40] flex items-center gap-2">
          <MapStyleSwitcher mapStyle={mapStyle} onChange={setMapStyle} />
          <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold tracking-wide text-gray-700 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
          <FullscreenButton containerRef={mapContainerRef} />
        </div>

        <div className="absolute right-4 bottom-4 z-[40] flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {detectedCoords
            ? `${detectedCoords.lat.toFixed(4)}, ${detectedCoords.lng.toFixed(4)}`
            : 'Sarpang, Bhutan'}
        </div>

        <div className="absolute bottom-4 left-4 z-[40] flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" />
            <span>Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            <span>Waste</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ca8a04]" />
            <span>Lighting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0891b2]" />
            <span>Drainage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#154212]" />
            <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  );
};
