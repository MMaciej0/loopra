import { GoogleIcon } from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export async function GoogleLoginButton() {
  const t = await getTranslations('LoginPage');

  return (
    <Button
      asChild
      type="button"
      variant="secondary"
      className="text-foreground mb-[18px] flex w-full items-center justify-center gap-[10px] py-3 text-[14px]"
    >
      <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
        <GoogleIcon />
        {t('continueWithGoogle')}
      </a>
    </Button>
  );
}
