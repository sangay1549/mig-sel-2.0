import type {
  ComplaintCategory,
  ComplaintUrgency,
  ComplaintStatus,
} from '@/features/complaint/types';

export const URGENCY_ORDER: Record<ComplaintUrgency, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const URGENCY_BADGE: Record<ComplaintUrgency, { bg: string; text: string }> = {
  critical: { bg: '#fef2f2', text: '#dc2626' },
  high: { bg: '#fff7ed', text: '#ea580c' },
  medium: { bg: '#eff6ff', text: '#2563eb' },
  low: { bg: '#f0fdf4', text: '#16a34a' },
};

export const URGENCY_BADGE_WITH_HOVER: Record<
  ComplaintUrgency,
  { bg: string; text: string; hoverBg: string }
> = {
  critical: { bg: '#fef2f2', text: '#dc2626', hoverBg: '#fee2e2' },
  high: { bg: '#fff7ed', text: '#ea580c', hoverBg: '#ffedd5' },
  medium: { bg: '#eff6ff', text: '#2563eb', hoverBg: '#dbeafe' },
  low: { bg: '#f0fdf4', text: '#16a34a', hoverBg: '#dcfce7' },
};

export const STATUS_BADGE: Record<ComplaintStatus, { bg: string; text: string }> = {
  pending: { bg: '#fff7ed', text: '#ea580c' },
  'in-progress': { bg: '#eff6ff', text: '#2563eb' },
  resolved: { bg: '#f0fdf4', text: '#16a34a' },
};

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road: 'Road',
  garbage: 'Garbage',
  lighting: 'Lighting',
  drainage: 'Drainage',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  road: '#6366f1',
  garbage: '#10b981',
  lighting: '#f59e0b',
  drainage: '#06b6d4',
  other: '#8b5cf6',
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

export const URGENCY_LABELS: Record<ComplaintUrgency, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_URGENCY_ORDER: ComplaintUrgency[] = ['low', 'medium', 'high', 'critical'];

export const STATUS_ORDER: ComplaintStatus[] = ['pending', 'in-progress', 'resolved'];
