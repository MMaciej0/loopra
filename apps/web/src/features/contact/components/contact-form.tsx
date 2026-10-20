'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { CircleCheck } from 'lucide-react';
import { CONTACT_MESSAGE_MAX_LENGTH, CONTACT_NAME_MAX_LENGTH } from '@loopra/domain';
import { Button } from '@/components/ui/button';
import { ControlledForm } from '@/components/ui/controlled-form';
import { Field } from '@/components/ui/field';
import { InputLabel } from '@/components/ui/input-label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { sendContactMessage } from '@/features/contact/actions/send-contact-message';

const MAX_LENGTHS = { name: CONTACT_NAME_MAX_LENGTH, message: CONTACT_MESSAGE_MAX_LENGTH };

export function ContactForm() {
  const [state, action, isLoading] = useActionState(sendContactMessage, null);
  const t = useTranslations('ContactPage');
  const tErrors = useTranslations('Errors');

  if (state?.sent) {
    return (
      <div role="status" className="border-border bg-secondary rounded-[10px] border p-6">
        <CircleCheck aria-hidden className="text-accent-deep mb-3 size-6" />
        <Text variant="heading-m">{t('success.title')}</Text>
        <Text variant="body-s" className="text-muted-foreground mt-1">
          {t('success.body')}
        </Text>
      </div>
    );
  }

  return (
    <ControlledForm
      action={action}
      isLoading={isLoading}
      formError={state?.formError && tErrors(state.formError)}
    >
      {({ showErrors }) => {
        const fieldError = (field: 'name' | 'email' | 'message') => {
          const errorType = showErrors ? state?.fieldErrors?.[field]?.[0] : undefined;
          return (
            errorType &&
            tErrors(errorType, field === 'email' ? undefined : { max: MAX_LENGTHS[field] })
          );
        };
        const messageError = fieldError('message');

        return (
          <>
            <Field
              id="name"
              name="name"
              label={t('nameLabel')}
              type="text"
              autoComplete="name"
              placeholder={t('namePlaceholder')}
              defaultValue={state?.values?.name}
              error={fieldError('name')}
            />
            <Field
              id="email"
              name="email"
              label={t('emailLabel')}
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              defaultValue={state?.values?.email}
              error={fieldError('email')}
            />
            <div>
              <div className="mb-[6px]">
                <InputLabel id="message">{t('messageLabel')}</InputLabel>
              </div>
              <Textarea
                id="message"
                name="message"
                placeholder={t('messagePlaceholder')}
                defaultValue={state?.values?.message}
                aria-invalid={!!messageError}
                aria-describedby={messageError ? 'message-error' : undefined}
                className="bg-secondary font-ui hover:border-foreground/30 focus-visible:border-foreground aria-invalid:border-destructive min-h-40 rounded-[10px] px-[14px] py-3 transition-[border-color] duration-150 focus-visible:ring-0 aria-invalid:ring-0 md:text-sm"
              />
              {messageError && (
                <p id="message-error" role="alert" className="text-destructive mt-1 text-[11.5px]">
                  {messageError}
                </p>
              )}
            </div>
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="website">{t('honeypotLabel')}</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <Button type="submit" size="lg" loading={isLoading} className="w-full">
              {t('submit')}
            </Button>
          </>
        );
      }}
    </ControlledForm>
  );
}
