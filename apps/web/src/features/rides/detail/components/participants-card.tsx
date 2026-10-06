'use client';

import { useState } from 'react';
import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardLabel } from '@/components/ui/card';

const COLLAPSED_COUNT = 5;

type Props = Readonly<{
  ride: RideDetail;
}>;

export function ParticipantsCard({ ride }: Props) {
  const t = useTranslations('RidePage');
  const [isExpanded, setIsExpanded] = useState(false);

  const total = ride.participants.length;

  if (total === 0) {
    return null;
  }

  const visible = isExpanded ? ride.participants : ride.participants.slice(0, COLLAPSED_COUNT);

  return (
    <Card className="flex h-[340px] flex-col xl:h-auto xl:max-h-[480px] xl:min-h-0">
      <CardLabel className="mb-3.5">{t('participantsHeading')}</CardLabel>
      <ul className="-mr-2.5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-2.5">
        {visible.map(({ user }) => {
          const name = user.username || t('organiserUnknown');

          return (
            <li key={user.id} className="flex items-center gap-2.5">
              <UserAvatar name={name} />
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className="font-ui text-foreground truncate text-[13.5px] font-medium">
                  {name}
                </span>
                {user.id === ride.creator.id && (
                  <span className="font-ui text-accent-deep shrink-0 text-[11.5px] font-medium">
                    {t('participantsOrganiser')}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {!isExpanded && total > COLLAPSED_COUNT && (
        <Button
          variant="outline"
          className="mt-4 w-full shrink-0"
          onClick={() => setIsExpanded(true)}
        >
          {t('participantsShowAll', { count: total })}
        </Button>
      )}
    </Card>
  );
}
