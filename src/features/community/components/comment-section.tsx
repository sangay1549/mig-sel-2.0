import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useFeedComments, useCreateComment } from '../api/use-feed-comments';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ActivityItem } from '../types';

interface CommentSectionProps {
  item: ActivityItem;
}

export const CommentSection = ({ item }: CommentSectionProps) => {
  const { user } = useCurrentUser();
  const { data: comments, isLoading } = useFeedComments(item.id);
  const { mutate: createComment, isPending } = useCreateComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isPending) return;
    createComment(
      { feedId: item.id, body: newComment.trim() },
      { onSuccess: () => setNewComment('') },
    );
  };

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800">
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="text-sm font-medium">{item.commentCount}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Comments ({comments?.length ?? 0})
          </DialogTitle>
          <DialogClose asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-gray-400">Loading comments...</p>
          ) : !comments || comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {comment.user_initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-900">{comment.user_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-700">{comment.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {user ? (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-100 pt-3"
          >
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || isPending}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <p className="border-t border-gray-100 pt-3 text-center text-xs text-gray-400">
            Sign in to add a comment.
          </p>
        )}
      </DialogContent>
    </DialogRoot>
  );
};
