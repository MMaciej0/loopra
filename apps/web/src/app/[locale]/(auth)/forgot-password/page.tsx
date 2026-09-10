import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '../_components/auth-header';
import { AuthSwitchLink } from '../_components/auth-switch-link';
import { ForgotPasswordForm } from './_components/forgot-password-form';

export default async function ForgotPassword() {
  const t = await getTranslations('ForgotPasswordPage');

  return (
    <div className="flex w-full flex-col">
      <AuthHeader
        eyebrow={t('eyebrow')}
        heading={t.rich('heading', { i: (chunks) => <i>{chunks}</i> })}
        description={t('description')}
      />
      <ForgotPasswordForm />
      <AuthSwitchLink text={t('rememberedIt')} href="/login" label={t('logIn')} />
    </div>
  );
}
