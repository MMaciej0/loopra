'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@loopra/domain';
import { Button } from '@/components/ui/button';
import { Card, CardLabel } from '@/components/ui/card';
import { ControlledForm } from '@/components/ui/controlled-form';
import { Field } from '@/components/ui/field';
import { saveUsername } from '@/features/auth/actions/save-username';

type Props = Readonly<{
  username: string;
}>;

export function ProfilePanel({ username }: Props) {
  const [state, action, isLoading] = useActionState(saveUsername, null);
  const [value, setValue] = useState(username);
  const t = useTranslations('SettingsPage.profile');
  const tErrors = useTranslations('Errors');

  return (
    <Card>
      <CardLabel>{t('title')}</CardLabel>
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
              label={t('usernameLabel')}
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              error={
                showErrors
                  ? state?.fieldErrors?.username?.[0] &&
                    tErrors(state.fieldErrors.username[0], {
                      min: USERNAME_MIN_LENGTH,
                      max: USERNAME_MAX_LENGTH,
                    })
                  : undefined
              }
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="accent"
                loading={isLoading}
                disabled={value.trim() === username}
              >
                {t('save')}
              </Button>
            </div>
          </>
        )}
      </ControlledForm>
    </Card>
  );
}
