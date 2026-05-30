import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeoLocation } from '@/features/auth/grievance/hooks/use-geo-location';
import { uploadGrievanceImage } from '@/features/auth/grievance/components/use-upload-image';
import { useCreateGrievance } from '@/features/auth/grievance/components/use-create-grievance';
import { useCurrentUser } from '@/features/auth/api/use-current-user';

const CATEGORIES = [
  { value: 'road', label: 'Road Damage', icon: '🛣️' },
  { value: 'garbage', label: 'Waste Management', icon: '🗑️' },
  { value: 'lighting', label: 'Street Lighting', icon: '💡' },
  { value: 'drainage', label: 'Drainage/Sewage', icon: '🌊' },
  { value: 'other', label: 'Other', icon: '📌' },
] as const;

export const ReportPage = () => {
  const navigate = useNavigate();
  const { coords: gpsCoords, error: geoError, loading: geoLoading } = useGeoLocation();
  const { user } = useCurrentUser();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mutation = useCreateGrievance();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');

  const submitReport = async () => {
    setMessage(null);

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please take a photo to submit a report' });
      return;
    }

    if (!gpsCoords) {
      setMessage({ type: 'error', text: 'Location not available. Please wait for GPS.' });
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

      setMessage({ type: 'success', text: 'Report submitted successfully!' });
      setTimeout(() => navigate('/map'), 1500);
    } catch (error) {
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
      setMessage({ type: 'error', text: 'File too large. Maximum 10MB.' });
      e.target.value = '';
      return;
    }
    setMessage(null);
    setSelectedFile(files[0]);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-border/50 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">New Report</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl space-y-5 p-4">
          <div className="animate-slide-up rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">Your Location</p>
                <p className="text-xs text-muted-foreground">
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
          </div>

          <div className="animate-slide-up stagger-1 space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                    category === cat.value
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] font-semibold leading-tight text-center">
                    {cat.label.split('/')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="animate-slide-up stagger-2 space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Brief title for the report"
            />
          </div>

          <div className="animate-slide-up stagger-3 space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-24 w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Describe the issue"
            />
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="animate-slide-up stagger-4 space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Photo <span className="text-destructive">*</span>
            </label>
            {selectedFile ? (
              <div className="relative overflow-hidden rounded-2xl border border-border/50">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={() => setSelectedFile(null)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Camera className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Take a photo</p>
                  <p className="text-xs text-muted-foreground">Use your device camera</p>
                </div>
              </button>
            )}
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
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
            className="gradient-green h-12 w-full rounded-xl font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Report'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
