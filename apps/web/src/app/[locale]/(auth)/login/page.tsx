import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { AuthSwitchLink } from '@/features/auth/components/auth-switch-link';
import { GoogleAuthButton } from '@/features/auth/components/google-auth-button';
import { GuestAccountButton } from '@/features/auth/components/guest-account-button/guest-account-button';
import { LoginForm } from '@/features/auth/components/login-form';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const [t, { redirectTo }] = await Promise.all([getTranslations('LoginPage'), searchParams]);

  return (
    <div className="flex w-full flex-col">
      <AuthHeader
        eyebrow={t('eyebrow')}
        heading={t.rich('heading', { i: (chunks) => <i>{chunks}</i> })}
      />
      <GoogleAuthButton />
      <GuestAccountButton />
      <AuthDivider />

      <LoginForm redirectTo={redirectTo ?? '/rides'} />
      <AuthSwitchLink text={t('noAccount')} href="/register" label={t('createAccount')} />
    </div>
  );
}
