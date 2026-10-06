import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { UserAvatar } from '@/components/ui/avatar';
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

  const name = ride.creator.username ?? ride.creator.email;

  return (
    <section className="bg-card border-border mb-7 rounded-[14px] border px-[22px] py-5">
      <Text variant="label" as="h2" className="text-muted-foreground mb-2.5">
        {t('organiserHeading')}
      </Text>
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
    </section>
  );
}
