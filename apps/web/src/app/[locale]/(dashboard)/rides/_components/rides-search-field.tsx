import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

export async function RidesSearchField() {
  const t = await getTranslations('RidesPage');

  return (
    <InputGroup>
      <InputGroupAddon>
        <Search className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        aria-label={t('searchLabel')}
        placeholder={t('searchPlaceholder')}
      />
    </InputGroup>
  );
}
