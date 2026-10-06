import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { useContractLines } from '@/features/rides/components/use-contract-lines';

type Props = Readonly<{
  ride: RideDetail;
}>;

export function RideContractCards({ ride }: Props) {
  const t = useTranslations('RideContract');
  const lines = useContractLines(ride);

  return (
    <section className="mb-7">
      <Text variant="label" as="h2" className="text-muted-foreground mb-2.5">
        {t('heading')}
      </Text>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {lines.map((line) => (
          <li
            key={line}
            className="bg-card border-border flex items-start gap-2.5 rounded-[11px] border px-3.5 py-3"
          >
            <span className="bg-accent mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full">
              <Check aria-hidden className="text-accent-foreground size-[11px]" strokeWidth={3} />
            </span>
            <p className="font-ui text-muted-foreground text-[13.5px] leading-[1.4]">{line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
