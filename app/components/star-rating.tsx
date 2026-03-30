import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

interface StarRatingProps {
  average: number;
  count: number;
  className?: string;
}

export function StarRating({ average, count, className }: StarRatingProps) {
  if (count === 0) return null;

  const rounded = Math.round(average * 10) / 10;

  return (
    <span className={cn("flex items-center gap-1", className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium text-foreground">{rounded.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}
