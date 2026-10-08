import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link } from '@/i18n/navigation';

export function Hero() {
  const t = useTranslations('LandingPage.hero');

  return (
    <div className="flex min-w-0 flex-col items-start gap-8">
      <Text variant="meta" className="text-muted-foreground flex items-center gap-2.5 uppercase">
        <span aria-hidden className="bg-accent size-2 shrink-0 rounded-full" />
        {t('eyebrow')}
      </Text>
      <h1 className="font-editorial text-[clamp(52px,8.4vw,120px)] leading-[0.92] font-semibold tracking-[-0.045em] text-balance wrap-break-word">
        {t.rich('headline', { br: () => <br /> })}
      </h1>
      <Text variant="body-l" className="text-foreground/70 max-w-[460px] text-pretty">
        {t('body')}
      </Text>
      <Button variant="accent" size="lg" asChild>
        <Link href="/register">
          {t('getStarted')}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
