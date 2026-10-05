'use client';

import { useTransition } from 'react';
import { Loader2, LogOut, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { Avatar, AvatarFallback, getAvatarColorIndex } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/features/auth/actions/logout';
import { useCurrentUser } from '@/features/shell/components/current-user-provider';
import { cn } from '@/lib/utils';

type Props = Readonly<{
  placement: 'sidebar' | 'top-nav';
}>;

export function UserMenu({ placement }: Props) {
  const user = useCurrentUser();
  const t = useTranslations('Sidebar');
  const { resolvedTheme, setTheme } = useTheme();
  const [isLoggingOut, startLogout] = useTransition();

  if (!user) return null;

  const displayName = user.username ?? user.email;
  const isDark = resolvedTheme === 'dark';
  const inSidebar = placement === 'sidebar';

  const avatar = (
    <Avatar size="sm">
      <AvatarFallback color={getAvatarColorIndex(displayName)}>
        {displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {inSidebar ? (
          <Button
            variant="ghost"
            size="lg"
            aria-label={t('userMenu', { name: displayName })}
            className={cn(
              'w-full justify-start gap-2.5 px-2',
              'group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
            )}
          >
            {avatar}
            <span className="truncate group-data-[collapsible=icon]:hidden">{displayName}</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('userMenu', { name: displayName })}
          >
            {avatar}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={inSidebar ? 'right' : 'bottom'} align="end" className="min-w-48">
        <DropdownMenuItem onSelect={() => setTheme(isDark ? 'light' : 'dark')}>
          {isDark ? <Sun /> : <Moon />}
          {isDark ? t('lightMode') : t('darkMode')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            startLogout(async () => {
              await logout();
            });
          }}
        >
          {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          {t('logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
