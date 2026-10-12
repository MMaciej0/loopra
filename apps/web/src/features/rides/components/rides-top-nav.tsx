'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import TopNav from '@/features/shell/components/top-nav';

const LINKS = [
  { key: 'discover', href: '/rides' },
  { key: 'myRides', href: '/my-rides' },
] as const;

export function RidesTopNav() {
  const t = useTranslations('RidesNav');
  const pathname = usePathname();

  return (
    <TopNav>
      <nav aria-label={t('label')} className="flex items-center gap-1">
        {LINKS.map(({ key, href }) => {
          const isActive = pathname === href;

          return (
            <Button
              key={key}
              asChild
              variant="ghost"
              size="sm"
              data-active={isActive}
              className={cn(
                'text-muted-foreground h-9',
                'data-[active=true]:bg-muted data-[active=true]:text-foreground',
              )}
            >
              <Link href={href} aria-current={isActive ? 'page' : undefined}>
                {t(key)}
              </Link>
            </Button>
          );
        })}
      </nav>
    </TopNav>
  );
}
