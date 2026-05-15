import { useTicket } from '../api/use-ticket';
import { TicketStatusBadge } from './ticket-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, TICKET_STATUS_FLOW } from '../types';
import { MapPin, Calendar, Building2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type TicketDetailProps = {
  ticketId: string;
};

export const TicketDetail = ({ ticketId }: TicketDetailProps) => {
  const { data: ticket, isLoading, error } = useTicket(ticketId);

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>;
  }

  if (error || !ticket) {
    return <p className="text-destructive py-8 text-center text-sm">Ticket not found.</p>;
  }

  const category = CATEGORIES.find((c) => c.id === ticket.category_id);
  const currentStatusIndex = TICKET_STATUS_FLOW.indexOf(ticket.status);
  const beforePhoto = ticket.media?.find((m) => !m.is_completion_photo);
  const afterPhoto = ticket.media?.find((m) => m.is_completion_photo);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{category?.name ?? 'Unknown Issue'}</CardTitle>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <Building2 className="size-3.5" />
                {category?.dept_name ?? 'Unassigned'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {ticket.priority_level === 'urgent' ? (
                <span className="text-destructive flex items-center gap-1 text-xs font-semibold">
                  <AlertTriangle className="size-3.5" />
                  URGENT
                </span>
              ) : null}
              <TicketStatusBadge status={ticket.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed">{ticket.description}</p>

          {ticket.coordinates ? (
            <div className="bg-primary/5 flex items-center gap-2 rounded-sm px-3 py-2 text-sm">
              <MapPin className="text-primary size-4" />
              <span>
                {ticket.coordinates.latitude.toFixed(6)}, {ticket.coordinates.longitude.toFixed(6)}
              </span>
              {ticket.coordinates.accuracy_radius ? (
                <span className="text-muted-foreground text-xs">
                  ±{Math.round(ticket.coordinates.accuracy_radius)}m
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="size-3.5" />
            <span>Reported {new Date(ticket.created_at).toLocaleDateString()}</span>
            {ticket.is_anonymous ? (
              <span className="bg-secondary text-secondary-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                Anonymous
              </span>
            ) : null}
          </div>

          {beforePhoto ? (
            <div>
              <p className="mb-2 text-sm font-medium">Reported Issue</p>
              <img
                src={beforePhoto.file_url}
                alt="Reported issue"
                className="max-h-80 w-full rounded-sm object-cover"
              />
            </div>
          ) : null}

          {afterPhoto ? (
            <div>
              <p className="text-primary mb-2 text-sm font-medium">Completed Work</p>
              <img
                src={afterPhoto.file_url}
                alt="Completed work"
                className="max-h-80 w-full rounded-sm object-cover"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0">
            {TICKET_STATUS_FLOW.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div key={status} className="flex items-center">
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                      isCurrent && !isCompleted ? 'ring-primary/30 ring-2' : '',
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < TICKET_STATUS_FLOW.length - 1 ? (
                    <div
                      className={cn('h-0.5 w-8 sm:w-12', isCompleted ? 'bg-primary' : 'bg-muted')}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="text-muted-foreground mt-3 flex justify-between text-xs">
            {TICKET_STATUS_FLOW.map((s) => (
              <span key={s} className="capitalize first:text-left last:text-right">
                {s.replace('-', ' ')}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {ticket.engagements && ticket.engagements.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Updates ({ticket.engagements.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.engagements
              .filter((e) => e.type === 'comment')
              .map((engagement) => (
                <div
                  key={engagement.id}
                  className="border-muted flex gap-3 border-b pb-3 last:border-0"
                >
                  <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {engagement.user.full_name?.[0] ?? 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {engagement.user.full_name ?? 'Anonymous'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(engagement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {engagement.body ? (
                      <p className="text-muted-foreground mt-1 text-sm">{engagement.body}</p>
                    ) : null}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
