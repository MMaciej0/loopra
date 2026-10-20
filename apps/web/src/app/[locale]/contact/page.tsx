import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactPage } from '@/features/contact/components/contact-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ContactPage' });

  return { title: t('metaTitle') };
}

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactPage />;
}
