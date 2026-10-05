import Link from 'next/link';

export function AuthSwitchLink({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-foreground/65 mt-[22px] text-center text-[13.5px]">
      {text}{' '}
      <Link href={href} className="border-foreground text-foreground border-b font-medium">
        {label}
      </Link>
    </p>
  );
}
