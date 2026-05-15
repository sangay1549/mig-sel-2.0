import { useTickets } from '../api/use-tickets';
import { TicketCard } from './ticket-card';
import type { TicketListFilters } from '../types';

type TicketListProps = {
  filters?: TicketListFilters;
};

export const TicketList = ({ filters }: TicketListProps) => {
  const { data: tickets, isLoading, error } = useTickets(filters);

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Loading tickets…</p>;
  }

  if (error) {
    return <p className="text-destructive py-8 text-center text-sm">Failed to load tickets.</p>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No tickets found. Be the first to report an issue!
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
