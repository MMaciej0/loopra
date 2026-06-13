import { getTranslations } from 'next-intl/server';
import { AuthHeader } from '../_components/AuthHeader';
import { AuthSwitchLink } from '../_components/AuthSwitchLink';
import { ForgotPasswordForm } from './_components/ForgotPasswordForm';

export default async function ForgotPassword() {
  const t = await getTranslations('ForgotPasswordPage');

  return (
    <div className="flex w-full flex-col">
      <AuthHeader eyebrow={t('eyebrow')} heading={t('heading')} description={t('description')} />
      <ForgotPasswordForm />
      <AuthSwitchLink text={t('rememberedIt')} href="/login" label={t('logIn')} />
    </div>
  );
}
