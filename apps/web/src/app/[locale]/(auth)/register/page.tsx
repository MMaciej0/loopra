import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '../_components/AuthHeader';
import { AuthDivider } from '../_components/AuthDivider';
import { AuthSwitchLink } from '../_components/AuthSwitchLink';
import { GoogleAuthButton } from '../_components/GoogleAuthButton';
import { RegisterForm } from './_components/RegisterForm';

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
