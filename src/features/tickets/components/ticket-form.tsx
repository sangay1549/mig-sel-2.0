import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useCreateTicket } from '../api/use-create-ticket';
import { createTicketSchema, type CreateTicketValues } from '../schemas/ticket-schema';
import { CATEGORIES } from '../types';
import { MapPin, Camera, AlertTriangle } from 'lucide-react';

export const TicketForm = () => {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'got' | 'error'>(
    'idle',
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [manualPin, setManualPin] = useState(false);

  const form = useForm<CreateTicketValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTicketSchema) as any,
    defaultValues: {
      category_id: '',
      description: '',
      is_anonymous: false,
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
    },
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setManualPin(true);
      return;
    }

    setLocationStatus('getting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const acc = position.coords.accuracy;
        setAccuracy(acc);

        if (acc > 100) {
          setManualPin(true);
          setLocationStatus('error');
          return;
        }

        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setCoords({ lat, lng });
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
        form.setValue('accuracy_radius', acc);
        setLocationStatus('got');
      },
      () => {
        setLocationStatus('error');
        setManualPin(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const onSubmit = (values: CreateTicketValues) => {
    const submitValues = {
      ...values,
      image: selectedFile,
      latitude: coords?.lat ?? values.latitude,
      longitude: coords?.lng ?? values.longitude,
    };

    createTicket.mutate(submitValues, {
      onSuccess: (data) => {
        navigate(`/tickets/${data.id}`);
      },
    });
  };

  const description = form.watch('description');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  className="bg-card border-input focus-visible:border-ring focus-visible:ring-ring/20 h-10 w-full rounded-sm border px-3 py-2 text-sm outline-none"
                  {...field}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} — {cat.dept_name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="bg-card border-input focus-visible:border-ring focus-visible:ring-ring/20 min-h-[120px] w-full rounded-sm border px-3 py-2 text-sm outline-none"
                  placeholder="Describe the issue in detail (at least 20 characters)"
                  {...field}
                />
              </FormControl>
              {description && description.length < 20 ? (
                <p className="text-muted-foreground text-xs">
                  {20 - description.length} more characters needed
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Location</FormLabel>
          {locationStatus === 'idle' ? (
            <Button type="button" variant="outline" onClick={getLocation} className="w-full">
              <MapPin className="mr-2 size-4" />
              Get My Location
            </Button>
          ) : null}

          {locationStatus === 'getting' ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="bg-primary size-3 animate-pulse rounded-full" />
              Getting your location...
            </p>
          ) : null}

          {locationStatus === 'got' && coords ? (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center gap-2 p-3 text-sm">
                <MapPin className="text-primary size-4" />
                <span>
                  {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                </span>
                {accuracy ? (
                  <span className="text-muted-foreground text-xs">(±{Math.round(accuracy)}m)</span>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {manualPin ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="flex items-start gap-2 p-3 text-sm">
                <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Location accuracy is low</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Please use the map to drop a pin at the exact location.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setCoords({ lat: 27.0, lng: 90.45 });
                      form.setValue('latitude', 27.0);
                      form.setValue('longitude', 90.45);
                      setManualPin(false);
                      setLocationStatus('got');
                    }}
                  >
                    Use Default Location (GMC Center)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {locationStatus === 'error' && !manualPin ? (
            <p className="text-destructive text-sm">
              Could not get location. Please ensure GPS is enabled.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <FormLabel>Photo Evidence</FormLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 size-4" />
            {selectedFile ? selectedFile.name : 'Take or Upload Photo'}
          </Button>
          {selectedFile && selectedFile.size > 2 * 1024 * 1024 ? (
            <p className="text-muted-foreground text-xs">Image will be compressed to 1080p</p>
          ) : null}
          <FormMessage />
        </div>

        <FormField
          control={form.control}
          name="is_anonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-sm border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  className="mt-1 size-4"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <div>
                <FormLabel className="text-sm font-medium">Submit Anonymously</FormLabel>
                <FormDescription className="text-xs">
                  Your identity will not be shown with this report.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {createTicket.isError ? (
          <div className="bg-destructive/10 rounded-sm px-3 py-2">
            <p className="text-destructive text-sm">{createTicket.error.message}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={createTicket.isPending || locationStatus === 'getting'}
        >
          {createTicket.isPending ? 'Submitting report…' : 'Submit Report'}
        </Button>
      </form>
    </Form>
  );
};
