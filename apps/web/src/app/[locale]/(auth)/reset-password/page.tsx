import { getTranslations } from 'next-intl/server';
import { FormError } from '@/components/ui/form-error';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthSwitchLink } from '@/features/auth/components/auth-switch-link';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [t, tErrors, { token }] = await Promise.all([
    getTranslations('ResetPasswordPage'),
    getTranslations('Errors'),
    searchParams,
  ]);

  return (
    <div className="flex w-full flex-col">
      <AuthHeader
        eyebrow={t('eyebrow')}
        heading={t('heading')}
        description={token ? t('description') : undefined}
      />
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <FormError>{tErrors('INVALID_TOKEN')}</FormError>
      )}
      <AuthSwitchLink text={t('linkNotWorking')} href="/forgot-password" label={t('requestNew')} />
    </div>
  );
}
