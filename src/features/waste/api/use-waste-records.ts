import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { WasteRecord, WasteCategory } from '@/features/waste/types';

type RawRecord = {
  id: string;
  category: WasteCategory;
  quantity: number;
  unit: string;
  reported_at: string;
  collected_at: string | null;
  notes: string;
};

const mapRecord = (row: RawRecord): WasteRecord => ({
  id: row.id,
  category: row.category,
  quantity: Number(row.quantity),
  unit: row.unit,
  reportedAt: row.reported_at,
  collectedAt: row.collected_at,
  notes: row.notes,
});

export const wasteKeys = {
  all: ['waste-records'] as const,
};

export const useWasteRecords = () => {
  return useQuery({
    queryKey: wasteKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_records')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) throw error;
      return (data as RawRecord[]).map(mapRecord);
    },
  });
};
