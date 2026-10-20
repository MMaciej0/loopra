import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function LandingFooter() {
  const t = useTranslations('LandingPage.footer');
  const linkClass = 'hover:text-foreground transition-colors';

  return (
    <footer className="border-border text-muted-foreground border-t text-[13px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap justify-between gap-4 px-[clamp(20px,4vw,48px)] py-7">
        <span>{t('copyright', { year: String(new Date().getFullYear()) })}</span>
        <nav aria-label={t('navLabel')} className="flex gap-6">
          <Link href="/privacy" className={linkClass}>
            {t('privacy')}
          </Link>
          <Link href="/terms" className={linkClass}>
            {t('terms')}
          </Link>
          <Link href="/contact" className={linkClass}>
            {t('contact')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
