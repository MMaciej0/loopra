import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '../_components/auth-header';
import { AuthDivider } from '../_components/auth-divider';
import { AuthSwitchLink } from '../_components/auth-switch-link';
import { GoogleAuthButton } from '../_components/google-auth-button';
import { RegisterForm } from './_components/register-form';

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
