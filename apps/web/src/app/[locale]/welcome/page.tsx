import { getLocale } from 'next-intl/server';
import { MaptilerKeyProvider } from '@/components/providers/maptiler-key-provider';
import { Logo } from '@/components/ui/logo';
import { LocationStep } from '@/features/onboarding/components/location-step';
import { UsernameStep } from '@/features/onboarding/components/username-step';
import { getOnboardingSteps } from '@/features/onboarding/steps';
import { getFavoriteLocations } from '@/features/locations/favorites';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/user';

export default async function WelcomePage() {
  const user = await getCurrentUser();
  const [step] = user ? getOnboardingSteps(user) : [];

  if (!step) {
    return redirect({ href: '/rides', locale: await getLocale() });
  }

  const favorites = step === 'location' ? await getFavoriteLocations() : [];

  return (
    <div className="flex min-h-dvh w-full flex-col px-[22px] pt-7 pb-9 md:px-8 md:pt-8 md:pb-10">
      <Logo withStagingIndicator />
      <main className="flex flex-1 flex-col items-center py-8 md:py-10">
        <div className="my-auto w-full max-w-md">
          {step === 'username' && <UsernameStep />}
          {step === 'location' && (
            <MaptilerKeyProvider apiKey={process.env.MAPTILER_KEY}>
              <LocationStep favorites={favorites} />
            </MaptilerKeyProvider>
          )}
        </div>
      </main>
    </div>
  );
}
