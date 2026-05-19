import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

const SARPANG_BOUNDS = L.latLngBounds([26.7032, 89.9213], [27.2401, 90.7235]);

function categoryIcon(category: string, status: string): L.DivIcon {
  const colors: Record<string, string> = {
    road: '#d97706',
    garbage: '#2563eb',
    lighting: '#ca8a04',
    drainage: '#0891b2',
    default: '#154212',
  };

  const color = colors[category] ?? colors.default;

  const icons: Record<string, string> = {
    road: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M2 12h3.5l1.5-4 4 8 3-6 2 4H22"/><path d="M2 20V4"/></svg>`,
    garbage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`,
    lighting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
    drainage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M14 2v8a2 2 0 0 0 2 2h4"/><path d="M2 18h4a2 2 0 0 1 2 2v2"/><path d="M4 22h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H8a2 2 0 0 1-2-2V4"/></svg>`,
  };

  const svg = icons[category] ?? icons.road;

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

const MOCK_GRIEVANCES = [
  {
    id: '1',
    title: 'Deep Pothole near Central Hospital',
    category: 'road',
    status: 'pending',
    lat: 26.9342,
    lng: 90.4785,
    desc: 'Deteriorating asphalt making transit dangerous for pregnant commuters.',
  },
  {
    id: '2',
    title: 'Flickering Streetlights on Sector 4 Path',
    category: 'lighting',
    status: 'in-progress',
    lat: 26.9295,
    lng: 90.4851,
    desc: 'Early failure signs along common late-night walking routes.',
  },
  {
    id: '3',
    title: 'Overflowing Trash Bins',
    category: 'garbage',
    status: 'resolved',
    lat: 26.9212,
    lng: 90.4699,
    desc: 'Waste buildup on outskirts cleared by municipal teams.',
  },
];

const categoryConfig = [
  { key: 'all', label: 'Alle', color: '#154212' },
  { key: 'road', label: 'Straße', color: '#d97706' },
  { key: 'garbage', label: 'Abfall', color: '#2563eb' },
  { key: 'lighting', label: 'Beleuchtung', color: '#ca8a04' },
  { key: 'drainage', label: 'Entwässerung', color: '#0891b2' },
];

export const GrievanceMap = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredGrievances =
    activeFilter === 'all'
      ? MOCK_GRIEVANCES
      : MOCK_GRIEVANCES.filter((g) => g.category === activeFilter);

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

      <div className="group relative h-[550px] w-full overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
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
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          />

          {filteredGrievances.map((grievance) => (
            <Marker
              key={grievance.id}
              position={[grievance.lat, grievance.lng]}
              icon={categoryIcon(grievance.category, grievance.status)}
            >
              <Popup>
                <div className="font-sans">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm leading-tight font-semibold text-gray-900">
                      {grievance.title}
                    </h4>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        grievance.status === 'pending'
                          ? 'bg-red-100 text-red-700'
                          : grievance.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {grievance.status === 'in-progress'
                        ? 'In Bearbeitung'
                        : grievance.status === 'pending'
                          ? 'Ausstehend'
                          : 'Erledigt'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{grievance.desc}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] font-medium text-gray-500">
                    <span>
                      Kategorie:{' '}
                      <strong className="text-gray-800 uppercase">{grievance.category}</strong>
                    </span>
                    <button className="font-semibold text-gray-900 underline-offset-2 hover:underline">
                      Details →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/[0.03]" />

        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold tracking-wide text-gray-700 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>

        <div className="absolute right-4 bottom-4 z-[1000] flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="h-3 w-3"
          >
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Gelephu, Sarpang
        </div>

        <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold tracking-wider text-gray-500 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" />
            <span>Straße</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            <span>Abfall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ca8a04]" />
            <span>Beleuchtung</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0891b2]" />
            <span>Entwässerung</span>
          </div>
        </div>
      </div>
    </div>
  );
};
