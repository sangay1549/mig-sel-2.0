import { useState, useRef } from 'react';
import {
  Menu,
  Megaphone,
  Send,
  Loader2,
  Pin,
  PinOff,
  Trash2,
  Globe,
  AlertTriangle,
  Wrench,
  Building2,
  Image,
  X,
} from 'lucide-react';
import { OfficialSidebar } from '@/components/layout/official-sidebar';
import { supabase } from '@/lib/supabase';
import { useCreateAnnouncement } from '@/features/announcements/api/use-create-announcement';
import { useOfficialAnnouncements } from '@/features/announcements/api/use-official-announcements';
import { useTogglePin } from '@/features/announcements/api/use-toggle-pin';
import { useDeleteAnnouncement } from '@/features/announcements/api/use-delete-announcement';
import { useUserProfile } from '@/features/gamification/api/use-user-profile';
import type { AnnouncementCategory } from '@/features/announcements/types';

const CATEGORIES: { value: AnnouncementCategory; label: string; icon: typeof Megaphone }[] = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone },
  { value: 'emergency_alert', label: 'Emergency Alert', icon: AlertTriangle },
  { value: 'project_update', label: 'Project Update', icon: Wrench },
  { value: 'maintenance_notice', label: 'Maintenance Notice', icon: Building2 },
];

const CATEGORY_BADGE: Record<AnnouncementCategory, { bg: string; text: string; label: string }> = {
  announcement: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Announcement' },
  emergency_alert: { bg: 'bg-red-50', text: 'text-red-600', label: 'Emergency' },
  project_update: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Project' },
  maintenance_notice: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Maintenance' },
};

export const OfficialPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('announcement');
  const [isEmergency, setIsEmergency] = useState(false);
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useUserProfile();
  const { data: announcements, isLoading } = useOfficialAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const togglePin = useTogglePin();
  const deleteAnnouncement = useDeleteAnnouncement();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split('.').pop() ?? '';
    const fileName = `${crypto.randomUUID()}${fileExt ? '.' + fileExt : ''}`;
    const filePath = `announcements/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('grievances').upload(filePath, imageFile);
    if (uploadError) {
      throw new Error('Failed to upload image. Check storage permissions.');
    }
    const { data } = supabase.storage.from('grievances').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !body.trim()) return;

    setUploading(true);
    try {
      const image_url = await uploadImage();
      createAnnouncement.mutate(
        {
          title: title.trim(),
          body: body.trim(),
          category,
          is_emergency: isEmergency,
          department: department.trim() || profile?.username || null,
          image_url,
        },
        {
          onSuccess: () => {
            setTitle('');
            setBody('');
            setCategory('announcement');
            setIsEmergency(false);
            setDepartment('');
            clearImage();
            setUploading(false);
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to publish announcement');
            setUploading(false);
          },
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setUploading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/80">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <OfficialSidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-white/70 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: '1200px' }}>
            <div className="mb-6 hidden md:flex md:items-center md:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 shadow-sm">
                <Megaphone className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
                  Official
                </p>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Announcements
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Publish official announcements to the community feed
                </p>
              </div>
            </div>

            <div className="animate-slide-up space-y-6">
              {/* Create announcement form */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Send className="h-4 w-4 text-primary" />
                  New Announcement
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder={profile?.username ?? 'GMC Roads Division'}
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-10 w-full rounded-lg border px-3 text-sm transition-all outline-none focus-visible:ring-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Category</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = category === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
                              isActive
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Road Closure on Norzin Lam"
                      maxLength={200}
                      required
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-10 w-full rounded-lg border px-3 text-sm transition-all outline-none focus-visible:ring-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Body</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Describe the announcement..."
                      rows={4}
                      maxLength={2000}
                      required
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-2"
                    />
                    <p className="text-right text-[11px] text-muted-foreground">
                      {body.length}/2000
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Mark as emergency alert
                    </span>
                    {isEmergency && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                    )}
                  </label>

                  {/* Image upload */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <div className="relative inline-flex">
                        <img
                          src={imagePreview}
                          alt=""
                          className="h-24 w-36 rounded-lg object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700/70 text-white transition-colors hover:bg-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        <Image className="h-4 w-4" />
                        Add image or attachment
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!title.trim() || !body.trim() || createAnnouncement.isPending || uploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold shadow-xs transition-all hover:shadow-md active:scale-95 disabled:opacity-50 sm:w-auto"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : createAnnouncement.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Publish to Feed
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* My announcements */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-sm backdrop-blur-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  My Announcements
                </h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                  </div>
                ) : !announcements || announcements.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No announcements yet. Create your first one above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann) => {
                      const badge = CATEGORY_BADGE[ann.category] ?? CATEGORY_BADGE.announcement;
                      return (
                        <div
                          key={ann.id}
                          className="flex items-start gap-3 rounded-xl border border-border/50 bg-white p-4 shadow-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                              >
                                {badge.label}
                              </span>
                              {ann.is_emergency && (
                                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  Emergency
                                </span>
                              )}
                              {ann.is_pinned && (
                                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                                  <Pin className="h-3 w-3" />
                                  Pinned
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-foreground">{ann.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {ann.body}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {new Date(ann.published_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              onClick={() => togglePin.mutate(ann.id)}
                              disabled={togglePin.isPending}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
                              title={ann.is_pinned ? 'Unpin' : 'Pin'}
                            >
                              {ann.is_pinned ? (
                                <PinOff className="h-4 w-4" />
                              ) : (
                                <Pin className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this announcement?')) {
                                  deleteAnnouncement.mutate(ann.id);
                                }
                              }}
                              disabled={deleteAnnouncement.isPending}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
