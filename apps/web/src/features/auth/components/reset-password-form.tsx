'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ControlledForm } from '@/components/ui/controlled-form';
import { resetPassword } from '@/features/auth/actions/reset-password';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, isLoading] = useActionState(resetPassword.bind(null, token), null);
  const t = useTranslations('ResetPasswordPage');
  const tErrors = useTranslations('Errors');

  return (
    <ControlledForm
      action={action}
      isLoading={isLoading}
      formError={state?.formError && tErrors(state.formError)}
    >
      {({ showErrors }) => (
        <>
          <Field
            id="password"
            name="password"
            label={t('passwordLabel')}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={
              showErrors
                ? state?.fieldErrors?.password?.[0] && tErrors(state.fieldErrors.password[0])
                : undefined
            }
            autoFocus
          />

          <Button type="submit" size="lg" loading={isLoading} className="w-full">
            {t('submit')}
          </Button>
        </>
      )}
    </ControlledForm>
  );
}
