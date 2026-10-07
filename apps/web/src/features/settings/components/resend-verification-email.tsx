'use client';

import { useState, useTransition } from 'react';
import { ERROR_TYPES } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { resendVerificationEmail } from '@/features/settings/actions/resend-verification-email';

type Props = Readonly<{
  email: string;
}>;

type Result = Awaited<ReturnType<typeof resendVerificationEmail>>;

export function ResendVerificationEmail({ email }: Props) {
  const t = useTranslations('SettingsPage.email');
  const tErrors = useTranslations('Errors');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  const isRateLimited =
    result?.ok === false && result.errorType === ERROR_TYPES.RATE_LIMIT_EXCEEDED;

  function send() {
    startTransition(async () => {
      setResult(await resendVerificationEmail());
    });
  }

  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      <Button
        variant="secondary"
        size="sm"
        loading={isPending}
        disabled={result?.ok === true || isRateLimited}
        onClick={send}
      >
        {t('sendAgain')}
      </Button>
      {result?.ok === true && (
        <Text variant="body-s" className="text-muted-foreground break-all">
          {t('sent', { email })}
        </Text>
      )}
      {result?.ok === false && (
        <p role="alert" className="text-destructive text-[11.5px]">
          {isRateLimited ? t('rateLimited') : tErrors('UNKNOWN')}
        </p>
      )}
    </div>
  );
}
