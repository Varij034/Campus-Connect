'use client';

import { Award } from 'lucide-react';
import { CandidateBadge } from '@/types/api';

interface BadgeListProps {
  badges: CandidateBadge[];
  emptyMessage?: string;
}

export default function BadgeList({ badges, emptyMessage = 'No badges yet' }: BadgeListProps) {
  if (!badges || badges.length === 0) {
    return (
      <p className="text-sm text-base-content/60">{emptyMessage}</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((cb) => (
        <span
          key={cb.id}
          className="badge badge-primary badge-lg gap-1"
          title={cb.badge?.description || cb.badge?.name || ''}
        >
          <Award className="w-4 h-4" />
          {cb.badge?.name ?? `Badge #${cb.badge_id}`}
        </span>
      ))}
    </div>
  );
}
