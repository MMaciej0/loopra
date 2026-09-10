import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '../_components/auth-header';
import { AuthDivider } from '../_components/auth-divider';
import { AuthSwitchLink } from '../_components/auth-switch-link';
import { GoogleAuthButton } from '../_components/google-auth-button';
import { LoginForm } from './_components/login-form';

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
      <AuthDivider />

      <LoginForm redirectTo={redirectTo ?? '/rides'} />
      <AuthSwitchLink text={t('noAccount')} href="/register" label={t('createAccount')} />
    </div>
  );
}
