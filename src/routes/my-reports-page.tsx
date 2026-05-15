import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useUserTickets } from '@/features/tickets/api/use-tickets';
import { TicketCard } from '@/features/tickets/components/ticket-card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { PlusCircle, User } from 'lucide-react';

export const MyReportsPage = () => {
  const { user } = useCurrentUser();
  const { data: tickets, isLoading } = useUserTickets(user?.id ?? '');

  if (!user) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-6 py-24 text-center">
        <User className="text-muted-foreground mx-auto size-12" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to view your reports</h1>
        <p className="text-muted-foreground text-sm">
          You need to be signed in to see your submitted reports and track their progress.
        </p>
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track all the issues you've reported to the city.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/report">
            <PlusCircle className="size-4" />
            New Report
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Loading your reports…</p>
      ) : !tickets || tickets.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-lg">No reports yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Be the first to report an issue in your neighborhood.
          </p>
          <Button asChild className="mt-4">
            <Link to="/report">Report an Issue</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};
