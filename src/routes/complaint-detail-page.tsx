import { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Clock, CheckCircle2, MoveRight, Upload, Loader2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { useComplaint } from '@/features/complaint/api/use-complaint';
import { useUpdateComplaint } from '@/features/complaint/api/use-update-complaint';
import { uploadGrievanceImage } from '@/features/auth/grievance/components/use-upload-image';
import type {
  ComplaintCategory,
  ComplaintUrgency,
  ComplaintStatus,
} from '@/features/complaint/types';

const URGENCY_BADGE: Record<ComplaintUrgency, { bg: string; text: string; hoverBg: string }> = {
  critical: { bg: '#fef2f2', text: '#dc2626', hoverBg: '#fee2e2' },
  high: { bg: '#fff7ed', text: '#ea580c', hoverBg: '#ffedd5' },
  medium: { bg: '#eff6ff', text: '#2563eb', hoverBg: '#dbeafe' },
  low: { bg: '#f0fdf4', text: '#16a34a', hoverBg: '#dcfce7' },
};

const STATUS_BADGE: Record<ComplaintStatus, { bg: string; text: string }> = {
  pending: { bg: '#fff7ed', text: '#ea580c' },
  'in-progress': { bg: '#eff6ff', text: '#2563eb' },
  resolved: { bg: '#f0fdf4', text: '#16a34a' },
};

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

const URGENCY_LABELS: Record<ComplaintUrgency, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road: 'Road',
  garbage: 'Garbage',
  lighting: 'Lighting',
  drainage: 'Drainage',
  other: 'Other',
};

const STATUS_URGENCY_ORDER: ComplaintUrgency[] = ['low', 'medium', 'high', 'critical'];
const STATUS_ORDER: ComplaintStatus[] = ['pending', 'in-progress', 'resolved'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
        {label}
      </label>
      <div className="text-foreground mt-1 text-sm">{children}</div>
    </div>
  );
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler]);
}

