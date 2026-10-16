import { getLocale } from 'next-intl/server';
import { AppSidebar } from '@/features/shell/components/app-sidebar/app-sidebar';
import { CurrentUserProvider } from '@/features/shell/components/current-user-provider';
import { MaptilerKeyProvider } from '@/components/providers/maptiler-key-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getOnboardingSteps } from '@/features/onboarding/steps';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/user';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (user && getOnboardingSteps(user).length > 0) {
    redirect({ href: '/welcome', locale: await getLocale() });
  }

  return (
    <CurrentUserProvider user={user}>
      <MaptilerKeyProvider apiKey={process.env.MAPTILER_KEY}>
        <TooltipProvider>
          <SidebarProvider className="min-h-svh lg:h-svh lg:min-h-0 lg:overflow-hidden">
            <AppSidebar />
            <main className="flex min-h-0 flex-1 flex-col lg:h-svh lg:overflow-hidden">
              {children}
            </main>
          </SidebarProvider>
        </TooltipProvider>
      </MaptilerKeyProvider>
    </CurrentUserProvider>
  );
}
