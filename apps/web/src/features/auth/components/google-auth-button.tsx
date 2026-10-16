import { GoogleIcon } from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export async function GoogleAuthButton() {
  const t = await getTranslations('Auth');

  return (
    <Button
      asChild
      type="button"
      variant="secondary"
      className="text-foreground mb-[18px] flex w-full items-center justify-center gap-[10px] py-3 text-[14px]"
    >
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/auth/google">
        <GoogleIcon />
        {t('continueWithGoogle')}
      </a>
    </Button>
  );
}
