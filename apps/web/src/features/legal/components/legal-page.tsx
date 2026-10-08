import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { Text } from '@/components/ui/text';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { PrivacyPolicyEn } from './privacy-policy-en';
import { PrivacyPolicyPl } from './privacy-policy-pl';
import { TermsEn } from './terms-en';
import { TermsPl } from './terms-pl';

const DOCUMENTS = {
  privacy: {
    lastUpdated: new Date(Date.UTC(2026, 9, 8)),
    en: PrivacyPolicyEn,
    pl: PrivacyPolicyPl,
  },
  terms: {
    lastUpdated: new Date(Date.UTC(2026, 9, 8)),
    en: TermsEn,
    pl: TermsPl,
  },
} as const;

interface LegalPageProps {
  document: keyof typeof DOCUMENTS;
}

export function LegalPage({ document }: LegalPageProps) {
  const t = useTranslations('LegalPages');
  const format = useFormatter();
  const locale = useLocale();
  const { lastUpdated, ...content } = DOCUMENTS[document];
  const Content = content[locale === 'pl' ? 'pl' : 'en'];

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <LandingHeader pathname={`/${document}`} />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-[clamp(20px,4vw,48px)] pt-[clamp(32px,6vw,72px)] pb-[clamp(56px,8vw,104px)]">
        <h1 className="font-editorial text-[clamp(36px,5vw,56px)] leading-none font-semibold tracking-[-0.035em] text-balance">
          {t(`${document}.title`)}
        </h1>
        <Text variant="body-s" className="text-muted-foreground mt-4">
          {t('lastUpdated', {
            date: format.dateTime(lastUpdated, { dateStyle: 'long', timeZone: 'UTC' }),
          })}
        </Text>
        <div className="text-foreground/70 [&_a]:text-foreground [&_h2]:font-editorial [&_h2]:text-foreground mt-10 text-[15px] leading-[1.65] wrap-break-word [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[22px] [&_h2]:leading-[1.2] [&_h2]:font-semibold [&_li]:mb-1.5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5">
          <Content />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
