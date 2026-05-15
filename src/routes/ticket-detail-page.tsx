import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { TicketDetail } from '@/features/tickets/components/ticket-detail';
import { SupportButton } from '@/features/community/components/support-button';
import { CommentSection } from '@/features/community/components/comment-section';
import { useTicket } from '@/features/tickets/api/use-ticket';
import { useUserEngagement } from '@/features/community/api/use-engagement';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { ArrowLeft } from 'lucide-react';

export const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const { data: ticket } = useTicket(id ?? '');
  const { data: userEngagement } = useUserEngagement(id ?? '', user?.id ?? '');

  if (!id) {
    return <p className="text-destructive py-8 text-center text-sm">Invalid ticket ID.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/tickets" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to reports
        </Link>
      </Button>

      <TicketDetail ticketId={id} />

      <div className="flex items-center gap-3">
        <SupportButton
          ticketId={id}
          supportCount={ticket?.support_count ?? 0}
          hasSupported={userEngagement?.type === 'upvote'}
          disabled={!user}
        />
      </div>

      <CommentSection ticketId={id} isAuthenticated={!!user} />
    </div>
  );
};
