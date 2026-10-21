import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/features/legal/components/legal-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LegalPages.terms' });

  return { title: t('metaTitle') };
}

export default function TermsPage() {
  return <LegalPage document="terms" />;
}
