import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({
  className,
  label = "Verified Student Ambassador",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400",
        className,
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
