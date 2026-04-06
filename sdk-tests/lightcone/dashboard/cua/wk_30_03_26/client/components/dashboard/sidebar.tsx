"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ChartBar,
  Users as UsersIcon,
  Gear,
  FileText
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: House,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartBar,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: UsersIcon,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Gear,
  },
];

const spring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={spring}
      className="fixed left-0 top-0 z-40 h-screen w-64 glass border-r border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-zinc-200/50 px-6 dark:border-zinc-800/50">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-premium"
            >
              <span className="text-sm font-bold text-white">A</span>
            </motion.div>
            <span className="text-lg font-semibold">Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className="group relative block"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 shadow-premium"
                      transition={spring}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={spring}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    )}
                  >
                    <Icon
                      className="h-5 w-5"
                      weight={isActive ? "fill" : "regular"}
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500"
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200/50 p-4 dark:border-zinc-800/50">
          <motion.div
            className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 shadow-premium dark:from-blue-950/20 dark:to-blue-900/10"
            animate={{
              boxShadow: [
                "0 2px 8px -2px rgb(59 130 246 / 0.08)",
                "0 4px 16px -4px rgb(59 130 246 / 0.12)",
                "0 2px 8px -2px rgb(59 130 246 / 0.08)",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Premium Dashboard</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Powered by taste-skill design
            </p>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
