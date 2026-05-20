import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  MoveRight,
  Loader2,
  List,
  Flame,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useComplaints } from '@/features/complaint/api/use-complaints';
import { ComplaintDetailDialog } from '@/features/complaint/components/complaint-detail-dialog';
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

const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  road: '#d97706',
  garbage: '#3b82f6',
  lighting: '#eab308',
  drainage: '#06b6d4',
  other: '#6b7280',
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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

type CardFilter = 'total' | 'pending' | 'in-progress' | 'resolved' | 'critical';

const cardStyles: Record<
  CardFilter,
  {
    activeBg: string;
    activeBorder: string;
    activeShadow: string;
    iconBg: string;
    iconBgActive: string;
    iconColor: string;
    iconColorActive: string;
    labelColor: string;
    labelColorActive: string;
    countColor: string;
  }
> = {
  total: {
    activeBg: 'bg-green-50',
    activeBorder: 'border-green-500',
    activeShadow: '0 4px 16px rgba(34,197,94,0.15)',
    iconBg: 'bg-green-50',
    iconBgActive: 'bg-green-500',
    iconColor: 'text-green-600',
    iconColorActive: 'text-white',
    labelColor: 'text-green-600',
    labelColorActive: 'text-green-600',
    countColor: 'text-foreground',
  },
  pending: {
    activeBg: 'bg-orange-50',
    activeBorder: 'border-orange-500',
    activeShadow: '0 4px 16px rgba(234,88,12,0.15)',
    iconBg: 'bg-orange-50',
    iconBgActive: 'bg-orange-500',
    iconColor: 'text-orange-600',
    iconColorActive: 'text-white',
    labelColor: 'text-orange-600',
    labelColorActive: 'text-orange-600',
    countColor: 'text-orange-600',
  },
  'in-progress': {
    activeBg: 'bg-blue-50',
    activeBorder: 'border-blue-500',
    activeShadow: '0 4px 16px rgba(37,99,235,0.15)',
    iconBg: 'bg-blue-50',
    iconBgActive: 'bg-blue-500',
    iconColor: 'text-blue-600',
    iconColorActive: 'text-white',
    labelColor: 'text-blue-600',
    labelColorActive: 'text-blue-600',
    countColor: 'text-blue-600',
  },
  resolved: {
    activeBg: 'bg-green-50',
    activeBorder: 'border-green-500',
    activeShadow: '0 4px 16px rgba(22,163,74,0.15)',
    iconBg: 'bg-green-50',
    iconBgActive: 'bg-green-500',
    iconColor: 'text-green-600',
    iconColorActive: 'text-white',
    labelColor: 'text-green-600',
    labelColorActive: 'text-green-600',
    countColor: 'text-green-600',
  },
  critical: {
    activeBg: 'bg-red-50',
    activeBorder: 'border-red-500',
    activeShadow: '0 4px 16px rgba(220,38,38,0.15)',
    iconBg: 'bg-red-50',
    iconBgActive: 'bg-red-500',
    iconColor: 'text-red-600',
    iconColorActive: 'text-white',
    labelColor: 'text-red-600',
    labelColorActive: 'text-red-600',
    countColor: 'text-red-600',
  },
};

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground/60 text-xs">Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border-input bg-card text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-7 rounded-lg border px-2 text-xs transition-all outline-none focus-visible:ring-2"
        >
          {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground/60 text-xs">
          {startItem}–{endItem} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-muted-foreground/60 hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-all disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 ? (
                <span className="text-muted-foreground/40 px-1 text-xs">...</span>
              ) : null}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[28px] rounded-lg px-2 py-1 text-xs font-semibold transition-all',
                  p === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="text-muted-foreground/60 hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-all disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const ComplaintMonitor = () => {
  const navigate = useNavigate();
  const { data: complaints = [], isLoading, error: fetchError } = useComplaints();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<ComplaintUrgency | 'all'>('all');
  const [activeCard, setActiveCard] = useState<CardFilter | null>(null);

  const handleRowClick = (complaint: Complaint) => {
    navigate(`/dashboard/complaint/${complaint.id}`);
  };

  const handleCardClick = (card: CardFilter) => {
    if (activeCard === card) {
      setActiveCard(null);
      setStatusFilter('all');
      setUrgencyFilter('all');
    } else {
      setActiveCard(card);
      if (card === 'pending') {
        setStatusFilter('pending');
        setUrgencyFilter('all');
      } else if (card === 'in-progress') {
        setStatusFilter('in-progress');
        setUrgencyFilter('all');
      } else if (card === 'resolved') {
        setStatusFilter('resolved');
        setUrgencyFilter('all');
      } else if (card === 'critical') {
        setStatusFilter('all');
        setUrgencyFilter('critical');
      } else {
        setStatusFilter('all');
        setUrgencyFilter('all');
      }
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(
    () =>
      complaints
        .filter((c) => statusFilter === 'all' || c.status === statusFilter)
        .filter((c) => urgencyFilter === 'all' || c.urgency === urgencyFilter),
    [complaints, statusFilter, urgencyFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const summary = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    critical: complaints.filter((c) => c.urgency === 'critical').length,
  };

  const summaryCards: Array<{ key: CardFilter; icon: typeof List; label: string; count: number }> =
    [
      { key: 'total', icon: List, label: 'Total', count: summary.total },
      { key: 'pending', icon: Clock, label: 'Pending', count: summary.pending },
      { key: 'in-progress', icon: Loader2, label: 'In Progress', count: summary.inProgress },
      { key: 'resolved', icon: CheckCircle2, label: 'Resolved', count: summary.resolved },
      { key: 'critical', icon: Flame, label: 'Critical', count: summary.critical },
    ];

  return (
    <div className="animate-fade-in space-y-6">
      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
          Error: {fetchError.message}
        </div>
      )}

      {/* Clickable summary cards */}
      <div className="grid grid-cols-5 gap-3">
        {summaryCards.map(({ key, icon: Icon, label, count }) => {
          const isActive = activeCard === key;
          const s = cardStyles[key];
          return (
            <div
              key={key}
              onClick={() => handleCardClick(key)}
              className={cn(
                'cursor-pointer rounded-xl border p-4 text-center shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md',
                isActive ? s.activeBg : 'bg-card',
                isActive ? s.activeBorder : 'border-border/50',
              )}
              style={isActive ? { boxShadow: s.activeShadow } : undefined}
            >
              <div
                className={cn(
                  'mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg',
                  isActive ? s.iconBgActive : s.iconBg,
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? s.iconColorActive : s.iconColor)} />
              </div>
              <p
                className={cn(
                  'text-xs font-bold tracking-wide uppercase',
                  isActive ? s.labelColorActive : 'text-muted-foreground/60',
                )}
              >
                {label}
              </p>
              <p className={cn('mt-1 text-2xl font-bold', s.countColor)}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setActiveCard(null);
              setStatusFilter(e.target.value as ComplaintStatus | 'all');
              setCurrentPage(1);
            }}
            className="border-input bg-card text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 rounded-lg border px-3 text-xs transition-all outline-none focus-visible:ring-2"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/60 text-xs font-bold tracking-wide uppercase">
            Urgency:
          </span>
          <select
            value={urgencyFilter}
            onChange={(e) => {
              setActiveCard(null);
              setUrgencyFilter(e.target.value as ComplaintUrgency | 'all');
              setCurrentPage(1);
            }}
            className="border-input bg-card text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 rounded-lg border px-3 text-xs transition-all outline-none focus-visible:ring-2"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        {(statusFilter !== 'all' || urgencyFilter !== 'all') && (
          <button
            onClick={() => {
              setActiveCard(null);
              setStatusFilter('all');
              setUrgencyFilter('all');
              setCurrentPage(1);
            }}
            className="text-muted-foreground/60 hover:bg-accent hover:text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <Card className="shadow-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Complaint
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Image
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Category
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Urgency
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Status
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Date
                </th>
                <th className="text-muted-foreground/60 w-16 px-4 py-3.5 text-xs font-bold tracking-wide uppercase" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="text-muted-foreground/60 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs">Loading grievances...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-muted-foreground/40 px-4 py-16 text-center text-sm"
                  >
                    No complaints match the selected filters
                  </td>
                </tr>
              ) : (
                paginated.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() => handleRowClick(complaint)}
                    className="group border-accent/50 hover:bg-muted/50 cursor-pointer border-b transition-colors last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-[220px]">
                        <p className="text-foreground truncate font-medium">{complaint.title}</p>
                        <p className="text-muted-foreground/70 mt-0.5 truncate text-xs">
                          {complaint.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {complaint.image_url ? (
                        <img
                          src={complaint.image_url}
                          alt="Complaint"
                          className="ring-border/50 h-14 w-14 rounded-xl object-cover shadow-md ring-1"
                        />
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                          style={{
                            backgroundColor: CATEGORY_COLORS[complaint.category] || '#6b7280',
                          }}
                        />
                        <span className="text-muted-foreground text-xs font-medium">
                          {CATEGORY_LABELS[complaint.category] || complaint.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ComplaintDetailDialog
                        complaint={complaint}
                        trigger={
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm transition-transform hover:scale-105"
                            style={{
                              backgroundColor: URGENCY_BADGE[complaint.urgency]?.bg || '#f3f4f6',
                              color: URGENCY_BADGE[complaint.urgency]?.text || '#1f2937',
                            }}
                          >
                            {URGENCY_LABELS[complaint.urgency] || complaint.urgency}
                          </span>
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ComplaintDetailDialog
                        complaint={complaint}
                        trigger={
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm transition-transform hover:scale-105"
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
                        }
                      />
                    </td>
                    <td className="text-muted-foreground/70 px-4 py-3 text-xs whitespace-nowrap">
                      {complaint.created_at}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="text-muted-foreground/40 h-4 w-4" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(count) => {
              setItemsPerPage(count);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>
    </div>
  );
};
