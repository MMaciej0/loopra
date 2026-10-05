import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/user';
import { AppSidebarHeader } from './header';
import { AppSidebarNav } from './nav';
import { CreateRideButton } from './create-ride-button';
import { UserMenu } from './user-menu';

export async function AppSidebar() {
  const user = await getCurrentUser();

  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <SidebarContent className="mt-2">
        <CreateRideButton />
        <AppSidebarNav />
      </SidebarContent>
      <SidebarFooter>{user && <UserMenu user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
