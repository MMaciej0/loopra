import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ExampleRides } from '@/features/landing/components/example-rides';
import { Hero } from '@/features/landing/components/hero';
import { HowItWorks } from '@/features/landing/components/how-it-works';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LandingPage.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: getPathname({ locale, href: '/' }),
      languages: {
        ...Object.fromEntries(
          routing.locales.map((candidate) => [
            candidate,
            getPathname({ locale: candidate, href: '/' }),
          ]),
        ),
        'x-default': getPathname({ locale: routing.defaultLocale, href: '/' }),
      },
    },
  };
}

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <LandingHeader />
      <main className="flex-1 pb-[clamp(56px,8vw,104px)]">
        <section className="mx-auto grid w-full max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-[clamp(40px,6vw,88px)] px-[clamp(20px,4vw,48px)] pt-[clamp(48px,9vw,120px)] pb-[clamp(56px,8vw,104px)]">
          <Hero />
          <ExampleRides />
        </section>
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
}
