type Props = Readonly<{
  children: React.ReactNode;
}>;

export function PageBody({ children }: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 md:px-4 lg:overflow-hidden">
      {children}
    </div>
  );
}
