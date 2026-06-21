import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { AppSidebarHeader } from './header';
import { AppSidebarNav } from './nav';
import { CreateRide } from './create-ride';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <SidebarContent className="mt-2">
        <CreateRide />
        <AppSidebarNav />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
