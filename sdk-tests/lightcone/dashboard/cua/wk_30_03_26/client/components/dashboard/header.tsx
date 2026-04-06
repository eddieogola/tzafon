"use client";

import { Bell, MagnifyingGlass, User } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const spring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200/50 glass backdrop-blur-xl px-6 dark:border-zinc-800/50"
    >
      <div className="flex flex-1 items-center gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="relative flex-1 max-w-md"
        >
          <MagnifyingGlass
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            weight="bold"
          />
          <motion.input
            type="search"
            placeholder="Search anything..."
            whileFocus={{ scale: 1.01 }}
            transition={spring}
            className="w-full rounded-xl border border-zinc-200/50 bg-white/50 pl-10 pr-4 py-2.5 text-sm shadow-premium backdrop-blur-sm outline-none transition-all focus:border-blue-500/30 focus:bg-white focus:shadow-premium-lg dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:focus:border-blue-500/30 dark:focus:bg-zinc-900 focus-premium"
          />
        </motion.div>
      </div>
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
        >
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" weight="bold" />
            <motion.span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
        >
          <Button variant="ghost" size="icon" className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-premium">
              <User className="h-4 w-4 text-white" weight="bold" />
            </div>
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
