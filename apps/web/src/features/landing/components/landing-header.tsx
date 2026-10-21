import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { Logo } from '@/components/ui/logo';
import { Link } from '@/i18n/navigation';
import { SectionLink } from './section-link';

export function LandingHeader() {
  const t = useTranslations('LandingPage.header');

  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-[clamp(20px,4vw,48px)] py-[22px]">
      <Logo withStagingIndicator />
      <nav aria-label={t('navLabel')} className="flex items-center gap-2 sm:gap-4">
        <Button variant="nav" asChild className="hidden text-[13px] sm:inline-flex">
          <SectionLink sectionId="how-it-works">{t('howItWorks')}</SectionLink>
        </Button>
        <LanguageSwitch />
        <Button variant="outline" size="sm" asChild className="border-border-strong">
          <Link href="/login">{t('signIn')}</Link>
        </Button>
      </nav>
    </header>
  );
}
