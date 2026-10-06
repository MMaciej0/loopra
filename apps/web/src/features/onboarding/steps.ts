import type { CurrentUser } from '@loopra/domain';

export type OnboardingStep = 'username' | 'location';

export function getOnboardingSteps(user: CurrentUser): OnboardingStep[] {
  const steps: OnboardingStep[] = [];

  if (!user.username) steps.push('username');
  if (!user.selected_location) steps.push('location');

  return steps;
}
