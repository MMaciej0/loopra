import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { StagingIndicator } from '@/features/staging/components/staging-indicator';
import { AppSidebarHeader } from './header';
import { AppSidebarNav } from './nav';
import { CreateRideButton } from './create-ride-button';
import { UserMenu } from './user-menu';

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader stagingIndicator={<StagingIndicator />} />
      <SidebarContent className="mt-2">
        <CreateRideButton />
        <AppSidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
