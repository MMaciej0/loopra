import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Text } from '@/components/ui/text';
import { Link } from '@/i18n/navigation';

export function InvalidVerificationLink() {
  const t = useTranslations('VerifyEmailPage');

  return (
    <div className="flex min-h-dvh w-full flex-col px-[22px] pt-7 pb-9 md:px-8 md:pt-8 md:pb-10">
      <Logo withStagingIndicator />
      <main className="flex flex-1 flex-col items-center py-8 md:py-10">
        <div className="my-auto flex w-full max-w-md flex-col items-start gap-6">
          <Text variant="body-m">{t('invalid')}</Text>
          <Button asChild>
            <Link href="/settings">{t('settings')}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
