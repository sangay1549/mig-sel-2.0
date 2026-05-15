export type MapTicketPin = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  priority_level: string;
  category_name: string;
  support_count: number;
  description: string;
  created_at: string;
};

export type MapViewport = {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
};

export const GMC_BOUNDS: [[number, number], [number, number]] = [
  [26.8, 90.2],
  [27.2, 90.7],
];

export const DEFAULT_CENTER: [number, number] = [27.0, 90.45];
export const DEFAULT_ZOOM = 12;
