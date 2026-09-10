'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from './action';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      loading={isPending}
      variant="outline"
      size="sm"
      onClick={() =>
        startTransition(async () => {
          await logout();
        })
      }
    >
      Log out
    </Button>
  );
}
