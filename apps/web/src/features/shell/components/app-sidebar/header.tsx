'use client';

import { SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Logo, LogoMark } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

type Props = Readonly<{
  stagingIndicator: React.ReactNode;
}>;

export function AppSidebarHeader({ stagingIndicator }: Props) {
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
        <div className="flex items-center gap-1.5">
          <Logo height={26} />
          {stagingIndicator}
        </div>
      )}
      {isMobile && <SidebarTrigger />}
    </SidebarHeader>
  );
}
