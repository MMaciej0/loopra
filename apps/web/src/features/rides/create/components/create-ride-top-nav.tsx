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
  const tSidebar = useTranslations('Sidebar');
  const {
    formState: { isSubmitting },
  } = useFormContext<CreateRideInput>();

  return (
    <TopNav>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/rides" aria-label={t('back')}>
            <ArrowLeft />
          </Link>
        </Button>

        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink asChild>
                <Link href="/rides">{tSidebar('rides')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/rides">{t('cancel')}</Link>
          </Button>
          <Button type="submit" variant="accent" loading={isSubmitting} className="px-3 md:px-4">
            {t('submit')}
            <ArrowRight className="hidden md:block" />
          </Button>
        </div>
      </div>
    </TopNav>
  );
}
