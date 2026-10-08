import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

const RIDES = [
  { key: 'coffee', time: '07:30', going: 14 },
  { key: 'hills', time: '09:00', going: 9 },
  { key: 'beginner', time: '08:00', going: 22 },
  { key: 'gravel', time: '10:15', going: 7 },
] as const;

export function ExampleRides() {
  const t = useTranslations('LandingPage.exampleRides');

  return (
    <div className="border-border bg-secondary flex flex-col overflow-hidden rounded-[18px] border">
      <div className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-[18px] py-3.5 uppercase">
        <Text variant="meta">{t('heading')}</Text>
        <Text variant="meta">{t('count', { count: RIDES.length })}</Text>
      </div>
      <ul className="divide-border divide-y">
        {RIDES.map((ride) => (
          <li
            key={ride.key}
            className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 p-[18px] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-4"
          >
            <div className="font-data flex flex-col leading-[1.2]">
              <span className="text-muted-foreground text-[11px] uppercase">
                {t(`rides.${ride.key}.day`)}
              </span>
              <span className="text-[17px] font-medium">{ride.time}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1 wrap-break-word">
              <span className="text-[15px] font-semibold">{t(`rides.${ride.key}.name`)}</span>
              <Text variant="body-s" className="text-muted-foreground">
                {t(`rides.${ride.key}.meta`)}
              </Text>
            </div>
            <Badge variant="accentDeep" className="font-data">
              {t('going', { count: ride.going })}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
