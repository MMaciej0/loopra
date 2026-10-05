import { SidebarTrigger } from '@/components/ui/sidebar';

type Props = Readonly<{
  children?: React.ReactNode;
}>;

export default function TopNav({ children }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 md:px-4 lg:px-8">
      <SidebarTrigger size="icon" />
      <div className="min-w-0 flex-1">{children}</div>
    </header>
  );
}
