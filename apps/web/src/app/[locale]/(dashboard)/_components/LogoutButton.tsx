'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '../_actions/logout';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      loading={isPending}
      variant="outline"
      onClick={() =>
        startTransition(async () => {
          await logout();
        })
      }
    >
      Logout
    </Button>
  );
}
