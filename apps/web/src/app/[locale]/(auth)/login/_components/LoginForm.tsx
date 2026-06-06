'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormError } from '@/components/ui/form-error';
import { login } from '@/actions/auth/login';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, isLoading] = useActionState(login.bind(null, redirectTo), null);
  const [isDirty, setIsDirty] = useState(false);
  const t = useTranslations('LoginPage');
  const tErrors = useTranslations('Errors');

  return (
    <form
      action={action}
      onChange={() => {
        if (!isDirty) setIsDirty(true);
      }}
      onSubmit={() => setIsDirty(false)}
    >
      {state?.formError && !isDirty && <FormError>{tErrors(state.formError)}</FormError>}

      <Field
        id="email"
        name="email"
        label={t('emailLabel')}
        type="email"
        placeholder={t('emailPlaceholder')}
        defaultValue={state?.values?.email}
        error={
          isDirty
            ? undefined
            : state?.fieldErrors?.email?.[0] && tErrors(state.fieldErrors.email[0])
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
          isDirty
            ? undefined
            : state?.fieldErrors?.password?.[0] && tErrors(state.fieldErrors.password[0])
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

      <Button type="submit" size="lg" className="mt-[18px] w-full" disabled={isLoading}>
        {t('submit')}
      </Button>
    </form>
  );
}
