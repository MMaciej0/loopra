'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ControlledForm } from '@/components/ui/controlled-form';
import { Text } from '@/components/ui/text';
import { register } from '@/actions/auth/register';

export function RegisterForm() {
  const [state, action, isLoading] = useActionState(register, null);
  const t = useTranslations('RegisterPage');
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
          <Field
            id="username"
            name="username"
            label={t('usernameLabel')}
            type="text"
            placeholder={t('usernamePlaceholder')}
            defaultValue={state?.values?.username}
            error={
              showErrors
                ? state?.fieldErrors?.username?.[0] && tErrors(state.fieldErrors.username[0])
                : undefined
            }
          />
          <Field
            id="password"
            name="password"
            label={t('passwordLabel')}
            type="password"
            placeholder="••••••••"
            error={
              showErrors
                ? state?.fieldErrors?.password?.[0] && tErrors(state.fieldErrors.password[0])
                : undefined
            }
          />

          <Button type="submit" size="lg" className="mt-[18px] w-full" loading={isLoading}>
            {t('submit')}
          </Button>

          <Text variant="body-xs" className="text-muted-foreground pt-3.5 text-center">
            {t.rich('termsAgreement', {
              terms: (chunks) => (
                <Link href="/terms" className="border-foreground text-foreground border-b">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy" className="border-foreground text-foreground border-b">
                  {chunks}
                </Link>
              ),
            })}
          </Text>
        </>
      )}
    </ControlledForm>
  );
}
