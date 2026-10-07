import type { RideDetail } from '@loopra/domain';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
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

type Props = Readonly<{
  ride: RideDetail;
}>;

export function RideTopNav({ ride }: Props) {
  const t = useTranslations('RidePage');
  const tSidebar = useTranslations('Sidebar');

  return (
    <TopNav>
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
            <BreadcrumbPage className="truncate">{ride.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </TopNav>
  );
}
