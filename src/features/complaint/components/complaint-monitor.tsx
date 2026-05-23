import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  MapPin,
  Loader2,
  Trophy,
  Download,
  FileSpreadsheet,
  FileDown,
  Link2,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { grievanceKeys } from '@/features/auth/grievance/api/use-grievances';
import { leaderboardKeys } from '@/features/gamification/api/use-leaderboard';
import { profileKeys } from '@/features/gamification/api/use-user-profile';
import { ImageLightbox } from '@/features/auth/grievance/components/image-lightbox';
import {
  URGENCY_BADGE,
  STATUS_BADGE,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  URGENCY_LABELS,
} from '@/features/complaint/constants';
import type { Complaint, ComplaintUrgency, ComplaintStatus } from '@/features/complaint/types';
import {
  awardPointsForStatus,
  revokeChildPoints,
  restoreMasterPoints,
} from '@/features/complaint/utils/award-points';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

type ActiveTab = 'total' | ComplaintStatus | 'critical';

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

export const ComplaintMonitor = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState<ActiveTab>('total');
  const [urgencyFilter, setUrgencyFilter] = useState<ComplaintUrgency | 'all'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hideDuplicates, setHideDuplicates] = useState(true);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [unlinkTargetId, setUnlinkTargetId] = useState<string | null>(null);
  const [previewComplaint, setPreviewComplaint] = useState<Complaint | null>(null);

  const queryClient = useQueryClient();

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setComplaints(data || []);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGrievances();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    const current = complaints.find((c) => c.id === id);
    if (!current || current.status === newStatus) return;

    const updates: Record<string, unknown> = {
      status: newStatus,
    };
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const childUpdates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'resolved') {
      childUpdates.resolved_at = new Date().toISOString();
    }

    // Capture children before optimistic update
    const children = !current.parent_id ? complaints.filter((c) => c.parent_id === id) : [];

    // Optimistic update for master and all children
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) return { ...c, ...updates } as Complaint;
        if (c.parent_id === id) return { ...c, ...childUpdates } as Complaint;
        return c;
      }),
    );

    try {
      // Update master complaint
      const { error: supabaseError } = await supabase
        .from('grievances')
        .update(updates)
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      // Award points for master (master rules)
      await awardPointsForStatus(current.reporter_id, id, current.status, newStatus);

      // Cascade to children
      if (children.length > 0) {
        const { error: childrenError } = await supabase
          .from('grievances')
          .update(childUpdates)
          .eq('parent_id', id);

        if (childrenError) throw childrenError;

        await Promise.all(
          children.map((child) =>
            awardPointsForStatus(child.reporter_id, child.id, child.status, newStatus, true),
          ),
        );
      }

      queryClient.invalidateQueries({ queryKey: grievanceKeys.all });
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.all() });
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });

      // Silently refresh to ensure DB consistency
      const { data: refreshed, error: refreshError } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });
      if (!refreshError && refreshed) {
        setComplaints(refreshed);
      }
    } catch (err: unknown) {
      fetchGrievances();
      const message =
        err instanceof Error
          ? err.message
          : ((err as { message?: string })?.message ?? 'Unknown error');
      alert(`Failed to update status: ${message}`);
    }
  };

  const handleMerge = async (complaintId: string, masterId: string) => {
    const child = complaints.find((c) => c.id === complaintId);
    if (!child) return;

    // If child has children, reassign them to the new master
    const grandchildren = childrenMap.get(complaintId);

    const { error } = await supabase
      .from('grievances')
      .update({ parent_id: masterId })
      .eq('id', complaintId);

    if (error) {
      alert(`Failed to link complaint: ${error.message}`);
      return;
    }

    // Reassign children of the merged complaint to the new master
    if (grandchildren && grandchildren.length > 0) {
      const { error: gcError } = await supabase
        .from('grievances')
        .update({ parent_id: masterId })
        .in(
          'id',
          grandchildren.map((g) => g.id),
        );
      if (gcError) console.error('Failed to reassign merged children:', gcError);
    }

    // Revoke child's points when merged
    try {
      await revokeChildPoints(child.reporter_id, child.id, child.bonus_awarded);
    } catch {
      // non-blocking
    }

    setMergeTargetId(null);
    const { data: refreshed } = await supabase
      .from('grievances')
      .select('*')
      .order('created_at', { ascending: false });
    if (refreshed) setComplaints(refreshed);
  };

  const handleUnlink = async (complaintId: string) => {
    const child = complaints.find((c) => c.id === complaintId);
    if (!child) return;

    setUnlinkTargetId(null);

    const { error } = await supabase
      .from('grievances')
      .update({ parent_id: null })
      .eq('id', complaintId);

    if (error) {
      alert(`Failed to unlink complaint: ${error.message}`);
      return;
    }

    // Restore child's points as master
    try {
      await restoreMasterPoints(child.reporter_id, child.id, child.status, child.bonus_awarded);
    } catch {
      // non-blocking
    }

    queryClient.invalidateQueries({ queryKey: grievanceKeys.all });
    queryClient.invalidateQueries({ queryKey: leaderboardKeys.all() });
    queryClient.invalidateQueries({ queryKey: profileKeys.current() });

    const { data: refreshed } = await supabase
      .from('grievances')
      .select('*')
      .order('created_at', { ascending: false });
    if (refreshed) setComplaints(refreshed);
  };

  const handleUrgencyChange = async (id: string, newUrgency: ComplaintUrgency) => {
    const current = complaints.find((c) => c.id === id);
    if (!current || current.urgency === newUrgency) return;

    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, urgency: newUrgency } : c)));

    try {
      const { error: supabaseError } = await supabase
        .from('grievances')
        .update({ urgency: newUrgency })
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      queryClient.invalidateQueries({ queryKey: grievanceKeys.all });
    } catch (err: unknown) {
      fetchGrievances();
      const message =
        err instanceof Error
          ? err.message
          : ((err as { message?: string })?.message ?? 'Unknown error');
      alert(`Failed to update urgency: ${message}`);
    }
  };

  const filtered = complaints
    .filter((c): c is NonNullable<typeof c> => c != null)
    .filter((c) => {
      if (activeTab === 'total') return true;
      if (activeTab === 'critical') return c.urgency === 'critical';
      return c.status === activeTab;
    })
    .filter((c) => urgencyFilter === 'all' || c.urgency === urgencyFilter)
    .filter((c) => !hideDuplicates || c.parent_id === null);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const childrenMap = useMemo(() => {
    const map = new Map<string, Complaint[]>();
    for (const c of complaints) {
      if (c.parent_id) {
        const existing = map.get(c.parent_id);
        if (existing) existing.push(c);
        else map.set(c.parent_id, [c]);
      }
    }
    return map;
  }, [complaints]);

  const masterOptions = complaints.filter((c) => c.parent_id === null);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const summary = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in-progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    critical: complaints.filter((c) => c.urgency === 'critical').length,
  };

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const buildExportData = useCallback(() => {
    const headers = [
      'Title',
      'Description',
      'Category',
      'Urgency',
      'Status',
      'Points',
      'Location',
      'Image URL',
      'Date Created',
    ];
    const rows = complaints.map((c) => ({
      Title: c.title,
      Description: c.description,
      Category: CATEGORY_LABELS[c.category] || c.category,
      Urgency: URGENCY_LABELS[c.urgency] || c.urgency,
      Status: STATUS_LABELS[c.status] || c.status,
      Points: (() => {
        const statusPoints: Record<string, number> = { pending: 1, 'in-progress': 2, resolved: 4 };
        return statusPoints[c.status] ?? 1;
      })(),
      Location: c.location || '',
      'Image URL': c.image_url || '',
      'Date Created': c.created_at?.split('T')[0] || '',
    }));
    return { headers, rows };
  }, [complaints]);

  const downloadCSV = useCallback(() => {
    const { headers, rows } = buildExportData();
    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complaint-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDropdownOpen(false);
  }, [buildExportData]);

  const downloadExcel = useCallback(() => {
    const { rows } = buildExportData();
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Complaints');
    XLSX.writeFile(wb, `complaint-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    setDropdownOpen(false);
  }, [buildExportData]);

  const tabCard = (
    tab: ActiveTab,
    label: string,
    count: number,
    bgColor: string,
    borderColor: string,
    icon: React.ReactNode,
    textColor: string,
    ringColor: string,
  ) => {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => handleTabClick(tab)}
        className={`rounded-xl border p-4 text-left shadow-sm transition-all hover:scale-[1.02] ${
          isActive ? 'ring-2 ring-offset-1' : ''
        }`}
        style={{
          backgroundColor: bgColor,
          borderColor: isActive ? ringColor : borderColor,
          outline: isActive ? `2px solid ${ringColor}` : undefined,
          outlineOffset: '2px',
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-wide uppercase" style={{ color: textColor }}>
            {label}
          </p>
          {icon && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: `${textColor}15` }}
            >
              {icon}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold" style={{ color: textColor }}>
          {count}
        </p>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#154212' }}
          >
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: '#1c1b1b' }}>
            Complaint Monitoring
          </h2>
        </div>
        <div className="relative self-start" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all hover:scale-105"
            style={{ backgroundColor: '#154212', color: '#ffffff' }}
          >
            <Download className="h-4 w-4" />
            Download Report
            <ChevronDown className="h-3 w-3" />
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border shadow-lg"
              style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1' }}
            >
              <button
                type="button"
                onClick={downloadExcel}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all hover:bg-gray-50"
                style={{ color: '#42493e' }}
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Download as Excel (.xlsx)
              </button>
              <div className="border-t" style={{ borderColor: '#e5e2e1' }} />
              <button
                type="button"
                onClick={downloadCSV}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-all hover:bg-gray-50"
                style={{ color: '#42493e' }}
              >
                <FileDown className="h-4 w-4 text-blue-600" />
                Download as CSV (.csv)
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tabCard('total', 'Total', summary.total, '#ffffff', '#e5e2e1', null, '#1c1b1b', '#1c1b1b')}
        {tabCard(
          'pending',
          'Pending',
          summary.pending,
          '#fffbeb',
          '#fde68a',
          <Clock className="h-4 w-4 text-orange-500" />,
          '#d97706',
          '#d97706',
        )}
        {tabCard(
          'in-progress',
          'In Progress',
          summary.inProgress,
          '#eff6ff',
          '#93c5fd',
          <MapPin className="h-4 w-4 text-blue-500" />,
          '#2563eb',
          '#2563eb',
        )}
        {tabCard(
          'resolved',
          'Resolved',
          summary.resolved,
          '#f0fdf4',
          '#86efac',
          <CheckCircle2 className="h-4 w-4 text-green-500" />,
          '#16a34a',
          '#16a34a',
        )}
        {tabCard(
          'critical',
          'Critical',
          summary.critical,
          summary.critical > 0 ? '#fef2f2' : '#f9fafb',
          summary.critical > 0 ? '#fca5a5' : '#e5e2e1',
          <AlertTriangle
            className={`h-4 w-4 ${summary.critical > 0 ? 'text-red-500' : 'text-gray-400'}`}
          />,
          summary.critical > 0 ? '#dc2626' : '#72796e',
          '#dc2626',
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#72796e' }}>
            Hide Duplicates:
          </span>
          <button
            type="button"
            onClick={() => setHideDuplicates(!hideDuplicates)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              hideDuplicates ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                hideDuplicates ? 'translate-x-[18px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>
        {activeTab !== 'total' || urgencyFilter !== 'all' || !hideDuplicates ? (
          <button
            onClick={() => {
              setActiveTab('total');
              setUrgencyFilter('all');
              setHideDuplicates(true);
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
                  Points
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Image
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Link
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
                      <select
                        value={complaint.urgency}
                        onChange={(e) =>
                          handleUrgencyChange(complaint.id, e.target.value as ComplaintUrgency)
                        }
                        className="cursor-pointer rounded-lg border px-2 py-1 text-xs font-bold tracking-wide uppercase transition-all outline-none"
                        style={{
                          backgroundColor: URGENCY_BADGE[complaint.urgency]?.bg || '#f3f4f6',
                          color: URGENCY_BADGE[complaint.urgency]?.text || '#1f2937',
                          borderColor: URGENCY_BADGE[complaint.urgency]?.text || '#c2c9bb',
                        }}
                      >
                        {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                          <option
                            key={key}
                            value={key}
                            style={{ backgroundColor: '#fff', color: '#1c1b1b' }}
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          handleStatusChange(complaint.id, e.target.value as ComplaintStatus)
                        }
                        className="cursor-pointer rounded-lg border px-2 py-1 text-xs font-bold tracking-wide uppercase transition-all outline-none"
                        style={{
                          backgroundColor: STATUS_BADGE[complaint.status]?.bg || '#f3f4f6',
                          color: STATUS_BADGE[complaint.status]?.text || '#1f2937',
                          borderColor: STATUS_BADGE[complaint.status]?.text || '#c2c9bb',
                        }}
                      >
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option
                            key={key}
                            value={key}
                            style={{ backgroundColor: '#fff', color: '#1c1b1b' }}
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-sm font-bold" style={{ color: '#42493e' }}>
                          {(() => {
                            const statusPoints: Record<string, number> = {
                              pending: 1,
                              'in-progress': 2,
                              resolved: 4,
                            };
                            return statusPoints[complaint.status] ?? 1;
                          })()}
                        </span>
                        <span className="text-[10px]" style={{ color: '#72796e' }}>
                          / 4 pts
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {complaint.image_url ? (
                        <img
                          src={complaint.image_url}
                          alt={complaint.title}
                          onClick={() => setPreviewComplaint(complaint)}
                          className="h-14 w-28 cursor-pointer rounded-lg object-cover shadow-sm transition-all hover:scale-105 hover:ring-2 hover:ring-gray-400"
                        />
                      ) : (
                        <span className="text-xs" style={{ color: '#c2c9bb' }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const children = childrenMap.get(complaint.id);
                        if (children && children.length > 0) {
                          return (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold"
                              style={{ color: '#92400e' }}
                              title={children.map((c) => c.title).join(', ')}
                            >
                              <Link2 className="h-3 w-3" />
                              {children.length}
                            </span>
                          );
                        }
                        if (complaint.parent_id) {
                          return (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="text-[10px] font-medium"
                                style={{ color: '#72796e' }}
                              >
                                Linked
                              </span>
                              <button
                                type="button"
                                onClick={() => setUnlinkTargetId(complaint.id)}
                                className="rounded p-0.5 text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
                                title="Unlink from parent"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => setMergeTargetId(complaint.id)}
                            className={`rounded-lg p-1.5 transition-all hover:scale-110 hover:bg-gray-100 ${
                              complaint.status === 'resolved' ? 'cursor-not-allowed opacity-30' : ''
                            }`}
                            title={
                              complaint.status === 'resolved'
                                ? 'Resolved complaints cannot be linked'
                                : 'Link as duplicate of a master complaint'
                            }
                            style={{ color: '#72796e' }}
                            disabled={complaint.status === 'resolved'}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </button>
                        );
                      })()}
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
      </div>

      {mergeTargetId &&
        (() => {
          const target = complaints.find((c) => c.id === mergeTargetId);
          const statusOrder = ['pending', 'in-progress', 'resolved'];
          const targetStatusIndex = statusOrder.indexOf(target?.status ?? 'pending');
          const masters = masterOptions.filter(
            (m) => m.id !== mergeTargetId && statusOrder.indexOf(m.status) >= targetStatusIndex,
          );
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setMergeTargetId(null)}
            >
              <div
                className="mx-4 w-full max-w-md rounded-xl border bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: '#e5e2e1' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: '#1c1b1b' }}>
                    Link Complaint as Duplicate
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMergeTargetId(null)}
                    className="rounded-lg p-1 transition-all hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" style={{ color: '#72796e' }} />
                  </button>
                </div>
                {target && (
                  <p className="mb-3 text-xs" style={{ color: '#72796e' }}>
                    Linking:{' '}
                    <span className="font-semibold" style={{ color: '#42493e' }}>
                      {target.title}
                    </span>
                  </p>
                )}
                {masters.length === 0 ? (
                  <p className="py-4 text-center text-xs" style={{ color: '#c2c9bb' }}>
                    No eligible master complaints found
                  </p>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-y-auto">
                    {masters.map((master) => (
                      <button
                        key={master.id}
                        type="button"
                        onClick={() => handleMerge(mergeTargetId, master.id)}
                        className="flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-xs transition-all hover:bg-gray-50"
                        style={{ borderColor: '#e5e2e1', color: '#42493e' }}
                      >
                        {master.image_url ? (
                          <img
                            src={master.image_url}
                            alt=""
                            className="h-14 w-20 shrink-0 rounded-md object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <span className="text-[10px]" style={{ color: '#c2c9bb' }}>
                              No img
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium" style={{ color: '#1c1b1b' }}>
                            {master.title}
                          </p>
                          <p
                            className="mt-0.5 line-clamp-2 text-[11px]"
                            style={{ color: '#72796e' }}
                          >
                            {master.description}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                backgroundColor: CATEGORY_COLORS[master.category]
                                  ? `${CATEGORY_COLORS[master.category]}1a`
                                  : '#f3f4f6',
                                color: CATEGORY_COLORS[master.category] || '#6b7280',
                              }}
                            >
                              {CATEGORY_LABELS[master.category] || master.category}
                            </span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                backgroundColor: URGENCY_BADGE[master.urgency]?.bg || '#f3f4f6',
                                color: URGENCY_BADGE[master.urgency]?.text || '#6b7280',
                              }}
                            >
                              {URGENCY_LABELS[master.urgency]}
                            </span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                backgroundColor: STATUS_BADGE[master.status]?.bg || '#f3f4f6',
                                color: STATUS_BADGE[master.status]?.text || '#6b7280',
                              }}
                            >
                              {STATUS_LABELS[master.status]}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      {unlinkTargetId &&
        (() => {
          const child = complaints.find((c) => c.id === unlinkTargetId);
          const parent = child ? complaints.find((c) => c.id === child.parent_id) : null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setUnlinkTargetId(null)}
            >
              <div
                className="mx-4 w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: '#e5e2e1' }}
              >
                <h3 className="mb-2 text-sm font-bold" style={{ color: '#1c1b1b' }}>
                  Unlink Complaint?
                </h3>
                <p className="mb-1 text-xs" style={{ color: '#72796e' }}>
                  This will unlink{' '}
                  <span className="font-semibold" style={{ color: '#42493e' }}>
                    {child?.title}
                  </span>{' '}
                  from its parent
                  {parent && (
                    <>
                      {' '}
                      (
                      <span className="font-semibold" style={{ color: '#42493e' }}>
                        {parent.title}
                      </span>
                      )
                    </>
                  )}
                  .
                </p>
                <p className="mb-4 text-xs" style={{ color: '#c2c9bb' }}>
                  Points will be restored as if it were an independent complaint.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setUnlinkTargetId(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:bg-gray-100"
                    style={{ color: '#72796e' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnlink(unlinkTargetId)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-700"
                  >
                    Unlink
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      {previewComplaint &&
        (() => {
          const children = childrenMap.get(previewComplaint.id);
          const parent = previewComplaint.parent_id
            ? complaints.find((c) => c.id === previewComplaint.parent_id)
            : null;
          const parentChildren = parent ? childrenMap.get(parent.id) : null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setPreviewComplaint(null)}
            >
              <div
                className="mx-4 w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: '#e5e2e1' }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-sm font-bold" style={{ color: '#1c1b1b' }}>
                    Complaint Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPreviewComplaint(null)}
                    className="rounded-lg p-1 transition-all hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" style={{ color: '#72796e' }} />
                  </button>
                </div>
                {previewComplaint.image_url && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <ImageLightbox
                      src={previewComplaint.image_url}
                      alt={previewComplaint.title}
                      className="max-h-64 w-full rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2 text-xs">
                  <p className="text-sm font-bold" style={{ color: '#1c1b1b' }}>
                    {previewComplaint.title}
                  </p>
                  <p style={{ color: '#72796e' }}>{previewComplaint.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: CATEGORY_COLORS[previewComplaint.category]
                          ? `${CATEGORY_COLORS[previewComplaint.category]}1a`
                          : '#f3f4f6',
                        color: CATEGORY_COLORS[previewComplaint.category] || '#6b7280',
                      }}
                    >
                      {CATEGORY_LABELS[previewComplaint.category] || previewComplaint.category}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: URGENCY_BADGE[previewComplaint.urgency]?.bg || '#f3f4f6',
                        color: URGENCY_BADGE[previewComplaint.urgency]?.text || '#6b7280',
                      }}
                    >
                      {URGENCY_LABELS[previewComplaint.urgency]}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: STATUS_BADGE[previewComplaint.status]?.bg || '#f3f4f6',
                        color: STATUS_BADGE[previewComplaint.status]?.text || '#6b7280',
                      }}
                    >
                      {STATUS_LABELS[previewComplaint.status]}
                    </span>
                  </div>
                  {previewComplaint.location && (
                    <p style={{ color: '#72796e' }}>
                      <span className="font-medium">Location:</span> {previewComplaint.location}
                    </p>
                  )}
                </div>
                {parent && (
                  <div className="mt-4 border-t pt-3" style={{ borderColor: '#e5e2e1' }}>
                    <p className="mb-2 text-xs font-bold" style={{ color: '#92400e' }}>
                      <Link2 className="mr-1 inline h-3 w-3" />
                      Linked to Parent
                    </p>
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2">
                      {parent.image_url && (
                        <img
                          src={parent.image_url}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium" style={{ color: '#92400e' }}>
                          {parent.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px]" style={{ color: '#72796e' }}>
                          {parent.description}
                        </p>
                      </div>
                    </div>
                    {parentChildren && parentChildren.length > 1 && (
                      <p className="mt-1 text-[10px]" style={{ color: '#72796e' }}>
                        Parent has {parentChildren.length} linked duplicate
                        {parentChildren.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
                {children && children.length > 0 && (
                  <div className="mt-4 border-t pt-3" style={{ borderColor: '#e5e2e1' }}>
                    <p className="mb-2 text-xs font-bold" style={{ color: '#42493e' }}>
                      <Link2 className="mr-1 inline h-3 w-3" />
                      Merged Complaints ({children.length})
                    </p>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-start gap-2 rounded-lg bg-gray-50 p-2"
                        >
                          {child.image_url && (
                            <img
                              src={child.image_url}
                              alt=""
                              className="h-10 w-16 shrink-0 rounded-md object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-xs font-medium"
                              style={{ color: '#42493e' }}
                            >
                              {child.title}
                            </p>
                            <p className="truncate text-[11px]" style={{ color: '#72796e' }}>
                              {child.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
};
