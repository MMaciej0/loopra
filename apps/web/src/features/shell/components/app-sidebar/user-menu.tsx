'use client';

import { useTransition } from 'react';
import { Loader2, LogOut, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import type { CurrentUser } from '@loopra/domain';

import { Avatar, AvatarFallback, getAvatarColorIndex } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { logout } from '@/features/auth/actions/logout';
import { cn } from '@/lib/utils';

type Props = Readonly<{
  user: CurrentUser;
}>;

export function UserMenu({ user }: Props) {
  const t = useTranslations('Sidebar');
  const { state, isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const [isLoggingOut, startLogout] = useTransition();

  const displayName = user.username ?? user.email;
  const isDark = resolvedTheme === 'dark';
  const isCollapsed = state === 'collapsed' && !isMobile;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              aria-label={t('userMenu', { name: displayName })}
              className={cn(
                'w-full justify-start gap-2.5 px-2',
                'group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
              )}
            >
              <Avatar size="sm">
                <AvatarFallback color={getAvatarColorIndex(displayName)}>
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate group-data-[collapsible=icon]:hidden">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isCollapsed ? 'right' : 'top'}
            align={isCollapsed ? 'end' : 'start'}
            className="min-w-48"
          >
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
