'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { createGuestAccount } from '@/features/auth/actions/create-guest-account';

export function GuestAccountForm() {
  const [state, action, isLoading] = useActionState(createGuestAccount, null);
  const t = useTranslations('Auth');
  const tErrors = useTranslations('Errors');

  return (
    <form action={action} className="mb-[18px]">
      {state?.formError && !isLoading && <FormError>{tErrors(state.formError)}</FormError>}
      <Button
        type="submit"
        variant="secondary"
        loading={isLoading}
        className="text-foreground flex w-full items-center justify-center gap-[10px] py-3 text-[14px]"
      >
        <UserRound />
        {t('useGuestAccount')}
      </Button>
    </form>
  );
}
