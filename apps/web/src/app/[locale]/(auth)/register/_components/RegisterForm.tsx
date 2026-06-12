'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormError } from '@/components/ui/form-error';
import { Text } from '@/components/ui/text';
import { register } from '@/actions/auth/register';

export function RegisterForm() {
  const [state, action, isLoading] = useActionState(register, null);
  const [isDirty, setIsDirty] = useState(false);
  const t = useTranslations('RegisterPage');
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
        id="username"
        name="username"
        label={t('usernameLabel')}
        type="text"
        placeholder={t('usernamePlaceholder')}
        defaultValue={state?.values?.username}
        error={
          isDirty
            ? undefined
            : state?.fieldErrors?.username?.[0] && tErrors(state.fieldErrors.username[0])
        }
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
    </form>
  );
}
