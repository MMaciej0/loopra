'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogSubheader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CreateRideForm } from './form';

enum CreateRideStage {
  'MAP' = 'MAP',
  'FORM' = 'FORM',
}

export function CreateRide() {
  const t = useTranslations('Sidebar');
  const { state, isMobile } = useSidebar();
  const label = t('createRide');

  return (
    <Dialog>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="accent"
                    size="lg"
                    className={cn(
                      'w-full justify-start gap-2.5 px-3',
                      'group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                    )}
                  >
                    <Plus className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                  </Button>
                </DialogTrigger>
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

      <DialogContent
        buttonClassName="top-4 right-4 md:top-5.5 md:right-7.5"
        className={cn(
          'gap-0 overflow-hidden p-0',
          // mobile + md: full screen
          'top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none ring-0 sm:max-w-none',
          // lg+: fluid up to 1000px, content height capped at 90vh, two columns
          'lg:top-1/2 lg:left-1/2 lg:h-auto lg:max-h-[90vh] lg:w-[calc(100%-2rem)] lg:max-w-[1000px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:grid-cols-[392px_1fr] lg:rounded-[20px] lg:ring-1',
        )}
      >
        {/* left preview pane — lg+ only */}
        <aside className="bg-muted hidden p-4 md:px-7.5 md:pt-5.5 lg:block">preview</aside>

        {/* right form column */}
        <div className="flex min-h-0 flex-col">
          <DialogHeader className="p-4 md:px-7.5 md:pt-5.5">
            <DialogSubheader>NEW RIDE</DialogSubheader>
            <DialogTitle>Post your ride</DialogTitle>
            <DialogDescription className="sr-only">
              Create and share a new ride with the community.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:px-7.5 md:pt-5.5">
            <CreateRideForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
