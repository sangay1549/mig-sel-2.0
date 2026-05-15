import { Button } from '@/components/ui/button';
import { useCreateEngagement } from '@/features/community/api/use-create-engagement';
import { ThumbsUp } from 'lucide-react';

type SupportButtonProps = {
  ticketId: string;
  supportCount: number;
  hasSupported: boolean;
  disabled?: boolean;
};

export const SupportButton = ({
  ticketId,
  supportCount,
  hasSupported,
  disabled,
}: SupportButtonProps) => {
  const createEngagement = useCreateEngagement();

  const handleSupport = () => {
    if (hasSupported) return;
    createEngagement.mutate({ ticket_id: ticketId, type: 'upvote' });
  };

  return (
    <Button
      type="button"
      variant={hasSupported ? 'secondary' : 'outline'}
      size="sm"
      onClick={handleSupport}
      disabled={disabled || hasSupported || createEngagement.isPending}
      className="gap-2"
    >
      <ThumbsUp className={cn('size-4', hasSupported ? 'fill-current' : '')} />
      <span>{supportCount}</span>
      {hasSupported ? ' Supported' : ' Support'}
    </Button>
  );
};

import { cn } from '@/lib/utils';
