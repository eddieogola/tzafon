import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    success: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
    warning: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
    danger: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
    outline: "border border-slate-200 dark:border-slate-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
