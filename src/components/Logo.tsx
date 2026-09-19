import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  markClassName,
  wordmarkClassName,
  onClick,
}: {
  href?: string;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary font-display text-[13px] font-bold leading-none text-primary-foreground",
          markClassName
        )}
        aria-hidden
      >
        N
      </span>
      <span className={cn("font-display text-2xl font-semibold tracking-tight text-foreground", wordmarkClassName)}>
        NextRound
      </span>
    </Link>
  );
}
