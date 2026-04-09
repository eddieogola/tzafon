"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: "default" | "outline" | "ghost" | "primary" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const spring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-zinc-900 text-white shadow-premium hover:shadow-premium-lg dark:bg-zinc-50 dark:text-zinc-900",
      outline:
        "border border-zinc-200/50 bg-white/50 backdrop-blur-sm shadow-premium hover:bg-white hover:shadow-premium-lg dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-900",
      ghost: "hover:bg-zinc-100/50 hover:shadow-premium dark:hover:bg-zinc-800/50",
      primary:
        "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-premium hover:shadow-premium-lg hover:from-blue-600 hover:to-blue-700",
      secondary:
        "bg-zinc-100/80 text-zinc-900 shadow-premium backdrop-blur-sm hover:bg-zinc-200/80 hover:shadow-premium-lg dark:bg-zinc-800/80 dark:text-zinc-50 dark:hover:bg-zinc-700/80",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-11 rounded-xl px-8",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-premium disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
