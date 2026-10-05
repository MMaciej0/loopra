import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/features/shell/components/user-menu';

type Props = Readonly<{
  children?: React.ReactNode;
  actions?: React.ReactNode;
}>;

export default function TopNav({ children, actions }: Props) {
  return (
    <header className="bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-2 md:px-4 lg:px-8">
      <SidebarTrigger type="button" size="icon" />
      {children && (
        <>
          <Separator
            orientation="vertical"
            className="data-vertical:h-5 data-vertical:self-center"
          />
          <div className="flex w-0 min-w-0 flex-1 items-center gap-2">{children}</div>
        </>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {actions}
        <div className="md:hidden">
          <UserMenu placement="top-nav" />
        </div>
      </div>
    </header>
  );
}
