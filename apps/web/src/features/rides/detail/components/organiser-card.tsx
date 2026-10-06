import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { UserAvatar } from '@/components/ui/avatar';
import { Card, CardLabel } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

type Props = Readonly<{
  ride: RideDetail;
}>;

export function OrganiserCard({ ride }: Props) {
  const t = useTranslations('RidePage');
  const text = ride.description?.trim();

  if (!text) {
    return null;
  }

  const name = ride.creator.username || t('organiserUnknown');

  return (
    <Card className="mb-7">
      <CardLabel>{t('organiserHeading')}</CardLabel>
      <p className="font-editorial text-foreground text-[20px] leading-[1.4] font-normal text-pretty whitespace-pre-line">
        {t('organiserQuote', { text })}
      </p>
      <footer className="border-border mt-4 flex items-center gap-2.5 border-t pt-4">
        <UserAvatar name={name} />
        <div className="flex min-w-0 flex-col">
          <span className="font-ui text-foreground truncate text-[13.5px] font-medium">{name}</span>
          <Text variant="caption" className="text-muted-foreground">
            {t('organiserRole')}
          </Text>
        </div>
      </footer>
    </Card>
  );
}
