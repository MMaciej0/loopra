'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function CreateRideButton() {
  const t = useTranslations('Sidebar');
  const label = t('createRide');
  const { state, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="accent"
                size="lg"
                className={cn(
                  'w-full justify-start gap-2.5 px-3',
                  'group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                )}
              >
                <Link href="/rides/new">
                  <Plus className="size-5" />
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
      </SidebarMenu>
    </SidebarGroup>
  );
}
