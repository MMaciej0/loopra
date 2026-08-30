import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { AppSidebarHeader } from './header';
import { AppSidebarNav } from './nav';
import { CreateRideButton } from './create-ride-button';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <SidebarContent className="mt-2">
        <CreateRideButton />
        <AppSidebarNav />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
