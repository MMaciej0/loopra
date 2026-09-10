import { AppSidebar } from './_components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import TopNav from './_components/TopNav';
import { FavoriteLocationModal } from './_components/favorite-location-modal';

type Props = Readonly<{
  children: React.ReactNode;
  topnav: React.ReactNode;
}>;

export default function DashboardLayout({ children, topnav }: Props) {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh lg:h-svh lg:min-h-0 lg:overflow-hidden">
        <AppSidebar />
        <FavoriteLocationModal />
        <main className="flex min-h-0 flex-1 flex-col lg:h-svh lg:overflow-hidden">
          <TopNav>{topnav}</TopNav>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 md:px-4 lg:overflow-hidden">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
