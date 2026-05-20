import { useState, useRef, useCallback } from 'react';
import { X, MapPin, UploadCloud, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeoLocation } from '../hooks/use-geo-location';
import { uploadGrievanceImage } from './use-upload-image';
import { useCreateGrievance } from './use-create-grievance';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { value: 'road', label: 'Road Damage' },
  { value: 'garbage', label: 'Waste Management' },
  { value: 'lighting', label: 'Street Lighting' },
  { value: 'drainage', label: 'Drainage/Sewage' },
  { value: 'other', label: 'Other' },
] as const;

interface Props {
  onClose: () => void;
}

export const GrievanceDrawer = ({ onClose }: Props) => {
  const { coords: gpsCoords, error: geoError, loading: geoLoading } = useGeoLocation();
  const { user } = useCurrentUser();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mutation = useCreateGrievance();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');

  const checkDuplicate = useCallback(
    async (lat: number, lng: number) => {
      const tolerance = 0.0001;
      const { data } = await supabase
        .from('grievances')
        .select('title, description')
        .gte('latitude', lat - tolerance)
        .lte('latitude', lat + tolerance)
        .gte('longitude', lng - tolerance)
        .lte('longitude', lng + tolerance);

      if (!data || data.length === 0) return null;

      return (
        data.find((g) => {
          const sameTitle = g.title?.toLowerCase().trim() === title.toLowerCase().trim();
          const sameDesc = g.description?.toLowerCase().trim() === description.toLowerCase().trim();
          return sameTitle && sameDesc;
        }) ?? null
      );
    },
    [title, description],
  );

  const submitReport = async () => {
    setMessage(null);

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please upload a photo to submit a report' });
      return;
    }

    if (!gpsCoords) {
      setMessage({ type: 'error', text: 'Location not available. Please wait for GPS detection.' });
      return;
    }

    const duplicate = await checkDuplicate(gpsCoords.lat, gpsCoords.lng);
    if (duplicate) {
      setMessage({ type: 'error', text: 'This issue has already been reported at this location.' });
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadGrievanceImage(selectedFile);

      await mutation.mutateAsync({
        title: title || 'Community Report',
        description: description || '',
        category: category || 'other',
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lng,
        image_url: imageUrl,
        reporter_id: user?.id ?? null,
      });

      setMessage({ type: 'success', text: 'Report submitted to GMC successfully!' });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Submission failed. Category:', category, 'Error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        setMessage({ type: 'error', text: String((error as { message: string }).message) });
      } else {
        setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.[0]) return;
    if (files[0].size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File is too large. Maximum size is 10MB.' });
      e.target.value = '';
      return;
    }
    setMessage(null);
    setSelectedFile(files[0]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="bg-card border-border animate-in slide-in-from-right h-full w-full max-w-md overflow-y-auto border-l p-4 shadow-2xl md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-headline-sm text-primary font-bold">New Report</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            submitReport();
          }}
        >
          <div className="bg-surface-container border-outline-variant flex items-center gap-3 rounded-lg border p-3">
            <MapPin className="text-primary h-5 w-5 shrink-0" />
            <div className="text-body-sm">
              <p className="font-bold">Your Location</p>
              <p className="text-muted-foreground">
                {geoError
                  ? geoError
                  : gpsCoords
                    ? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}`
                    : geoLoading
                      ? 'Detecting your location...'
                      : 'Location unavailable'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-muted-foreground font-bold uppercase">
              Title <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-outline bg-background focus:ring-primary w-full rounded-lg border p-3 outline-none focus:ring-2"
              placeholder="Brief title for the report"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-muted-foreground font-bold uppercase">
              Category <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-outline bg-background focus:ring-primary w-full rounded-lg border p-3 outline-none focus:ring-2"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-muted-foreground font-bold uppercase">
              Description <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-outline focus:ring-primary h-24 w-full rounded-lg border p-3 outline-none focus:ring-2"
              placeholder="Describe the issue (optional)"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-2">
            <label className="text-label-sm text-muted-foreground font-bold uppercase">
              Photo <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-outline hover:bg-surface-container-low flex flex-1 cursor-pointer flex-col items-center justify-center space-y-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors"
              >
                <UploadCloud className="text-primary h-7 w-7" />
                <p className="text-label-sm font-semibold">
                  {selectedFile ? selectedFile.name : 'Upload from gallery'}
                </p>
                <p className="text-body-xs text-muted-foreground">JPEG, JPG or PNG (Max 10MB)</p>
              </div>

              <div
                onClick={() => cameraInputRef.current?.click()}
                className="border-primary hover:bg-primary/5 flex flex-1 cursor-pointer flex-col items-center justify-center space-y-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors"
              >
                <Camera className="text-primary h-7 w-7" />
                <p className="text-label-sm text-primary font-semibold">Take a photo</p>
                <p className="text-body-xs text-muted-foreground">Use your device camera</p>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          <Button
            disabled={isUploading || !selectedFile}
            onClick={submitReport}
            className="bg-primary text-primary-foreground h-12 w-full rounded-lg font-bold shadow-lg"
          >
            {isUploading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </div>
    </div>
  );
};
