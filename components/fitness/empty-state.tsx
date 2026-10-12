import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">{message}</p>
        {action}
      </CardContent>
    </Card>
  );
}
