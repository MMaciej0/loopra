import { List, Map } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { RIDES_VIEWS, type RidesView } from '../view';

const VIEW_OPTIONS = {
  map: { icon: Map, labelKey: 'viewMap' },
  list: { icon: List, labelKey: 'viewList' },
} as const;

export async function RidesViewToggle({ view }: { view: RidesView }) {
  const t = await getTranslations('RidesPage');

  return (
    <div
      role="group"
      aria-label={t('viewToggleLabel')}
      className="flex shrink-0 items-center gap-1.5"
    >
      {RIDES_VIEWS.map((candidate) => {
        const { icon: Icon, labelKey } = VIEW_OPTIONS[candidate];
        const isActive = candidate === view;

        return (
          <Button
            key={candidate}
            asChild
            variant="chip"
            className={cn(
              isActive && 'bg-accent/10 text-foreground border-accent hover:border-accent',
            )}
          >
            <Link
              href={{ pathname: '/rides', query: { view: candidate } }}
              replace
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-3.5" />
              {t(labelKey)}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
