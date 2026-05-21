import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useWasteRecords } from '@/features/waste/api/use-waste-records';
import { useCreateWasteRecord } from '@/features/waste/api/use-create-waste-record';
import { useUpdateWasteRecord } from '@/features/waste/api/use-update-waste-record';
import { useDeleteWasteRecord } from '@/features/waste/api/use-delete-waste-record';
import { CATEGORIES, CATEGORY_LABELS } from '@/features/waste/constants';
import type { WasteRecord as WasteRecordType, WasteCategory } from '@/features/waste/types';

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

export const WasteRecord = () => {
  const { data: records = [], isLoading } = useWasteRecords();
  const createRecord = useCreateWasteRecord();
  const updateRecord = useUpdateWasteRecord();
  const deleteRecord = useDeleteWasteRecord();

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

    createRecord.mutate(
      {
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        notes: form.notes,
      },
      {
        onSuccess: () => {
          resetForm();
          setShowForm(false);
          setCurrentPage(1);
        },
      },
    );
  };

  const handleUpdate = (record: WasteRecordType) => {
    updateRecord.mutate(record, {
      onSuccess: () => setEditingId(null),
    });
  };

  const handleDelete = (id: string) => {
    deleteRecord.mutate(id);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          size="sm"
        >
          <Plus className="mr-1 h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Record'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-down bg-card shadow-card rounded-xl border p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <GripVertical className="text-muted-foreground/40 h-4 w-4" />
            <span className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
              New Waste Record
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as WasteCategory })}
                className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-10 w-full items-center rounded-lg border px-3 text-sm transition-all outline-none focus-visible:ring-2"
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
                <label className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
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
                />
              </div>
              <div className="w-24 space-y-1.5">
                <label className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-10 w-full items-center rounded-lg border px-2 text-sm transition-all outline-none focus-visible:ring-2"
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="liter">liter</option>
                  <option value="cubic meter">m³</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
              <label className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional details..."
                className="border-input bg-card text-foreground placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-ring/30 min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-2"
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
            <Button type="submit" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </form>
      )}

      <Card className="shadow-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Category
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Quantity
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Date
                </th>
                <th className="text-muted-foreground/60 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Notes
                </th>
                <th className="text-muted-foreground/60 w-24 px-4 py-3.5 text-xs font-bold tracking-wide uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="text-muted-foreground/60 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground/40 px-4 py-16 text-center text-sm"
                  >
                    No waste records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="group border-accent/50 hover:bg-muted/50 border-b transition-colors last:border-0"
                  >
                    {editingId === record.id ? (
                      <>
                        <td className="px-4 py-2">
                          <select
                            value={record.category}
                            onChange={(e) => {
                              const updated = {
                                ...record,
                                category: e.target.value as WasteCategory,
                              };
                              setEditingId(null);
                              handleUpdate(updated);
                            }}
                            className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 w-full rounded-lg border px-2 text-xs outline-none focus-visible:ring-2"
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
                              defaultValue={record.quantity}
                              onBlur={(e) => {
                                const updated = { ...record, quantity: Number(e.target.value) };
                                setEditingId(null);
                                handleUpdate(updated);
                              }}
                              className="h-8 w-20 text-sm"
                            />
                            <select
                              defaultValue={record.unit}
                              onChange={(e) => {
                                const updated = { ...record, unit: e.target.value };
                                setEditingId(null);
                                handleUpdate(updated);
                              }}
                              className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 rounded-lg border px-1 text-xs outline-none focus-visible:ring-2"
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
                            defaultValue={record.reportedAt}
                            onBlur={(e) => {
                              const updated = { ...record, reportedAt: e.target.value };
                              setEditingId(null);
                              handleUpdate(updated);
                            }}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            defaultValue={record.notes || ''}
                            onBlur={(e) => {
                              const updated = { ...record, notes: e.target.value };
                              setEditingId(null);
                              handleUpdate(updated);
                            }}
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-muted-foreground/60 hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className="border-border/50 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
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
                        <td className="text-foreground px-4 py-3 font-medium">
                          {record.quantity} {record.unit}
                        </td>
                        <td className="text-muted-foreground/70 px-4 py-3 text-xs">
                          <div>{record.reportedAt}</div>
                          {record.collectedAt && (
                            <div className="mt-0.5 text-green-600">✓ {record.collectedAt}</div>
                          )}
                        </td>
                        <td className="text-muted-foreground/70 max-w-[180px] truncate px-4 py-3 text-xs">
                          {record.notes}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
                            <button
                              onClick={() => setEditingId(record.id)}
                              className="text-muted-foreground/60 hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-all"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-all"
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
      </Card>
    </div>
  );
};
