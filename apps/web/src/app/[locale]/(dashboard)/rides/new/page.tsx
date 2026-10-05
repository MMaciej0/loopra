import { getTranslations } from 'next-intl/server';
import { PageBody } from '@/features/shell/components/page-body';
import { RideFormWrapper } from '@/features/rides/create/components/ride-form-wrapper';
import { CreateRideTopNav } from '@/features/rides/create/components/create-ride-top-nav';
import { SubmitError } from '@/features/rides/create/components/submit-error';
import { FormCard } from '@/features/rides/create/components/form-card';
import { RidePreview } from '@/features/rides/create/components/ride-preview/ride-preview';
import { TitleInput } from '@/features/rides/create/components/form/title-input';
import { DateTimeInput } from '@/features/rides/create/components/form/date-time-input';
import { MaxParticipantsInput } from '@/features/rides/create/components/form/max-participants-input';
import { StartPointCard } from '@/features/rides/create/components/form/start-point-card';
import { BikeTypeInput } from '@/features/rides/create/components/form/bike-type-input';
import { RideTypeInput } from '@/features/rides/create/components/form/ride-type-input';
import { RouteInput } from '@/features/rides/create/components/form/route-input';
import { DistanceInput } from '@/features/rides/create/components/form/distance-input';
import { DropPolicyInput } from '@/features/rides/create/components/form/drop-policy-input';
import { PacePolicyInput } from '@/features/rides/create/components/form/pace-policy-input';
import { FormationPolicyInput } from '@/features/rides/create/components/form/formation-policy-input';
import { ExperiencePolicyInput } from '@/features/rides/create/components/form/experience-policy-input';
import { DescriptionInput } from '@/features/rides/create/components/form/description-input';

export default async function NewRidePage() {
  const t = await getTranslations('CreateRide');

  return (
    <RideFormWrapper>
      <CreateRideTopNav />
      <h1 className="sr-only">{t('title')}</h1>
      <PageBody>
        <div className="h-full lg:overflow-y-auto">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-6 px-1 pt-6 pb-12 md:px-3 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-[18px]">
              <SubmitError />

              <FormCard title={t('basicsSection')}>
                <TitleInput />
                <DateTimeInput />
                <MaxParticipantsInput />
              </FormCard>

              <FormCard title={t('startPointSection')} sub={t('startPointSectionSub')}>
                <StartPointCard />
              </FormCard>

              <FormCard title={t('shapeSection')}>
                <BikeTypeInput />
                <RideTypeInput />
                <RouteInput />
                <DistanceInput />
              </FormCard>

              <FormCard title={t('policySection')}>
                <DropPolicyInput />
                <PacePolicyInput />
                <FormationPolicyInput />
                <ExperiencePolicyInput />
              </FormCard>

              <FormCard title={t('additionalInfoSection')}>
                <DescriptionInput />
              </FormCard>
            </div>

            <RidePreview />
          </div>
        </div>
      </PageBody>
    </RideFormWrapper>
  );
}
