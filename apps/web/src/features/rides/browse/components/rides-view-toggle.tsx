import { List, Map } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ridesHref, type RidesFilters } from '@/features/rides/browse/filters';
import { RIDES_VIEWS, type RidesView } from '@/features/rides/browse/view';

const VIEW_OPTIONS = {
  map: { icon: Map, labelKey: 'viewMap' },
  list: { icon: List, labelKey: 'viewList' },
} as const;

type Props = Readonly<{ view: RidesView; filters: RidesFilters }>;

export async function RidesViewToggle({ view, filters }: Props) {
  const t = await getTranslations('RidesPage');

  return (
    <div
      role="group"
      aria-label={t('viewToggleLabel')}
      className="border-border bg-secondary flex h-10 shrink-0 items-center gap-0.5 rounded-xl border p-1"
    >
      {RIDES_VIEWS.map((candidate) => {
        const { icon: Icon, labelKey } = VIEW_OPTIONS[candidate];
        const isActive = candidate === view;

        return (
          <Button
            key={candidate}
            asChild
            variant={isActive ? 'accent' : 'ghost'}
            className={cn(
              'h-8 rounded-lg px-3 py-0',
              !isActive && 'text-muted-foreground hover:text-foreground hover:bg-transparent',
            )}
          >
            <Link
              href={ridesHref(candidate, filters)}
              replace
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon />
              {t(labelKey)}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
