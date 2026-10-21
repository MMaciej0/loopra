import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Link } from '@/i18n/navigation';

const RIDES = [
  { key: 'coffee', time: '07:30', going: 14, participants: ['Anna', 'Tomek', 'Ewa'] },
  { key: 'hills', time: '09:00', going: 9, participants: ['Bartek', 'Kasia', 'Jan'] },
  { key: 'beginner', time: '08:00', going: 22, participants: ['Zosia', 'Leo', 'Michał'] },
  { key: 'gravel', time: '10:15', going: 7, participants: ['Kuba', 'Hania', 'Paweł'] },
] as const;

export function ExampleRides() {
  const t = useTranslations('LandingPage.exampleRides');

  return (
    <Link
      href="/register"
      aria-label={t('cta')}
      className="group border-border bg-secondary hover:border-border-strong hover:bg-secondary-hover focus-visible:border-ring focus-visible:ring-ring/50 flex flex-col overflow-hidden rounded-[20px] border transition-[color,background-color,border-color,box-shadow,scale] outline-none focus-visible:ring-3 active:scale-[0.98]"
    >
      <div className="border-border flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-[18px] py-3.5">
        <Text variant="meta" className="text-muted-foreground uppercase">
          {t('heading')}
        </Text>
        <Text variant="body-s" className="text-foreground/70">
          {t('subheading')}
        </Text>
      </div>
      <ul className="divide-border divide-y">
        {RIDES.map((ride) => (
          <li
            key={ride.key}
            className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 p-[18px] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-x-4"
          >
            <div className="font-data row-span-2 flex flex-col gap-0.5 leading-[1.2] sm:row-span-1">
              <Text variant="meta" className="text-muted-foreground uppercase">
                {t(`rides.${ride.key}.day`)}
              </Text>
              <span className="text-[17px] font-medium">{ride.time}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1 wrap-break-word">
              <span className="text-[15px] font-semibold">{t(`rides.${ride.key}.name`)}</span>
              <Text variant="body-s" className="text-muted-foreground">
                {t(`rides.${ride.key}.meta`)}
              </Text>
            </div>
            <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:row-start-1">
              <div aria-hidden className="flex -space-x-2">
                {ride.participants.map((name) => (
                  <UserAvatar
                    key={name}
                    size="sm"
                    name={name}
                    className="ring-secondary group-hover:ring-secondary-hover ring-2 transition-shadow"
                  />
                ))}
              </div>
              <Badge variant="accentDeep" className="font-data">
                {t('going', { count: ride.going })}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-border text-accent-deep flex items-center justify-between gap-3 border-t px-[18px] py-3.5">
        <span className="font-ui text-[15px] font-semibold">{t('cta')}</span>
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
