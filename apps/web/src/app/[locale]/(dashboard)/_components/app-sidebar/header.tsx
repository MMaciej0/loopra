'use client';

import { SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Logo, LogoMark } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

export function AppSidebarHeader() {
  const { state, isMobile } = useSidebar();

  return (
    <SidebarHeader
      className={cn(
        'h-14 flex-row items-center px-2 py-0 md:px-4',
        state === 'collapsed' ? 'justify-center' : 'justify-start',
        isMobile && 'justify-between',
      )}
    >
      {state === 'collapsed' ? <LogoMark height={18} /> : <Logo height={26} />}
      {isMobile && <SidebarTrigger />}
    </SidebarHeader>
  );
}
