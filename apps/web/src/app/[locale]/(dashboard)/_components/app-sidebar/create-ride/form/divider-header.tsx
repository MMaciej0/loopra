import { Separator } from '@/components/ui/separator';

interface DividerHeaderProps {
  text: string;
}

export function DividerHeader({ text }: DividerHeaderProps) {
  return (
    <div className="flex items-center gap-x-4">
      <h6 className="font-data text-foreground text-[11px] font-semibold tracking-[0.2em] text-nowrap uppercase">
        {text}
      </h6>
      <Separator className="flex-1" />
    </div>
  );
}
