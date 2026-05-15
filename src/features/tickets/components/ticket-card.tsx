import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketStatusBadge } from './ticket-status-badge';
import type { Ticket } from '../types';
import { CATEGORIES } from '../types';

type TicketCardProps = {
  ticket: Ticket;
};

const categoryName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? 'Unknown';

export const TicketCard = ({ ticket }: TicketCardProps) => {
  const firstMedia = ticket.media?.[0];

  return (
    <Link to={`/tickets/${ticket.id}`} className="block">
      <Card className="hover:bg-accent/40 h-full transition-colors">
        {firstMedia ? (
          <img
            src={firstMedia.file_url}
            alt="Issue"
            className="h-40 w-full rounded-t-lg object-cover"
          />
        ) : null}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {categoryName(ticket.category_id)}
            </CardTitle>
            <TicketStatusBadge status={ticket.status} />
          </div>
          {ticket.priority_level === 'urgent' ? (
            <span className="text-destructive text-xs font-semibold tracking-wide uppercase">
              Urgent
            </span>
          ) : null}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2 text-sm">{ticket.description}</p>
          <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
            {ticket.support_count > 0 ? (
              <span>
                {ticket.support_count} support{ticket.support_count !== 1 ? 's' : ''}
              </span>
            ) : null}
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
            {ticket.is_anonymous ? <span>Anonymous</span> : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
