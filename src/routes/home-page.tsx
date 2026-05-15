import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { MapView } from '@/features/map/components/map-view';
import { Leaderboard } from '@/features/gamification/components/leaderboard';
import { TicketList } from '@/features/tickets/components/ticket-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, PlusCircle, List, Shield, Trophy, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-12">
      <section className="from-primary/5 via-background to-background relative overflow-hidden bg-gradient-to-b px-6 pt-20 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Report Issues. <span className="text-primary">Track Repairs.</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
            GMC Resonance connects residents with city services. Report potholes, broken
            streetlights, drainage issues, and more — then watch as your community comes together to
            get things fixed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/report">
                <PlusCircle className="size-5" />
                Report an Issue
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/map">
                <MapPin className="size-5" />
                View Map
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="gap-2">
              <Link to="/tickets">
                <List className="size-5" />
                Browse Reports
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Reports</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tickets">
              View all <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <TicketList />
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Live Map</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/map">
                  Full map <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
            <MapView height="400px" />
          </div>
          <div>
            <Leaderboard />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="text-primary size-5" />
                Anonymous Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Submit reports without revealing your identity. Your privacy is protected.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <List className="text-primary size-5" />
                Real-Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Follow your report from submission through verification, assignment, and resolution.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="text-primary size-5" />
                Community Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Earn points for reporting, supporting, and helping your neighborhood.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
