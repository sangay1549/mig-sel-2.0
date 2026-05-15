import { useState } from 'react';
import { Link } from 'react-router';
import { TicketList } from '@/features/tickets/components/ticket-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { TicketStatus } from '@/features/tickets/types';
import { TICKET_STATUS_LABELS } from '@/features/tickets/types';

export const TicketsListPage = () => {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Community Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse issues reported by residents. Support issues to help prioritize them.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/report">
            <PlusCircle className="size-4" />
            Report Issue
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !statusFilter
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All
        </button>
        {(Object.entries(TICKET_STATUS_LABELS) as [TicketStatus, string][]).map(
          ([status, label]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? undefined : status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>

      <TicketList filters={{ status: statusFilter }} />
    </div>
  );
};
