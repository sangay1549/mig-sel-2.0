import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Check,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase'; // <-- Ensure this path matches your Supabase client setup
import type { WasteRecord as WasteRecordType, WasteCategory } from '@/features/waste/types';

const CATEGORIES: { value: WasteCategory; label: string; color: string }[] = [
  { value: 'organic-food', label: 'Organic/Food waste', color: '#16a34a' },
  { value: 'paper-cardboard', label: 'Paper & Cardboard', color: '#2563eb' },
  { value: 'plastic-soft-packaging', label: 'Plastic soft packaging', color: '#eab308' },
  { value: 'plastic-pet-hdpe', label: 'Plastic (PET&HDPE)', color: '#f97316' },
  { value: 'textile', label: 'Textile', color: '#ec4899' },
  { value: 'glass', label: 'Glass', color: '#06b6d4' },
  { value: 'metal-aluminum', label: 'Metal, Aluminum', color: '#8b5cf6' },
  { value: 'e-waste', label: 'E-waste', color: '#ef4444' },
  { value: 'infectious-waste', label: 'Infectious waste', color: '#dc2626' },
  { value: 'leather-rubber', label: 'Leather, Rubber', color: '#78716c' },
  { value: 'wood', label: 'Wood', color: '#d97706' },
  { value: 'sanitary-waste', label: 'Sanitary waste', color: '#a1a1aa' },
  { value: 'green-plant-materials', label: 'Green plant materials', color: '#22c55e' },
  { value: 'construction-demolition', label: 'Construction & Demolition wastes', color: '#92400e' },
];

