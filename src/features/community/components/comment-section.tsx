import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTicketEngagements } from '@/features/community/api/use-engagement';
import { useCreateEngagement } from '@/features/community/api/use-create-engagement';
import { MessageSquare, Send } from 'lucide-react';

type CommentSectionProps = {
  ticketId: string;
  isAuthenticated: boolean;
};

export const CommentSection = ({ ticketId, isAuthenticated }: CommentSectionProps) => {
  const { data: engagements, isLoading } = useTicketEngagements(ticketId);
  const createEngagement = useCreateEngagement();
  const [newComment, setNewComment] = useState('');

  const comments = engagements?.filter((e) => e.type === 'comment') ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createEngagement.mutate(
      { ticket_id: ticketId, type: 'comment', body: newComment.trim() },
      {
        onSuccess: () => setNewComment(''),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-muted flex gap-3 border-b pb-3 last:border-0">
              <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {comment.user.full_name?.[0] ?? 'A'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.user.full_name ?? 'Anonymous'}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {comment.body ? (
                  <p className="text-muted-foreground mt-1 text-sm">{comment.body}</p>
                ) : null}
              </div>
            </div>
          ))
        )}

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || createEngagement.isPending}
            >
              <Send className="size-4" />
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground text-xs">Sign in to add a comment.</p>
        )}
      </CardContent>
    </Card>
  );
};
