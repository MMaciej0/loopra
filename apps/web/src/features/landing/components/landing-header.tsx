import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

interface LandingHeaderProps {
  pathname: string;
}

export function LandingHeader({ pathname }: LandingHeaderProps) {
  const t = useTranslations('LandingPage.header');
  const locale = useLocale();
  const otherLocale = routing.locales.find((candidate) => candidate !== locale) ?? locale;

  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-[clamp(20px,4vw,48px)] py-[22px]">
      <Link href="/" aria-label={t('home')} className="text-foreground">
        <Logo height={24} />
      </Link>
      <nav aria-label={t('navLabel')} className="flex items-center gap-2 sm:gap-4">
        <Button variant="nav" asChild className="hidden text-sm sm:inline-flex">
          <Link href="/#how-it-works">{t('howItWorks')}</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="font-data">
          <Link href={pathname} locale={otherLocale}>
            {otherLocale.toUpperCase()}
            <span className="sr-only">{t('switchLanguage')}</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="border-border-strong">
          <Link href="/login">{t('signIn')}</Link>
        </Button>
      </nav>
    </header>
  );
}
