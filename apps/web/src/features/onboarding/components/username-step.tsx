'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@loopra/domain';
import { Button } from '@/components/ui/button';
import { ControlledForm } from '@/components/ui/controlled-form';
import { Field } from '@/components/ui/field';
import { Text } from '@/components/ui/text';
import { saveUsername } from '@/features/auth/actions/save-username';

export function UsernameStep() {
  const [state, action, isLoading] = useActionState(saveUsername, null);
  const t = useTranslations('WelcomePage.username');
  const tErrors = useTranslations('Errors');

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <Text variant="label" className="text-muted-foreground">
          {t('eyebrow')}
        </Text>
        <Text variant="heading-xl" as="h1">
          {t('title')}
        </Text>
        <Text variant="body-s" className="text-muted-foreground">
          {t('description')}
        </Text>
      </header>

      <ControlledForm
        action={action}
        isLoading={isLoading}
        formError={state?.formError && tErrors(state.formError)}
      >
        {({ showErrors }) => (
          <>
            <Field
              id="username"
              name="username"
              label={t('label')}
              type="text"
              placeholder={t('placeholder')}
              defaultValue={state?.values?.username}
              error={
                showErrors
                  ? state?.fieldErrors?.username?.[0] &&
                    tErrors(state.fieldErrors.username[0], {
                      min: USERNAME_MIN_LENGTH,
                      max: USERNAME_MAX_LENGTH,
                    })
                  : undefined
              }
              autoFocus
            />

            <div className="flex justify-end">
              <Button type="submit" variant="accent" loading={isLoading}>
                {t('submit')}
              </Button>
            </div>
          </>
        )}
      </ControlledForm>
    </section>
  );
}
