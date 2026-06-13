'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ControlledForm } from '@/components/ui/controlled-form';
import { login } from '@/actions/auth/login';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, isLoading] = useActionState(login.bind(null, redirectTo), null);
  const t = useTranslations('LoginPage');
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
            hint={
              <Link
                href="/forgot-password"
                className="border-muted-foreground/50 text-muted-foreground hover:text-foreground border-b border-dotted"
              >
                {t('forgotPassword')}
              </Link>
            }
          />

          <Button type="submit" size="lg" className="mt-[18px] w-full" loading={isLoading}>
            {t('submit')}
          </Button>
        </>
      )}
    </ControlledForm>
  );
}
