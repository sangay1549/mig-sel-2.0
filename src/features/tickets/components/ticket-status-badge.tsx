import type { TicketStatus } from '../types';
import { TICKET_STATUS_LABELS } from '../types';
import { cn } from '@/lib/utils';

type TicketStatusBadgeProps = {
  status: TicketStatus;
  className?: string;
};

const statusStyles: Record<TicketStatus, string> = {
  submitted: 'bg-secondary text-secondary-foreground',
  in_review: 'bg-accent text-accent-foreground',
  assigned: 'bg-primary/10 text-primary',
  in_progress: 'bg-chart-1/10 text-chart-1',
  resolved: 'bg-chart-4/20 text-chart-4',
  closed: 'bg-muted text-muted-foreground',
};

export const TicketStatusBadge = ({ status, className }: TicketStatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className,
      )}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
};
