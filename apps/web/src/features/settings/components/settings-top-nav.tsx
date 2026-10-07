import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import TopNav from '@/features/shell/components/top-nav';

export function SettingsTopNav() {
  const t = useTranslations('SettingsPage');

  return (
    <TopNav>
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{t('title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </TopNav>
  );
}
