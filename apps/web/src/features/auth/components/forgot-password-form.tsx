'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ControlledForm } from '@/components/ui/controlled-form';
import { forgotPassword } from '@/features/auth/actions/forgot-password';

export function ForgotPasswordForm() {
  const [state, action, isLoading] = useActionState(forgotPassword, null);
  const t = useTranslations('ForgotPasswordPage');
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
            id="email"
            name="email"
            label={t('emailLabel')}
            type="email"
            placeholder={t('emailPlaceholder')}
            defaultValue={state?.values?.email}
            error={
              showErrors
                ? state?.fieldErrors?.email?.[0] && tErrors(state.fieldErrors.email[0])
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
