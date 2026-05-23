import { useState, useRef, useEffect } from 'react';
import {
  FilePlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Loader2,
  Archive,
  RotateCcw,
  MoreVertical,
  Check,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  SheetRoot,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useWasteRecords } from '@/features/waste/api/use-waste-records';
import { useArchivedWasteRecords } from '@/features/waste/api/use-archived-waste-records';
import { useCreateWasteRecord } from '@/features/waste/api/use-create-waste-record';
import { useUpdateWasteRecord } from '@/features/waste/api/use-update-waste-record';
import { useDeleteWasteRecord } from '@/features/waste/api/use-delete-waste-record';
import { useRestoreWasteRecord } from '@/features/waste/api/use-restore-waste-record';
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border-input bg-background text-foreground focus:ring-ring/30 h-8 rounded-lg border px-2 text-sm transition-all outline-none focus:ring-2"
        >
          {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground text-sm">
          {startItem}–{endItem} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg p-2 transition-all disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => (
            <span key={p} className="flex items-center">
              {idx > 0 && arr[idx - 1] !== p - 1 ? (
                <span className="text-muted-foreground/50 px-1 text-sm">...</span>
              ) : null}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  'flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-all',
                  p === currentPage
                    ? 'bg-primary text-primary-foreground shadow-sm'
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
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg p-2 transition-all disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const WasteRecord = () => {
  const { data: records = [], isLoading } = useWasteRecords();
  const { data: archived = [], isLoading: archivedLoading } = useArchivedWasteRecords();
  const createRecord = useCreateWasteRecord();
  const updateRecord = useUpdateWasteRecord();
  const deleteRecord = useDeleteWasteRecord();
  const restoreRecord = useRestoreWasteRecord();

  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<WasteRecordType | null>(null);
  const [editQuantityStr, setEditQuantityStr] = useState('');
  const [editedIds, setEditedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    record: WasteRecordType;
  } | null>(null);
  const [confirmReason, setConfirmReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [form, setForm] = useState({
    category: '' as WasteCategory | '',
    quantity: '',
    unit: '',
    reportedAt: '',
    notes: '',
  });

  const resetForm = () =>
    setForm({
      category: '',
      quantity: '',
      unit: '',
      reportedAt: '',
      notes: '',
    });

  const totalPages = Math.ceil(records.length / itemsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing: string[] = [];
    if (!form.category) missing.push('Category');
    if (!form.quantity) missing.push('Quantity');
    if (!form.unit) missing.push('Unit');
    if (!form.reportedAt) missing.push('Date');

    if (missing.length > 0) {
      alert(`Please fill in the following required fields:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (
      !window.confirm(
        'Submit this waste record? All entries are audited and cannot be casually modified after submission.',
      )
    )
      return;

    createRecord.mutate(
      {
        category: form.category as WasteCategory,
        quantity: Number(form.quantity),
        unit: form.unit,
        reportedAt: form.reportedAt,
        notes: form.notes,
      },
      {
        onSuccess: () => {
          resetForm();
          setDialogOpen(false);
          setCurrentPage(1);
        },
      },
    );
  };

  const handleUpdate = (record: WasteRecordType) => {
    const payload = { ...record, quantity: parseFloat(editQuantityStr) || 0 };
    updateRecord.mutate(payload, {
      onSuccess: () => {
        setEditingId(null);
        setEditForm(null);
        setEditedIds((prev) => new Set(prev).add(record.id));
      },
      onError: (err) => alert(err?.message || 'Failed to save changes'),
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm || !confirmReason.trim()) return;
    deleteRecord.mutate({ id: deleteConfirm.record.id, reason: confirmReason.trim() });
    setDeleteConfirm(null);
    setConfirmReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="bg-muted/70 flex gap-1 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('active')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              viewMode === 'active'
                ? 'bg-card text-foreground ring-border/50 shadow-sm ring-1'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="h-4 w-4" />
            Active
          </button>
          <button
            type="button"
            onClick={() => setViewMode('archived')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              viewMode === 'archived'
                ? 'bg-card text-foreground ring-border/50 shadow-sm ring-1'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Archive className="h-4 w-4" />
            Archived
          </button>
        </div>

        {viewMode === 'active' && (
          <SheetRoot
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <SheetTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs transition-all hover:shadow-md active:scale-95">
                <FilePlus className="h-4 w-4" />
                Add Record
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="flex flex-row items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="animate-in fade-in-0 slide-in-from-right-4 flex flex-col gap-1 duration-300 [animation-delay:0ms]">
                  <SheetTitle>New Waste Record</SheetTitle>
                  <SheetDescription>
                    Fill in the details below to add a new waste record.
                  </SheetDescription>
                </div>
                <SheetClose className="text-muted-foreground hover:text-foreground animate-in fade-in-0 slide-in-from-right-4 rounded-lg p-1.5 transition-all duration-300 [animation-delay:50ms]">
                  <X className="h-4 w-4" />
                </SheetClose>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  <div className="animate-in fade-in-0 slide-in-from-right-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 rounded-lg border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-xs shadow-xs duration-300 [animation-delay:50ms]">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-800">
                        !
                      </div>
                      <div>
                        <span className="font-semibold text-amber-800">Crucial data entry.</span>{' '}
                        <span className="text-amber-700">
                          All inputs are audited. Records cannot be casually edited or deleted once
                          submitted.
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} id="add-record-form" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="animate-in fade-in-0 slide-in-from-right-4 space-y-1.5 duration-300 [animation-delay:100ms]">
                        <label className="text-foreground text-xs font-semibold tracking-wide">
                          Category
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm({ ...form, category: e.target.value as WasteCategory })
                          }
                          className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-9 w-full items-center rounded-lg border px-3 text-sm transition-all outline-none focus-visible:ring-2"
                        >
                          <option value="" disabled>
                            Select a category
                          </option>
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="animate-in fade-in-0 slide-in-from-right-4 space-y-1.5 duration-300 [animation-delay:150ms]">
                        <label className="text-foreground text-xs font-semibold tracking-wide">
                          Quantity
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1">
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
                          <div className="w-24">
                            <select
                              value={form.unit}
                              onChange={(e) => setForm({ ...form, unit: e.target.value })}
                              className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-9 w-full items-center rounded-lg border px-2 text-sm transition-all outline-none focus-visible:ring-2"
                            >
                              <option value="" disabled>
                                Unit
                              </option>
                              <option value="kg">kg</option>
                              <option value="ton">ton</option>
                              <option value="liter">liter</option>
                              <option value="cubic meter">m³</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="animate-in fade-in-0 slide-in-from-right-4 space-y-1.5 duration-300 [animation-delay:200ms]">
                        <label className="text-foreground text-xs font-semibold tracking-wide">
                          Date
                        </label>
                        <Input
                          type="date"
                          value={form.reportedAt}
                          onChange={(e) => setForm({ ...form, reportedAt: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="animate-in fade-in-0 slide-in-from-right-4 space-y-1.5 duration-300 [animation-delay:250ms]">
                        <label className="text-foreground text-xs font-semibold tracking-wide">
                          Remarks
                        </label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="Additional details..."
                          className="border-input bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-ring/30 min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-2"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="animate-in fade-in-0 slide-in-from-right-4 flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4 duration-300 [animation-delay:300ms]">
                <SheetClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" form="add-record-form">
                  <FilePlus className="mr-1.5 h-4 w-4" />
                  Add Record
                </Button>
              </div>
            </SheetContent>
          </SheetRoot>
        )}
      </div>

      {viewMode === 'active' && (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60">
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Category
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Quantity
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Remarks
                  </th>
                  <th className="w-16 bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-20 text-center">
                      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading records...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-muted-foreground px-5 py-20 text-center text-sm"
                    >
                      No waste records found
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => {
                    const dotColor: Record<string, string> = {
                      'organic-food': 'bg-emerald-500',
                      'paper-cardboard': 'bg-blue-500',
                      'plastic-soft-packaging': 'bg-amber-500',
                      'plastic-pet-hdpe': 'bg-red-500',
                      textile: 'bg-purple-500',
                      glass: 'bg-cyan-500',
                      'metal-aluminum': 'bg-indigo-500',
                      'e-waste': 'bg-orange-500',
                      'infectious-waste': 'bg-rose-500',
                      'leather-rubber': 'bg-stone-500',
                      wood: 'bg-yellow-600',
                      'sanitary-waste': 'bg-slate-500',
                      'green-plant-materials': 'bg-green-600',
                      'construction-demolition': 'bg-amber-700',
                    };
                    return (
                      <tr
                        key={record.id}
                        className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                      >
                        {editingId === record.id && editForm ? (
                          <>
                            <td className="px-5 py-2.5">
                              <select
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    category: e.target.value as WasteCategory,
                                  })
                                }
                                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 w-full rounded-lg border px-2 text-sm outline-none focus-visible:ring-2"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  value={editQuantityStr}
                                  onChange={(e) => setEditQuantityStr(e.target.value)}
                                  className="h-8 w-20 text-sm"
                                />
                                <select
                                  value={editForm.unit}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, unit: e.target.value })
                                  }
                                  className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 rounded-lg border px-1 text-sm outline-none focus-visible:ring-2"
                                >
                                  <option value="kg">kg</option>
                                  <option value="ton">ton</option>
                                  <option value="liter">L</option>
                                  <option value="cubic meter">m³</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-5 py-2.5">
                              <Input
                                type="date"
                                value={editForm.reportedAt}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, reportedAt: e.target.value })
                                }
                                className="h-8 text-sm"
                              />
                            </td>
                            <td className="px-5 py-2.5">
                              <textarea
                                value={editForm.notes || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, notes: e.target.value })
                                }
                                className="border-input bg-background text-foreground placeholder:text-muted-foreground/50 min-h-[60px] w-full resize-none rounded-lg border px-2 py-1.5 text-sm outline-none"
                              />
                            </td>
                            <td className="px-5 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdate(editForm)}
                                  disabled={updateRecord.isPending}
                                  className="rounded-lg p-1.5 text-emerald-600 transition-all hover:bg-emerald-50 disabled:opacity-40"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditForm(null);
                                    setEditQuantityStr('');
                                  }}
                                  className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-all"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full ${dotColor[record.category] || 'bg-slate-400'} ring-1 ring-slate-900/5`}
                                />
                                <span className="text-sm font-medium text-slate-900">
                                  {CATEGORY_LABELS[record.category]}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="font-semibold text-slate-900 tabular-nums">
                                {Number(record.quantity).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span className="ml-1 text-xs font-normal text-slate-400">
                                {record.unit}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-mono text-sm text-slate-600 tabular-nums">
                                {record.reportedAt}
                              </span>
                            </td>
                            <td className="max-w-[200px] px-5 py-3.5">
                              {record.notes ? (
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="block truncate text-sm text-slate-500 italic"
                                    title={record.notes}
                                  >
                                    {record.notes}
                                  </span>
                                  {(record.editCount > 0 || editedIds.has(record.id)) && (
                                    <span className="text-muted-foreground/40 shrink-0 text-xs">
                                      (edited)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-300 italic">—</span>
                              )}
                            </td>
                            <td className="relative px-5 py-3.5 text-right">
                              <button
                                onClick={() =>
                                  setDropdownOpenId(dropdownOpenId === record.id ? null : record.id)
                                }
                                className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {dropdownOpenId === record.id && (
                                <div
                                  ref={dropdownRef}
                                  className="bg-card border-border absolute top-full right-5 z-50 mt-1 w-36 rounded-lg border py-1 shadow-lg"
                                >
                                  <button
                                    onClick={() => {
                                      setDropdownOpenId(null);
                                      if (record.editCount >= 2) {
                                        alert(
                                          'This record has already been edited 2 times and can no longer be modified.',
                                        );
                                        return;
                                      }
                                      setEditingId(record.id);
                                      setEditForm({ ...record });
                                      setEditQuantityStr(String(record.quantity));
                                    }}
                                    className="text-foreground hover:bg-accent flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDropdownOpenId(null);
                                      setDeleteConfirm({ record });
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3.5">
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
      )}

      {viewMode === 'archived' && (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60">
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Category
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Quantity
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Archived On
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Reason
                  </th>
                  <th className="bg-slate-50/75 px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {archivedLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading archived records...</span>
                      </div>
                    </td>
                  </tr>
                ) : archived.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground px-5 py-20 text-center text-sm"
                    >
                      No archived records
                    </td>
                  </tr>
                ) : (
                  archived.map((record) => {
                    return (
                      <tr
                        key={record.id}
                        className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-3.5 opacity-60">
                          <span className="text-foreground text-sm font-medium">
                            {CATEGORY_LABELS[record.category]}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right opacity-60">
                          <span className="text-foreground font-semibold tabular-nums">
                            {Number(record.quantity).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-muted-foreground/50 ml-1 text-sm font-normal">
                            {record.unit}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 opacity-60">
                          <span className="text-muted-foreground text-sm">{record.reportedAt}</span>
                        </td>
                        <td className="text-muted-foreground px-5 py-3.5 text-sm">
                          {record.deletedAt ? (
                            new Date(record.deletedAt).toLocaleDateString()
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="text-muted-foreground max-w-xs px-5 py-3.5 text-sm break-words whitespace-pre-wrap">
                          {record.deletionReason || (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => restoreRecord.mutate(record.id)}
                            disabled={restoreRecord.isPending}
                            className="text-muted-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 hover:bg-blue-50 hover:text-blue-600"
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DialogRoot
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirm(null);
            setConfirmReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              The record will be archived and hidden from the main view. It can be restored later if
              needed.
            </DialogDescription>
          </DialogHeader>

          {deleteConfirm && (
            <div className="bg-muted/50 space-y-1.5 rounded-lg px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Category</span>
                <span className="text-foreground font-medium">
                  {CATEGORY_LABELS[deleteConfirm.record.category]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Quantity</span>
                <span className="text-foreground font-medium tabular-nums">
                  {deleteConfirm.record.quantity} {deleteConfirm.record.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Date</span>
                <span className="text-foreground font-medium">
                  {deleteConfirm.record.reportedAt}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-foreground text-xs font-semibold tracking-wide">
              Reason for deletion *
            </label>
            <textarea
              value={confirmReason}
              onChange={(e) => setConfirmReason(e.target.value)}
              placeholder="Explain why this record needs to be deleted..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-ring/30 min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none focus-visible:ring-2"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" disabled={!confirmReason.trim()} onClick={handleDeleteConfirm}>
              Archive Record
            </Button>
          </div>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
