import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/ui/text';
import { RidesMapPane } from './rides-map';
import type { RidesView } from '../view';

export async function ViewPane({ view }: { view: RidesView }) {
  if (view === 'map') {
    return <RidesMapPane />;
  }

  const t = await getTranslations('RidesPage');

  return (
    <div className="border-border flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-xl border border-dashed">
      <Text variant="body-xs" className="text-muted-foreground p-6">
        {t('listPane')}
      </Text>
    </div>
  );
}
