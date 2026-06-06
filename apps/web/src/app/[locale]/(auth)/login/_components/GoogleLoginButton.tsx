import { GoogleIcon } from '@/components/icons/google';
import { getTranslations } from 'next-intl/server';

export async function GoogleLoginButton() {
  const t = await getTranslations('LoginPage');

  return (
    <button
      type="button"
      className="border-border bg-secondary text-foreground hover:border-border-strong hover:bg-accent active:bg-muted mb-[18px] flex w-full items-center justify-center gap-[10px] rounded-[10px] border px-4 py-3 text-[14px] font-medium transition-colors"
    >
      <GoogleIcon />
      {t('continueWithGoogle')}
    </button>
  );
}
