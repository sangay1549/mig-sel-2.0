import { supabase } from '@/lib/supabase';
import type { ComplaintStatus } from '@/features/complaint/types';

export async function awardPointsForStatus(
  reporterId: string | null | undefined,
  grievanceId: string,
  oldStatus: ComplaintStatus | null,
  newStatus: ComplaintStatus,
): Promise<void> {
  if (!reporterId || !oldStatus || oldStatus === newStatus) {
    if (!reporterId) console.warn('awardPointsForStatus: reporterId is null/undefined');
    if (!oldStatus) console.warn('awardPointsForStatus: oldStatus is null/undefined');
    return;
  }

  const { error } = await supabase.rpc('award_points_for_status_fn', {
    p_reporter_id: reporterId,
    p_grievance_id: grievanceId,
    p_old_status: oldStatus,
    p_new_status: newStatus,
  });

  if (error) throw error;
}

export async function awardPointsForSubmission(
  reporterId: string | null | undefined,
): Promise<void> {
  if (!reporterId) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', reporterId)
    .maybeSingle();

  const currentPoints = profile?.points ?? 0;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: reporterId, points: currentPoints + 1 });

  if (error) throw error;
}
