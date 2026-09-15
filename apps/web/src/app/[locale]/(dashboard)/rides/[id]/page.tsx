import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/ui/text';

export default async function RidePage() {
  const t = await getTranslations('RidesPage');

  return (
    <div className="border-border flex h-full min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed">
      <Text variant="body-xs" className="text-muted-foreground p-6">
        {t('ridePagePlaceholder')}
      </Text>
    </div>
  );
}
