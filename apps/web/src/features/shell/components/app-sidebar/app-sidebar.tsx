import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { UserMenu } from '@/features/shell/components/user-menu';
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
      <SidebarFooter className="hidden md:flex">
        <UserMenu placement="sidebar" />
      </SidebarFooter>
    </Sidebar>
  );
}
