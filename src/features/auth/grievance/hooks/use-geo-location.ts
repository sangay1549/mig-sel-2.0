import { useState, useEffect, useRef } from 'react';

interface GeoLocationState {
  coords: { lat: number; lng: number } | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

const LOADING_TIMEOUT_MS = 12_000;

function getCachedPosition(): { lat: number; lng: number } | null {
  try {
    const cached = sessionStorage.getItem('migsel-location');
    if (cached) return JSON.parse(cached) as { lat: number; lng: number };
  } catch {
    /* ignore */
  }
  return null;
}

function setCachedPosition(lat: number, lng: number) {
  try {
    sessionStorage.setItem('migsel-location', JSON.stringify({ lat, lng }));
  } catch {
    /* ignore */
  }
}

export const useGeoLocation = () => {
  const geoAvailable = typeof navigator !== 'undefined' && !!navigator.geolocation;

  const cached = geoAvailable ? getCachedPosition() : null;

  const [state, setState] = useState<GeoLocationState>({
    coords: cached,
    accuracy: null,
    error: geoAvailable ? null : 'Geolocation is not supported by your browser',
    loading: geoAvailable && !cached,
  });

  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!geoAvailable) return;

    mountedRef.current = true;

    const loadingTimeout = setTimeout(() => {
      if (!mountedRef.current) return;
      setState((prev) => {
        if (prev.loading) {
          return {
            coords: null,
            accuracy: null,
            error: 'Location detection timed out. Try again.',
            loading: false,
          };
        }
        return prev;
      });
    }, LOADING_TIMEOUT_MS);

    const success = (position: GeolocationPosition) => {
      if (!mountedRef.current) return;
      clearTimeout(loadingTimeout);
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setCachedPosition(coords.lat, coords.lng);
      setState({ coords, accuracy: position.coords.accuracy, error: null, loading: false });
    };

    const error = (err: GeolocationPositionError) => {
      if (!mountedRef.current) return;
      clearTimeout(loadingTimeout);
      let message = 'Failed to detect location';
      if (err.code === err.PERMISSION_DENIED) {
        message = 'Location permission denied. Enable location access in your browser settings.';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        message = 'Location unavailable. Make sure GPS/location is turned on.';
      } else if (err.code === err.TIMEOUT) {
        message = 'Location request timed out. Try again.';
      }
      setState({ coords: null, accuracy: null, error: message, loading: false });
    };

    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 120000,
    });
    watchIdRef.current = watchId;

    return () => {
      mountedRef.current = false;
      clearTimeout(loadingTimeout);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};
