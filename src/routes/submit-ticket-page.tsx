import { TicketForm } from '@/features/tickets/components/ticket-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const SubmitTicketPage = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Report an Issue</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Describe the problem, add a photo, and pin the location. Your report will be routed to the
          correct department automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>
            All fields marked are required unless you choose to submit anonymously.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketForm />
        </CardContent>
      </Card>
    </div>
  );
};
