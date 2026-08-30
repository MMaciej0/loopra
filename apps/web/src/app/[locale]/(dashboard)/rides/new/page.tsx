import { getTranslations } from 'next-intl/server';
import { RideFormWrapper } from './_components/ride-form-wrapper';
import { PageBar } from './_components/page-bar';
import { FormCard } from './_components/form-card';
import { RidePreview } from './_components/aside';
import { TitleInput } from './_components/form/title-input';
import { DateTimeInput } from './_components/form/date-time-input';
import { MaxParticipantsInput } from './_components/form/max-participants-input';
import { StartPointCard } from './_components/form/start-point-card';
import { BikeTypeInput } from './_components/form/bike-type-input';
import { RideTypeInput } from './_components/form/ride-type-input';
import { RouteInput } from './_components/form/route-input';
import { DistanceInput } from './_components/form/distance-input';
import { DropPolicyInput } from './_components/form/drop-policy-input';
import { PacePolicyInput } from './_components/form/pace-policy-input';
import { FormationPolicyInput } from './_components/form/formation-policy-input';
import { ExperiencePolicyInput } from './_components/form/experience-policy-input';
import { DescriptionInput } from './_components/form/description-input';

export default async function NewRidePage() {
  const t = await getTranslations('CreateRide');

  return (
    <RideFormWrapper>
      <PageBar />

      <div className="min-h-0 flex-1 lg:overflow-y-auto">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-6 px-1 pt-6 pb-12 md:px-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-[18px]">
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
    </RideFormWrapper>
  );
}
