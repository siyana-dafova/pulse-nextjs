export function PageToolbar({
  description,
  children,
}: {
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
