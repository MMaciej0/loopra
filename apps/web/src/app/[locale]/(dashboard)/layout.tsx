import { AppSidebar } from '@/features/shell/components/app-sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FirstRunLocationPrompt } from '@/features/locations/components/first-run-location-prompt/first-run-location-prompt';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function DashboardLayout({ children }: Props) {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh lg:h-svh lg:min-h-0 lg:overflow-hidden">
        <AppSidebar />
        <FirstRunLocationPrompt />
        <main className="flex min-h-0 flex-1 flex-col lg:h-svh lg:overflow-hidden">{children}</main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
