'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ControlledForm } from '@/components/ui/controlled-form';
import { Field } from '@/components/ui/field';
import { Text } from '@/components/ui/text';
import { changePassword } from '@/features/settings/actions/change-password';

export function ChangePasswordForm() {
  const [state, action, isLoading] = useActionState(changePassword, null);
  const t = useTranslations('SettingsPage.password');
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
            id="current_password"
            name="current_password"
            label={t('currentPasswordLabel')}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={
              showErrors
                ? state?.fieldErrors?.current_password?.[0] &&
                  tErrors(state.fieldErrors.current_password[0])
                : undefined
            }
          />
          <Field
            id="new_password"
            name="new_password"
            label={t('newPasswordLabel')}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={
              showErrors
                ? state?.fieldErrors?.new_password?.[0] &&
                  tErrors(state.fieldErrors.new_password[0])
                : undefined
            }
          />

          <div className="flex justify-end">
            <Button type="submit" variant="accent" loading={isLoading}>
              {t('save')}
            </Button>
          </div>
          {state?.changed && showErrors && (
            <Text variant="body-s" className="text-muted-foreground">
              {t('changed')}
            </Text>
          )}
        </>
      )}
    </ControlledForm>
  );
}