export const ComplaintDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: complaint, isLoading, error } = useComplaint(id ?? '');
  const updateComplaint = useUpdateComplaint();

  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const urgencyRef = useRef<HTMLDivElement>(null);

  useClickOutside(urgencyRef, () => setUrgencyOpen(false));

  const handleSidebarNavigate = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="bg-muted flex min-h-screen">
        <DashboardSidebar activeView="complaint" onNavigate={handleSidebarNavigate} />
        <div className="ml-60 flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="bg-muted flex min-h-screen">
        <DashboardSidebar activeView="complaint" onNavigate={handleSidebarNavigate} />
        <div className="ml-60 flex flex-1 flex-col">
          <main className="flex-1 overflow-auto">
            <div className="mx-auto px-8 py-8" style={{ maxWidth: '1200px' }}>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Card className="mt-6">
                <CardContent className="py-12 text-center">
                  <p className="text-destructive text-sm">Failed to load complaint.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const c = complaint;

  const handleUrgencyChange = (urgency: ComplaintUrgency) => {
    setUrgencyOpen(false);
    updateComplaint.mutate({ id: c.id, urgency });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleStatusSave = async () => {
    if (!selectedStatus) return;
    setIsSaving(true);
    try {
      let resolvedImageUrl: string | null = null;
      if (selectedFile) {
        resolvedImageUrl = await uploadGrievanceImage(selectedFile);
      }
      updateComplaint.mutate(
        { id: c.id, status: selectedStatus, resolved_image_url: resolvedImageUrl },
        {
          onSettled: () => {
            setIsSaving(false);
            setSelectedStatus(null);
            clearImage();
          },
        },
      );
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-screen">
      <DashboardSidebar activeView="complaint" onNavigate={handleSidebarNavigate} />

      <div className="ml-60 flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          <div
            className="animate-fade-in mx-auto space-y-6 px-8 py-8"
            style={{ maxWidth: '1200px' }}
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard?view=complaint">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Complaint Monitoring
              </Link>
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-foreground text-2xl font-bold tracking-tight">
                  {complaint.title}
                </h1>
                <p className="text-muted-foreground/70 mt-1 text-sm">
                  Reported on{' '}
                  {new Date(complaint.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* Urgency dropdown */}
                <div ref={urgencyRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setUrgencyOpen(!urgencyOpen)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:opacity-90"
                    style={{
                      backgroundColor: URGENCY_BADGE[complaint.urgency]?.text,
                      color: '#fff',
                    }}
                    title="Click to change urgency"
                  >
                    {URGENCY_LABELS[complaint.urgency]}
                  </button>
                  {urgencyOpen && (
                    <div className="border-border/50 bg-card absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border shadow-xl">
                      {STATUS_URGENCY_ORDER.map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => handleUrgencyChange(u)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition-colors"
                          style={{
                            backgroundColor:
                              u === complaint.urgency ? URGENCY_BADGE[u].text : 'transparent',
                            color: u === complaint.urgency ? '#fff' : URGENCY_BADGE[u].text,
                          }}
                          onMouseEnter={(e) => {
                            if (u !== complaint.urgency) {
                              e.currentTarget.style.backgroundColor = URGENCY_BADGE[u].hoverBg;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (u !== complaint.urgency) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {URGENCY_LABELS[u]}
                          {u === complaint.urgency && (
                            <span className="ml-auto text-[10px] opacity-70">Current</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status badge (read-only at top) */}
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm"
                  style={{
                    backgroundColor: STATUS_BADGE[complaint.status]?.bg,
                    color: STATUS_BADGE[complaint.status]?.text,
                  }}
                >
                  {complaint.status === 'pending' ? (
                    <Clock className="h-3 w-3" />
                  ) : complaint.status === 'resolved' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <MoveRight className="h-3 w-3" />
                  )}
                  {STATUS_LABELS[complaint.status]}
                </span>
              </div>
            </div>

            {complaint.image_url && (
              <div className="border-border/50 overflow-hidden rounded-xl border bg-black/5 shadow-sm">
                <img src={complaint.image_url} alt="Complaint" className="w-full object-contain" />
              </div>
            )}

            <Card>
              <CardContent className="space-y-6 p-6">
                <Field label="Description">
                  <p className="leading-relaxed">{complaint.description}</p>
                </Field>

                <div className="grid grid-cols-3 gap-6">
                  <Field label="Category">
                    <span>{CATEGORY_LABELS[complaint.category]}</span>
                  </Field>
                  <Field label="Urgency">
                    <span>{URGENCY_LABELS[complaint.urgency]}</span>
                  </Field>
                  <Field label="Status">
                    <span>{STATUS_LABELS[complaint.status]}</span>
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <Field label="Latitude">
                    <span className="font-mono text-xs">{complaint.latitude}</span>
                  </Field>
                  <Field label="Longitude">
                    <span className="font-mono text-xs">{complaint.longitude}</span>
                  </Field>
                  <Field label="Location">
                    <span>{complaint.location ?? '—'}</span>
                  </Field>
                </div>

                {complaint.resolved_image_url && (
                  <div>
                    <label className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
                      Resolved Image
                    </label>
                    <img
                      src={complaint.resolved_image_url}
                      alt="Resolved"
                      className="border-border/50 mt-1 w-full rounded-xl border bg-black/5 object-contain shadow-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolve section at bottom */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <Save className="text-primary-foreground h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-sm font-bold tracking-tight">
                      Resolve Complaint
                    </h2>
                    <p className="text-muted-foreground/70 text-xs">
                      Update the status and attach a resolution image
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
                      New Status
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STATUS_ORDER.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedStatus(s)}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold tracking-wide uppercase shadow-sm transition-all hover:scale-105"
                          style={{
                            backgroundColor: selectedStatus === s ? STATUS_BADGE[s].bg : '#f3f4f6',
                            color: selectedStatus === s ? STATUS_BADGE[s].text : '#6b7280',
                            outline:
                              selectedStatus === s
                                ? `2px solid ${STATUS_BADGE[s].text}`
                                : undefined,
                            outlineOffset: 2,
                          }}
                        >
                          {s === 'pending' ? (
                            <Clock className="h-3.5 w-3.5" />
                          ) : s === 'resolved' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <MoveRight className="h-3.5 w-3.5" />
                          )}
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
                      Resolved Image (optional)
                    </label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="border-border/50 relative overflow-hidden rounded-lg border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-border/50 text-muted-foreground/60 hover:border-muted-foreground/30 hover:text-muted-foreground/80 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-xs transition-colors">
                          <Upload className="h-4 w-4" />
                          Click to upload image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-border/50 mt-6 flex items-center justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus(null);
                      clearImage();
                    }}
                    className="text-muted-foreground/60 hover:bg-accent hover:text-foreground rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStatusSave}
                    disabled={!selectedStatus || isSaving}
                    className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
