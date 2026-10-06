import type { CurrentUser } from '@loopra/domain';

export type OnboardingStep = 'location';

export function getOnboardingSteps(user: CurrentUser): OnboardingStep[] {
  const steps: OnboardingStep[] = [];

  if (!user.selected_location) steps.push('location');

  return steps;
}
