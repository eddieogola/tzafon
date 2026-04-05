"use client";

import { Icon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: Icon;
  iconColor?: string;
  delay?: number;
}

const spring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: IconComponent,
  iconColor = "text-zinc-600",
  delay = 0,
}: StatsCardProps) {
  const changeColors = {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-zinc-600 dark:text-zinc-400",
  };

  const iconBgColors = {
    positive: "bg-emerald-500/10",
    negative: "bg-red-500/10",
    neutral: "bg-blue-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </CardTitle>
          {IconComponent && (
            <motion.div
              className={cn(
                "rounded-xl p-2.5",
                iconBgColors[changeType]
              )}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <IconComponent className={cn("h-5 w-5", iconColor)} weight="bold" />
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-3xl font-bold tracking-tight"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, delay: delay + 0.1 }}
          >
            {value}
          </motion.div>
          {change && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: delay + 0.2 }}
              className="mt-2 flex items-center gap-1"
            >
              <motion.span
                className={cn("text-xs font-medium", changeColors[changeType])}
                animate={{
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {change}
              </motion.span>
            </motion.div>
          )}
        </CardContent>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity"
          whileHover={{ opacity: 1 }}
        />
      </Card>
    </motion.div>
  );
}
