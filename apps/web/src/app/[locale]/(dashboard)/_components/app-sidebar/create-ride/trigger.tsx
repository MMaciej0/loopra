'use client';

import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TriggerButton() {
  const t = useTranslations('Sidebar');
  const label = t('createRide');
  const { state, isMobile } = useSidebar();

  return (
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
      <TooltipContent side="right" align="center" hidden={state !== 'collapsed' || isMobile}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
