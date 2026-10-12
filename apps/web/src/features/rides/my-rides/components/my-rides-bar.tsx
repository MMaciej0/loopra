import { PHASES, RIDE_ROLES } from '@loopra/domain';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { myRidesHref, type MyRidesFilters } from '@/features/rides/my-rides/filters';

type Option = Readonly<{
  key: string;
  label: string;
  href: ReturnType<typeof myRidesHref>;
  isActive: boolean;
}>;

function LinkToggle({ label, options }: Readonly<{ label: string; options: Option[] }>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="border-border bg-secondary flex h-10 shrink-0 items-center gap-0.5 rounded-xl border p-1"
    >
      {options.map(({ key, label: optionLabel, href, isActive }) => (
        <Button
          key={key}
          asChild
          variant={isActive ? 'accent' : 'ghost'}
          className={cn(
            'h-8 rounded-lg px-3 py-0',
            !isActive && 'text-muted-foreground hover:text-foreground hover:bg-transparent',
          )}
        >
          <Link href={href} replace aria-current={isActive ? 'page' : undefined}>
            {optionLabel}
          </Link>
        </Button>
      ))}
    </div>
  );
}

export async function MyRidesBar({ filters }: Readonly<{ filters: MyRidesFilters }>) {
  const t = await getTranslations('MyRidesPage');

  return (
    <div className="border-border flex shrink-0 flex-wrap items-center gap-3 border-b py-3">
      <LinkToggle
        label={t('phaseLabel')}
        options={PHASES.map((phase) => ({
          key: phase,
          label: t(`phase.${phase}`),
          href: myRidesHref({ ...filters, phase }),
          isActive: phase === filters.phase,
        }))}
      />
      <LinkToggle
        label={t('roleLabel')}
        options={([undefined, ...RIDE_ROLES] as const).map((role) => ({
          key: role ?? 'all',
          label: t(`role.${role ?? 'all'}`),
          href: myRidesHref({ ...filters, role }),
          isActive: role === filters.role,
        }))}
      />
    </div>
  );
}
