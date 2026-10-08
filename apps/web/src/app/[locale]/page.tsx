import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LandingPage } from '@/features/landing/components/landing-page';
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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingPage />;
}