const CATEGORY_LABELS: Record<WasteCategory, string> = {
  'organic-food': 'Organic/Food waste',
  'paper-cardboard': 'Paper & Cardboard',
  'plastic-soft-packaging': 'Plastic soft packaging',
  'plastic-pet-hdpe': 'Plastic (PET&HDPE)',
  textile: 'Textile',
  glass: 'Glass',
  'metal-aluminum': 'Metal, Aluminum',
  'e-waste': 'E-waste',
  'infectious-waste': 'Infectious waste',
  'leather-rubber': 'Leather, Rubber',
  wood: 'Wood',
  'sanitary-waste': 'Sanitary waste',
  'green-plant-materials': 'Green plant materials',
  'construction-demolition': 'Construction & Demolition wastes',
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

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

export const WasteRecord = () => {
  const [records, setRecords] = useState<WasteRecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [form, setForm] = useState({
    category: 'organic-food' as WasteCategory,
    quantity: '',
    unit: 'ton',
    notes: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waste_records')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) throw error;

      // Mapping database snake_case properties to frontend camelCase objects
      const mappedData: WasteRecordType[] = (data || []).map((row) => ({
        id: row.id as string,
        category: row.category as WasteCategory,
        quantity: Number(row.quantity),
        unit: row.unit as string,
        reportedAt: row.reported_at as string,
        collectedAt: row.collected_at as string | null,
        notes: row.notes as string | null,
      }));

      setRecords(mappedData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecords();
  }, []);

  const resetForm = () =>
    setForm({ category: 'organic-food', quantity: '', unit: 'ton', notes: '' });

  const totalPages = Math.ceil(records.length / itemsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quantity) return;

    try {
      const payload = {
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        reported_at: new Date().toISOString().split('T')[0],
        collected_at: null,
        notes: form.notes,
      };

      const { data, error } = await supabase.from('waste_records').insert([payload]).select();

      if (error) throw error;

      if (data && data[0]) {
        const inserted = data[0];
        const newRecord: WasteRecordType = {
          id: inserted.id,
          category: inserted.category,
          quantity: Number(inserted.quantity),
          unit: inserted.unit,
          reportedAt: inserted.reported_at,
          collectedAt: inserted.collected_at,
          notes: inserted.notes,
        };
        setRecords((prev) => [newRecord, ...prev]);
      }

      resetForm();
      setShowForm(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error adding record:', err);
    }
  };

  const handleUpdate = async (id: string, updatedFields: Partial<WasteRecordType>) => {
    try {
      const dbPayload: Record<string, unknown> = {};
      if (updatedFields.category) dbPayload.category = updatedFields.category;
      if (updatedFields.quantity !== undefined) dbPayload.quantity = Number(updatedFields.quantity);
      if (updatedFields.unit) dbPayload.unit = updatedFields.unit;
      if (updatedFields.reportedAt) dbPayload.reported_at = updatedFields.reportedAt;
      if (updatedFields.notes !== undefined) dbPayload.notes = updatedFields.notes;

      const { error } = await supabase.from('waste_records').update(dbPayload).eq('id', id);

      if (error) throw error;

      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r)));
      setEditingId(null);
    } catch (err) {
      console.error('Error updating record:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('waste_records').delete().eq('id', id);

      if (error) throw error;
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#154212' }}
          >
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: '#1c1b1b' }}>
              Waste Records
            </h2>
            <p className="text-xs" style={{ color: '#72796e' }}>
              {loading ? 'Loading...' : `${records.length} total records`}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          size="sm"
          className="transition-all duration-300 hover:scale-105"
          style={{ backgroundColor: '#154212', color: '#ffffff' }}
        >
          <Plus className="mr-1 h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Record'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-down rounded-xl border p-6 shadow-sm"
          style={{ backgroundColor: '#ffffff', borderColor: '#e5e2e1' }}
        >
          <div className="mb-5 flex items-center gap-2">
            <GripVertical className="h-4 w-4" style={{ color: '#c2c9bb' }} />
            <span
              className="text-sm font-bold tracking-wide uppercase"
              style={{ color: '#42493e' }}
            >
              New Waste Record
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label
                className="text-xs font-bold tracking-wide uppercase"
                style={{ color: '#42493e' }}
              >
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as WasteCategory })}
                className="flex h-10 w-full items-center rounded-lg border px-3 text-sm transition-all outline-none"
                style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <label
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#42493e' }}
                >
                  Quantity
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0.0"
                  required
                  className="focus-visible:ring-2"
                  style={{ borderColor: '#c2c9bb' }}
                />
              </div>
              <div className="w-24 space-y-1.5">
                <label
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#42493e' }}
                >
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="flex h-10 w-full items-center rounded-lg border px-2 text-sm transition-all outline-none"
                  style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="liter">liter</option>
                  <option value="cubic meter">m³</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
              <label
                className="text-xs font-bold tracking-wide uppercase"
                style={{ color: '#42493e' }}
              >
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional details..."
                className="min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none placeholder:text-sm"
                style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              style={{ backgroundColor: '#154212', color: '#ffffff' }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </form>
      )}

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
                  Category
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Quantity
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Date
                </th>
                <th
                  className="px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Notes
                </th>
                <th
                  className="w-24 px-4 py-3.5 text-xs font-bold tracking-wide uppercase"
                  style={{ color: '#72796e' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm"
                    style={{ color: '#72796e' }}
                  >
                    Fetching records from database...
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm"
                    style={{ color: '#c2c9bb' }}
                  >
                    No waste records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="group border-b transition-all last:border-0"
                    style={{ borderColor: '#f0eded' }}
                  >
                    {editingId === record.id ? (
                      <>
                        <td className="px-4 py-2">
                          <select
                            value={record.category}
                            onChange={(e) =>
                              setRecords((prev) =>
                                prev.map((r) =>
                                  r.id === record.id
                                    ? { ...r, category: e.target.value as WasteCategory }
                                    : r,
                                ),
                              )
                            }
                            className="h-8 w-full rounded-lg border px-2 text-xs outline-none"
                            style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={record.quantity}
                              onChange={(e) =>
                                setRecords((prev) =>
                                  prev.map((r) =>
                                    r.id === record.id
                                      ? { ...r, quantity: Number(e.target.value) }
                                      : r,
                                  ),
                                )
                              }
                              className="h-8 w-20 text-sm"
                              style={{ borderColor: '#c2c9bb' }}
                            />
                            <select
                              value={record.unit}
                              onChange={(e) =>
                                setRecords((prev) =>
                                  prev.map((r) =>
                                    r.id === record.id ? { ...r, unit: e.target.value } : r,
                                  ),
                                )
                              }
                              className="h-8 rounded-lg border px-1 text-xs outline-none"
                              style={{ borderColor: '#c2c9bb', color: '#1c1b1b' }}
                            >
                              <option value="kg">kg</option>
                              <option value="ton">ton</option>
                              <option value="liter">L</option>
                              <option value="cubic meter">m³</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="date"
                            value={record.reportedAt}
                            onChange={(e) =>
                              setRecords((prev) =>
                                prev.map((r) =>
                                  r.id === record.id ? { ...r, reportedAt: e.target.value } : r,
                                ),
                              )
                            }
                            className="h-8 text-xs"
                            style={{ borderColor: '#c2c9bb' }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={record.notes || ''}
                            onChange={(e) =>
                              setRecords((prev) =>
                                prev.map((r) =>
                                  r.id === record.id ? { ...r, notes: e.target.value } : r,
                                ),
                              )
                            }
                            className="h-8 text-sm"
                            style={{ borderColor: '#c2c9bb' }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdate(record.id, record)}
                              className="rounded-lg p-1.5 transition-all hover:scale-110"
                              style={{ backgroundColor: '#154212', color: '#ffffff' }}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
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
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                            style={{ borderColor: '#e5e2e1', color: '#42493e' }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: CATEGORIES.find((c) => c.value === record.category)
                                  ?.color,
                              }}
                            />
                            {CATEGORY_LABELS[record.category]}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: '#1c1b1b' }}>
                          {record.quantity} {record.unit}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#72796e' }}>
                          <div>{record.reportedAt}</div>
                          {record.collectedAt && (
                            <div className="mt-0.5" style={{ color: '#16a34a' }}>
                              ✓ {record.collectedAt}
                            </div>
                          )}
                        </td>
                        <td
                          className="max-w-[180px] truncate px-4 py-3 text-xs"
                          style={{ color: '#72796e' }}
                        >
                          {record.notes}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
                            <button
                              onClick={() => setEditingId(record.id)}
                              className="rounded-lg p-1.5 transition-all hover:scale-110"
                              style={{ color: '#72796e' }}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="rounded-lg p-1.5 transition-all hover:scale-110"
                              style={{ color: '#dc2626' }}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
            totalItems={records.length}
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
