import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { RidesView } from '../view';

const PANE_OPTIONS = {
  map: { overflow: 'overflow-hidden', labelKey: 'mapPane' },
  list: { overflow: 'overflow-y-auto', labelKey: 'listPane' },
} as const;

export async function ViewPane({ view }: { view: RidesView }) {
  const t = await getTranslations('RidesPage');
  const { overflow, labelKey } = PANE_OPTIONS[view];

  return (
    <div
      className={cn(
        'border-border flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed',
        overflow,
      )}
    >
      <Text variant="body-xs" className="text-muted-foreground p-6">
        {t(labelKey)}
      </Text>
    </div>
  );
}
