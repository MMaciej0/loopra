'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { TriggerButton } from './trigger';
import { RideForm } from './form';

export function CreateRide() {
  return (
    <Dialog>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <TriggerButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        buttonClassName="top-4 right-4 md:top-5.5 md:right-7.5"
        className={cn(
          'gap-0 overflow-hidden p-0',
          // mobile + md: full screen
          'top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none ring-0 sm:max-w-none',
          // lg+: fluid up to 1000px, content height capped at 90vh, two columns
          'lg:top-1/2 lg:left-1/2 lg:h-[90vh] lg:w-[calc(100%-2rem)] lg:max-w-[1200px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:grid-cols-[392px_1fr] lg:rounded-[20px] lg:ring-1',
        )}
      >
        {/* left preview pane — lg+ only */}
        <aside className="bg-muted hidden p-4 md:px-7.5 md:pt-5.5 lg:block">preview</aside>

        {/* right form column */}
        <RideForm />
      </DialogContent>
    </Dialog>
  );
}
