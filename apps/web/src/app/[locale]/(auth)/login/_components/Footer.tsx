import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('LoginPage');

  return (
    <p className="text-foreground/65 mt-[22px] text-center text-[13.5px]">
      {t('noAccount')}{' '}
      <Link href="/register" className="border-foreground text-foreground border-b font-medium">
        {t('createAccount')}
      </Link>
    </p>
  );
}
