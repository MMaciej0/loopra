import { useTranslations } from 'next-intl';
import { CONTACT_EMAIL } from '@loopra/domain';
import { Text } from '@/components/ui/text';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { ContactForm } from './contact-form';

export function ContactPage() {
  const t = useTranslations('ContactPage');

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <LandingHeader />
      <main className="mx-auto w-full max-w-[560px] flex-1 px-[clamp(20px,4vw,48px)] pt-[clamp(32px,6vw,72px)] pb-[clamp(56px,8vw,104px)]">
        <h1 className="font-editorial text-[clamp(36px,5vw,56px)] leading-none font-semibold tracking-[-0.035em] text-balance">
          {t('title')}
        </h1>
        <Text variant="body-m" className="text-muted-foreground mt-4 mb-10">
          {t('description')}
        </Text>
        <ContactForm />
        <Text variant="body-s" className="text-muted-foreground mt-8">
          {t.rich('directly', {
            address: CONTACT_EMAIL,
            email: (chunks) => (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground underline underline-offset-2"
              >
                {chunks}
              </a>
            ),
          })}
        </Text>
      </main>
      <LandingFooter />
    </div>
  );
}
