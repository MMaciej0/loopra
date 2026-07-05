'use client';

import { Bike, Route } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ITEMS = [
  { key: 'rides', href: '/rides', icon: Bike },
  { key: 'routes', href: '/routes', icon: Route },
] as const;

export function AppSidebarNav() {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {ITEMS.map(({ key, href, icon: Icon }) => {
          const label = t(key);
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <SidebarMenuItem key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    data-active={isActive}
                    className={cn(
                      'w-full justify-start gap-2.5 px-3 text-muted-foreground',
                      'data-[active=true]:bg-muted data-[active=true]:text-foreground',
                      'group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                    )}
                  >
                    <Link href={href}>
                      <Icon className="size-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  hidden={state !== 'collapsed' || isMobile}
                >
                  {label}
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
