import { Clock, CheckCircle2, MoveRight, MapPin } from 'lucide-react';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type {
  Complaint,
  ComplaintCategory,
  ComplaintUrgency,
  ComplaintStatus,
} from '@/features/complaint/types';

const URGENCY_BADGE: Record<ComplaintUrgency, { bg: string; text: string }> = {
  critical: { bg: '#fef2f2', text: '#dc2626' },
  high: { bg: '#fff7ed', text: '#ea580c' },
  medium: { bg: '#eff6ff', text: '#2563eb' },
  low: { bg: '#f0fdf4', text: '#16a34a' },
};

const STATUS_BADGE: Record<ComplaintStatus, { bg: string; text: string }> = {
  pending: { bg: '#fff7ed', text: '#ea580c' },
  'in-progress': { bg: '#eff6ff', text: '#2563eb' },
  resolved: { bg: '#f0fdf4', text: '#16a34a' },
};

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road: 'Road',
  garbage: 'Garbage',
  lighting: 'Lighting',
  drainage: 'Drainage',
  other: 'Other',
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">{label}</p>
      <div className="text-foreground mt-0.5 text-sm">{children}</div>
    </div>
  );
}

export function ComplaintDetailDialog({
  complaint,
  trigger,
}: {
  complaint: Complaint;
  trigger: React.ReactNode;
}) {
  return (
    <DialogRoot>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{complaint.title}</DialogTitle>
          <DialogDescription>
            Reported on{' '}
            {new Date(complaint.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm"
              style={{
                backgroundColor: URGENCY_BADGE[complaint.urgency]?.bg || '#f3f4f6',
                color: URGENCY_BADGE[complaint.urgency]?.text || '#1f2937',
              }}
            >
              {URGENCY_LABELS[complaint.urgency] || complaint.urgency}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm"
              style={{
                backgroundColor: STATUS_BADGE[complaint.status]?.bg || '#f3f4f6',
                color: STATUS_BADGE[complaint.status]?.text || '#1f2937',
              }}
            >
              {complaint.status === 'pending' ? (
                <Clock className="h-3 w-3" />
              ) : complaint.status === 'resolved' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <MoveRight className="h-3 w-3" />
              )}
              {STATUS_LABELS[complaint.status] || complaint.status}
            </span>
          </div>

          {complaint.image_url && (
            <div className="border-border/50 overflow-hidden rounded-xl border bg-black/5 shadow-sm">
              <img
                src={complaint.image_url}
                alt={complaint.title}
                className="max-h-[50vh] w-full object-contain"
              />
            </div>
          )}

          <Field label="Description">
            <p className="leading-relaxed">{complaint.description}</p>
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Category">
              <span>{CATEGORY_LABELS[complaint.category] || complaint.category}</span>
            </Field>
            <Field label="Urgency">
              <span>{URGENCY_LABELS[complaint.urgency] || complaint.urgency}</span>
            </Field>
            <Field label="Status">
              <span>{STATUS_LABELS[complaint.status] || complaint.status}</span>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Latitude">
              <span className="font-mono text-xs">{complaint.latitude}</span>
            </Field>
            <Field label="Longitude">
              <span className="font-mono text-xs">{complaint.longitude}</span>
            </Field>
            <Field label="Location">
              <span className="flex items-center gap-1">
                <MapPin className="text-muted-foreground/60 h-3 w-3 shrink-0" />
                {complaint.location ?? '—'}
              </span>
            </Field>
          </div>

          {complaint.resolved_image_url && (
            <div>
              <p className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
                Resolved Image
              </p>
              <img
                src={complaint.resolved_image_url}
                alt="Resolved"
                className="border-border/50 mt-1 max-h-[50vh] w-full rounded-xl border bg-black/5 object-contain shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
