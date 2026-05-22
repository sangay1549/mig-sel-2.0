import { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { grievanceKeys } from '@/features/auth/grievance/api/use-grievances';
import { leaderboardKeys } from '@/features/gamification/api/use-leaderboard';
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
import { awardPointsForStatus } from '@/features/complaint/utils/award-points';

const getEarnedPoints = (bonusAwarded: number) => {
  let points = 1;
  if (bonusAwarded & 1) points += 1;
  if (bonusAwarded & 2) points += 2;
  return points;
};

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

    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? ({ ...c, ...updates } as Complaint) : c)),
    );

    try {
      const { error: supabaseError } = await supabase
        .from('grievances')
        .update(updates)
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      await awardPointsForStatus(current.reporter_id, id, current.status, newStatus);
      queryClient.invalidateQueries({ queryKey: grievanceKeys.all });
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.all() });
    } catch (err: unknown) {
      fetchGrievances();
      const message =
        err instanceof Error
          ? err.message
          : ((err as { message?: string })?.message ?? 'Unknown error');
      alert(`Failed to update status: ${message}`);
    }
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
    .filter((c) => urgencyFilter === 'all' || c.urgency === urgencyFilter);

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
      Points: getEarnedPoints(c.bonus_awarded ?? 0),
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
        className="rounded-xl border p-4 text-left shadow-sm transition-all hover:scale-[1.02]"
        style={{
          backgroundColor: bgColor,
          borderColor: isActive ? ringColor : borderColor,
          outline: isActive ? `2px solid ${ringColor}` : undefined,
          outlineOffset: '2px',
        }}
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: textColor }}>
            {label}
          </p>
        </div>
        <p className="mt-1 text-3xl font-bold" style={{ color: textColor }}>
          {count}
        </p>
      </button>
    );
  };

  return (
    <div className="space-y-6">
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
        {tabCard('total', 'Total', summary.total, '#ffffff', '#e5e2e1', null, '#1c1b1b', '#154212')}
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
        {activeTab !== 'total' || urgencyFilter !== 'all' ? (
          <button
            onClick={() => {
              setActiveTab('total');
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
                  Points
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Image
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
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
                    colSpan={6}
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
                          {getEarnedPoints(complaint.bonus_awarded ?? 0)}
                        </span>
                        <span className="text-[10px]" style={{ color: '#72796e' }}>
                          / 4
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {complaint.image_url ? (
                        <ImageLightbox
                          src={complaint.image_url}
                          alt={complaint.title}
                          className="h-14 w-28 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <span className="text-xs" style={{ color: '#c2c9bb' }}>
                          —
                        </span>
                      )}
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
    </div>
  );
};
