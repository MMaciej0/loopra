import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { AuthSwitchLink } from '@/features/auth/components/auth-switch-link';
import { GoogleAuthButton } from '@/features/auth/components/google-auth-button';
import { RegisterForm } from '@/features/auth/components/register-form';

export default async function Register() {
  const t = await getTranslations('RegisterPage');

  return (
    <div className="flex w-full flex-col">
      <AuthHeader
        eyebrow={t('eyebrow')}
        heading={t.rich('heading', { i: (chunks) => <i>{chunks}</i> })}
        description={t('description')}
      />
      <GoogleAuthButton />
      <AuthDivider />

      <RegisterForm />
      <AuthSwitchLink text={t('haveAccount')} href="/login" label={t('logIn')} />
    </div>
  );
}
