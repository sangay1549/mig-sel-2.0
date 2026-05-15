import { MapView } from '@/features/map/components/map-view';
import { useMapTickets } from '@/features/map/api/use-map-tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketStatusBadge } from '@/features/tickets/components/ticket-status-badge';
import type { TicketStatus } from '@/features/tickets/types';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { List, PlusCircle } from 'lucide-react';

export const MapPage = () => {
  const { data: pins } = useMapTickets();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Issue Map</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Explore reported issues across Gelephu Mindfulness City. Green pins are active, red pins
            are urgent.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/tickets">
              <List className="size-4" />
              List View
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/report">
              <PlusCircle className="size-4" />
              Report Issue
            </Link>
          </Button>
        </div>
      </div>

      <MapView height="600px" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Pins ({pins?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(pins ?? []).slice(0, 12).map((pin) => (
              <Link
                key={pin.id}
                to={`/tickets/${pin.id}`}
                className="hover:bg-accent/40 flex items-center gap-3 rounded-sm p-2 transition-colors"
              >
                <div
                  className={`size-3 shrink-0 rounded-full ${
                    pin.priority_level === 'urgent' ? 'bg-destructive' : 'bg-primary'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pin.category_name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {pin.description.slice(0, 60)}
                  </p>
                </div>
                <TicketStatusBadge status={pin.status as TicketStatus} />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
