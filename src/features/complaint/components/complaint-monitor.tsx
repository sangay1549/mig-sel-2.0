import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  MapPin,
  Pencil,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase.ts'; // Adjust path based on your project configuration
import type {
  Complaint,
  ComplaintCategory,
  ComplaintUrgency,
  ComplaintStatus,
} from '@/features/complaint/types';

const URGENCY_ORDER: Record<ComplaintUrgency, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

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

// --- Pagination Subcomponent ---
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
    <div
      className="flex items-center justify-between border-t px-2 pt-4"
      style={{ borderColor: '#e5e2e1' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#72796e' }}>
          Rows per page:
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="rounded-lg border px-2 py-1 text-xs transition-all outline-none"
          style={{ borderColor: '#c2c9bb', color: '#42493e' }}
        >
          {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-xs" style={{ color: '#72796e' }}>
          {startItem}–{endItem} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg p-1.5 transition-all hover:scale-110 disabled:opacity-30"
          style={{ color: '#72796e' }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 ? (
                <span className="px-1 text-xs" style={{ color: '#c2c9bb' }}>
                  ...
                </span>
              ) : null}
              <button
                onClick={() => onPageChange(p)}
                className="min-w-[28px] rounded-lg px-2 py-1 text-xs font-semibold transition-all"
                style={{
                  backgroundColor: p === currentPage ? '#154212' : 'transparent',
                  color: p === currentPage ? '#ffffff' : '#42493e',
                }}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-lg p-1.5 transition-all hover:scale-110 disabled:opacity-30"
          style={{ color: '#72796e' }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
export const ComplaintMonitor = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<ComplaintUrgency | 'all'>('all');

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase.from('grievances').select('*');

      if (supabaseError) throw supabaseError;

      setComplaints(data || []);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updatedComplaint: Complaint) => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('grievances')
        .update({
          title: updatedComplaint.title,
          description: updatedComplaint.description,
          category: updatedComplaint.category,
          urgency: updatedComplaint.urgency,
          status: updatedComplaint.status,
          reporter: updatedComplaint.reporter,
          reported_at: updatedComplaint.reportedAt,
        })
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      setComplaints((prev) => prev.map((c) => (c.id === id ? updatedComplaint : c)));
      setEditingId(null);
    } catch (err: unknown) {
      console.error('Error updating resource:', err);
      alert(`Failed to save changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGrievances();
  }, []);

  const handleLocalChange = (id: string, updates: Partial<Complaint>) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const filtered = complaints
    .filter((c) => statusFilter === 'all' || c.status === statusFilter)
    .filter((c) => urgencyFilter === 'all' || c.urgency === urgencyFilter)
    .sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const summary = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    critical: complaints.filter((c) => c.urgency === 'critical').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: '#154212' }}
        >
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: '#1c1b1b' }}>
            Complaint Monitoring
          </h2>
          <p className="text-xs" style={{ color: '#72796e' }}>
            {complaints.length} total complaints
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-3">
        <div
          className="rounded-xl border p-4 text-center shadow-sm"
          style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1' }}
        >
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: '#72796e' }}>
            Total
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#1c1b1b' }}>
            {summary.total}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center shadow-sm"
          style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}
        >
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: '#ea580c' }}>
            Pending
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#ea580c' }}>
            {summary.pending}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center shadow-sm"
          style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
        >
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: '#2563eb' }}>
            In Progress
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#2563eb' }}>
            {summary.inProgress}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center shadow-sm"
          style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
        >
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: '#16a34a' }}>
            Resolved
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#16a34a' }}>
            {summary.resolved}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center shadow-sm"
          style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
        >
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: '#dc2626' }}>
            Critical
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#dc2626' }}>
            {summary.critical}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#72796e' }}>
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ComplaintStatus | 'all');
              setCurrentPage(1);
            }}
            className="rounded-lg border px-3 py-1.5 text-xs transition-all outline-none"
            style={{ borderColor: '#c2c9bb', color: '#42493e' }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#72796e' }}>
            Urgency:
          </span>
          <select
            value={urgencyFilter}
            onChange={(e) => {
              setUrgencyFilter(e.target.value as ComplaintUrgency | 'all');
              setCurrentPage(1);
            }}
            className="rounded-lg border px-3 py-1.5 text-xs transition-all outline-none"
            style={{ borderColor: '#c2c9bb', color: '#42493e' }}
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        {statusFilter !== 'all' || urgencyFilter !== 'all' ? (
          <button
            onClick={() => {
              setStatusFilter('all');
              setUrgencyFilter('all');
              setCurrentPage(1);
            }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{ color: '#72796e' }}
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#e5e2e1',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#e5e2e1' }}>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Complaint
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Category
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Urgency
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Status
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Reporter
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Date
                </th>
                <th
                  className="w-20 px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div
                      className="flex flex-col items-center justify-center gap-2"
                      style={{ color: '#72796e' }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs">Loading grievances...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-sm"
                    style={{ color: '#c2c9bb' }}
                  >
                    No complaints match the selected filters
                  </td>
                </tr>
              ) : (
                paginated.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="group border-b transition-all last:border-0"
                    style={{ borderColor: '#f0eded' }}
                  >
                    {editingId === complaint.id ? (
                      <>
                        <td className="px-4 py-2">
                          <div className="space-y-1">
                            <Input
                              value={complaint.title}
                              onChange={(e) =>
                                handleLocalChange(complaint.id, { title: e.target.value })
                              }
                              className="h-8 text-sm"
                              style={{ borderColor: '#c2c9bb' }}
                            />
                            <Input
                              value={complaint.description}
                              onChange={(e) =>
                                handleLocalChange(complaint.id, { description: e.target.value })
                              }
                              className="h-8 text-xs"
                              style={{ borderColor: '#c2c9bb' }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={complaint.category}
                            onChange={(e) =>
                              handleLocalChange(complaint.id, {
                                category: e.target.value as ComplaintCategory,
                              })
                            }
                            className="h-8 rounded-lg border px-2 text-xs outline-none"
                            style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
                          >
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={complaint.urgency}
                            onChange={(e) =>
                              handleLocalChange(complaint.id, {
                                urgency: e.target.value as ComplaintUrgency,
                              })
                            }
                            className="h-8 rounded-lg border px-2 text-xs outline-none"
                            style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
                          >
                            {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={complaint.status}
                            onChange={(e) =>
                              handleLocalChange(complaint.id, {
                                status: e.target.value as ComplaintStatus,
                                resolvedAt:
                                  e.target.value === 'resolved'
                                    ? new Date().toISOString().split('T')[0]
                                    : null,
                              })
                            }
                            className="h-8 rounded-lg border px-2 text-xs outline-none"
                            style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
                          >
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={complaint.reporter}
                            onChange={(e) =>
                              handleLocalChange(complaint.id, { reporter: e.target.value })
                            }
                            className="h-8 text-sm"
                            style={{ borderColor: '#c2c9bb' }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="date"
                            value={complaint.reportedAt}
                            onChange={(e) =>
                              handleLocalChange(complaint.id, { reportedAt: e.target.value })
                            }
                            className="h-8 text-xs"
                            style={{ borderColor: '#c2c9bb' }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdate(complaint.id, complaint)}
                              className="rounded-lg p-1.5 transition-all hover:scale-110"
                              style={{ backgroundColor: '#154212', color: '#ffffff' }}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                fetchGrievances();
                              }}
                              className="rounded-lg p-1.5 transition-all hover:scale-110"
                              style={{ color: '#72796e' }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="max-w-[220px]">
                            <p className="truncate font-medium" style={{ color: '#1c1b1b' }}>
                              {complaint.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs" style={{ color: '#72796e' }}>
                              {complaint.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                              style={{
                                backgroundColor: CATEGORY_COLORS[complaint.category] || '#6b7280',
                              }}
                            />
                            <span className="text-xs font-medium" style={{ color: '#42493e' }}>
                              {CATEGORY_LABELS[complaint.category] || complaint.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm"
                            style={{
                              backgroundColor: URGENCY_BADGE[complaint.urgency]?.bg || '#f3f4f6',
                              color: URGENCY_BADGE[complaint.urgency]?.text || '#1f2937',
                            }}
                          >
                            {URGENCY_LABELS[complaint.urgency] || complaint.urgency}
                          </span>
                        </td>
                        <td className="px-4 py-3">
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
                              <MapPin className="h-3 w-3" />
                            )}
                            {STATUS_LABELS[complaint.status] || complaint.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#42493e' }}>
                          {complaint.reporter}
                        </td>
                        <td
                          className="px-4 py-3 text-xs whitespace-nowrap"
                          style={{ color: '#72796e' }}
                        >
                          {complaint.reportedAt}
                          {complaint.resolvedAt && (
                            <span className="ml-1" style={{ color: '#16a34a' }}>
                              ✓ {complaint.resolvedAt}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
                            <button
                              onClick={() => setEditingId(complaint.id)}
                              className="rounded-lg p-1.5 transition-all hover:scale-110"
                              style={{ color: '#72796e' }}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
      </div>
    </div>
  );
};
