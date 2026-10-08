import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const CONTACT_EMAIL = 'loopra67@gmail.com';

export function LandingFooter() {
  const t = useTranslations('LandingPage.footer');
  const linkClass = 'hover:text-foreground transition-colors';

  return (
    <footer className="border-border text-muted-foreground border-t text-[13px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap justify-between gap-4 px-[clamp(20px,4vw,48px)] py-7">
        <span>{t('copyright', { year: String(new Date().getFullYear()) })}</span>
        <nav className="flex gap-6">
          <Link href="/privacy" className={linkClass}>
            {t('privacy')}
          </Link>
          <Link href="/terms" className={linkClass}>
            {t('terms')}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {t('contact')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
