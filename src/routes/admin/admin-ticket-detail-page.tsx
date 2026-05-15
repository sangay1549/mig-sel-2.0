import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { TicketDetail } from '@/features/tickets/components/ticket-detail';
import { useUpdateTicketStatus } from '@/features/tickets/api/use-update-ticket-status';
import { useUpdateTicketPriority } from '@/features/admin/api/use-admin-tickets';
import { useTicket } from '@/features/tickets/api/use-ticket';
import { TICKET_STATUS_FLOW } from '@/features/tickets/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminTicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: ticket } = useTicket(id ?? '');
  const updateStatus = useUpdateTicketStatus();
  const updatePriority = useUpdateTicketPriority();
  const [note, setNote] = useState('');

  if (!id) return null;
  if (!ticket) return <p className="text-muted-foreground py-8 text-center">Loading…</p>;

  const currentIdx = TICKET_STATUS_FLOW.indexOf(ticket.status);
  const nextStatus =
    currentIdx < TICKET_STATUS_FLOW.length - 1 ? TICKET_STATUS_FLOW[currentIdx + 1] : null;
  const prevStatus = currentIdx > 0 ? TICKET_STATUS_FLOW[currentIdx - 1] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <TicketDetail ticketId={id} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {prevStatus ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateStatus.mutate({
                    ticketId: id,
                    values: { status: prevStatus, note: note || undefined },
                  })
                }
                disabled={updateStatus.isPending}
              >
                ← {prevStatus.replace('-', ' ')}
              </Button>
            ) : null}

            {nextStatus ? (
              <Button
                size="sm"
                onClick={() =>
                  updateStatus.mutate({
                    ticketId: id,
                    values: { status: nextStatus, note: note || undefined },
                  })
                }
                disabled={updateStatus.isPending}
                className="gap-2"
              >
                {nextStatus === 'resolved' ? <CheckCircle2 className="size-4" /> : null}
                Mark as {nextStatus.replace('-', ' ')} →
              </Button>
            ) : null}

            <Button
              variant={ticket.priority_level === 'urgent' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() =>
                updatePriority.mutate({
                  ticketId: id,
                  priority_level: ticket.priority_level === 'urgent' ? 'normal' : 'urgent',
                })
              }
              disabled={updatePriority.isPending}
              className="gap-2"
            >
              <AlertTriangle className="size-4" />
              {ticket.priority_level === 'urgent' ? 'Remove Urgent' : 'Mark Urgent'}
            </Button>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Internal Note
            </label>
            <textarea
              className="bg-card border-input focus-visible:border-ring focus-visible:ring-ring/20 min-h-[60px] w-full rounded-sm border px-3 py-2 text-sm outline-none"
              placeholder="Add a note about this update..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
