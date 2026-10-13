export function ProgressBar({
  current,
  target,
  size = "sm",
}: {
  current: number;
  target: number;
  size?: "sm" | "md";
}) {
  const percent =
    target <= 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
  const height = size === "md" ? "h-3" : "h-2";

  return (
    <div className={`mt-2 ${height} rounded-full bg-muted`}>
      <div
        className={`${height} rounded-full bg-primary`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
