'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import TopNav from '@/features/shell/components/top-nav';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function CreateRideTopNav() {
  const t = useTranslations('CreateRide');
  const tNav = useTranslations('RidesNav');
  const {
    formState: { isSubmitting },
  } = useFormContext<CreateRideInput>();

  return (
    <TopNav
      actions={
        <>
          <Button asChild variant="ghost" size="sm" className="hidden h-9 sm:inline-flex">
            <Link href="/rides">{t('cancel')}</Link>
          </Button>
          <Button type="submit" variant="accent" size="sm" loading={isSubmitting} className="h-9">
            {t('submit')}
            <ArrowRight className="hidden md:block" />
          </Button>
        </>
      }
    >
      <Button asChild variant="ghost" size="icon">
        <Link href="/rides" aria-label={tNav('back')}>
          <ArrowLeft />
        </Link>
      </Button>

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/rides">{tNav('discover')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{t('title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </TopNav>
  );
}
