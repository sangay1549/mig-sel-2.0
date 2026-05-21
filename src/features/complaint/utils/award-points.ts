import { supabase } from '@/lib/supabase';
import type { ComplaintStatus } from '@/features/complaint/types';

const BONUS_MAP: Record<string, { inProgress: number; resolved: number }> = {
  pending: { inProgress: 0, resolved: 0 },
  'in-progress': { inProgress: 1, resolved: 0 },
  resolved: { inProgress: 1, resolved: 2 },
};

const IN_PROGRESS_BIT = 1;
const RESOLVED_BIT = 2;

async function addPoints(reporterId: string, pts: number): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', reporterId)
    .maybeSingle();

  const currentPoints = profile?.points ?? 0;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: reporterId, points: currentPoints + pts });

  if (error) throw error;
}

export async function awardPointsForStatus(
  reporterId: string | null | undefined,
  grievanceId: string,
  oldStatus: ComplaintStatus | null,
  newStatus: ComplaintStatus,
): Promise<void> {
  if (!reporterId) return;

  const oldBonuses = oldStatus ? BONUS_MAP[oldStatus] : { inProgress: 0, resolved: 0 };
  const newBonuses = BONUS_MAP[newStatus];

  const oldTotal = oldBonuses.inProgress + oldBonuses.resolved;
  const newTotal = newBonuses.inProgress + newBonuses.resolved;
  const delta = newTotal - oldTotal;

  if (delta === 0) return;

  let newBits = 0;
  if (newBonuses.inProgress) newBits |= IN_PROGRESS_BIT;
  if (newBonuses.resolved) newBits |= RESOLVED_BIT;

  await Promise.all([
    addPoints(reporterId, delta),
    supabase.from('grievances').update({ bonus_awarded: newBits }).eq('id', grievanceId),
  ]);
}

export async function awardPointsForSubmission(
  reporterId: string | null | undefined,
): Promise<void> {
  if (!reporterId) return;
  await addPoints(reporterId, 1);
}
