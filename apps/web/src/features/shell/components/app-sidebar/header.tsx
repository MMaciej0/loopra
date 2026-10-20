'use client';

import { SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { LogoMark } from '@/components/ui/logo-mark';
import { cn } from '@/lib/utils';

type Props = Readonly<{
  logo: React.ReactNode;
  stagingIndicator: React.ReactNode;
}>;

export function AppSidebarHeader({ logo, stagingIndicator }: Props) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarHeader
      className={cn(
        'h-14 flex-row items-center px-2 py-0 md:px-4',
        isCollapsed ? 'justify-center' : 'justify-start',
        isMobile && 'justify-between',
      )}
    >
      {isCollapsed ? (
        <div className="relative">
          <LogoMark height={18} />
          <div className="absolute -top-4 -right-4">{stagingIndicator}</div>
        </div>
      ) : (
        logo
      )}
      {isMobile && <SidebarTrigger />}
    </SidebarHeader>
  );
}
