import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, AlertCircle, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useCreateLifeUpdate } from '../api/use-create-life-update';

export const LifeUpdateForm = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useCreateLifeUpdate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum 10MB.' });
      e.target.value = '';
      return;
    }
    setMessage(null);
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    const fileExt = selectedFile.name.split('.').pop() ?? '';
    const fileName = `${crypto.randomUUID()}${fileExt ? '.' + fileExt : ''}`;
    const filePath = `life-updates/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('grievances').upload(filePath, selectedFile);
    if (uploadError) {
      throw new Error('Failed to upload image. Check storage permissions.');
    }
    const { data } = supabase.storage.from('grievances').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!body.trim()) {
      setMessage({ type: 'error', text: 'Please write something to share.' });
      return;
    }

    setIsUploading(true);

    try {
      const image_url = await uploadImage();
      await mutation.mutateAsync({ body: body.trim(), image_url });

      setMessage({ type: 'success', text: 'Posted to community!' });
      setTimeout(() => navigate('/community'), 1200);
    } catch (error) {
      const msg = error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Failed to post. Please try again.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsUploading(false);
    }
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
        <h1 className="text-lg font-bold text-foreground">Post Updates</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-5 p-4">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              What's on your mind?
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="h-32 w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Share something about your day, your neighborhood, or GMC..."
              maxLength={2000}
            />
            <p className="text-right text-[11px] text-muted-foreground">{body.length}/2000</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-2xl border border-border/50">
              <img src={imagePreview} alt="" className="h-56 w-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-5 text-center transition-all hover:bg-emerald-50 hover:border-emerald-400"
            >
              <Image className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">Add a photo</span>
            </button>
          )}

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
            disabled={isUploading || mutation.isPending || !body.trim()}
            className="gradient-green h-12 w-full rounded-xl font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </span>
            ) : mutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Posting...
              </span>
            ) : (
              'Share to Community'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
