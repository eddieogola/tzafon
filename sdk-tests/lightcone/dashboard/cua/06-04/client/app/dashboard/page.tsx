"use client";

import { Users, TrendUp, CurrencyDollar, ChartLine, ArrowUpRight, Clock, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const spring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};

const recentActivities = [
  { id: 1, title: "New user registration", time: "2 min ago", amount: "$99.00", status: "completed" },
  { id: 2, title: "Payment processed", time: "5 min ago", amount: "$250.00", status: "completed" },
  { id: 3, title: "Subscription renewal", time: "12 min ago", amount: "$49.00", status: "completed" },
  { id: 4, title: "API usage spike detected", time: "18 min ago", amount: "$0.00", status: "alert" },
  { id: 5, title: "New feature deployed", time: "25 min ago", amount: "$0.00", status: "completed" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-[100dvh] space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* Asymmetric Stats Grid - DESIGN_VARIANCE: 8 */}
      <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-12">
        {/* Large Featured Stat */}
        <div className="md:col-span-6 lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="text-5xl font-bold tracking-tight"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ ...spring, delay: 0.2 }}
                >
                  $45,231
                </motion.div>
                <div className="mt-4 flex items-center gap-2">
                  <motion.div
                    className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowUpRight weight="bold" className="h-3 w-3" />
                    +8.2%
                  </motion.div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Vertical Stacked Stats */}
        <div className="md:col-span-3 lg:col-span-4 space-y-4">
          <StatsCard
            title="Total Users"
            value="2,543"
            change="+12.5% from last month"
            changeType="positive"
            icon={Users}
            iconColor="text-blue-600"
            delay={0.15}
          />
          <StatsCard
            title="Active Now"
            value="573"
            change="-2.1% from last hour"
            changeType="negative"
            icon={ChartLine}
            iconColor="text-orange-600"
            delay={0.2}
          />
        </div>

        {/* Single Tall Stat */}
        <div className="md:col-span-3 lg:col-span-3">
          <StatsCard
            title="Growth Rate"
            value="+23.5%"
            change="+4.3% from last month"
            changeType="positive"
            icon={TrendUp}
            iconColor="text-emerald-600"
            delay={0.25}
          />
        </div>
      </div>

      {/* Asymmetric Content Grid - DESIGN_VARIANCE: 8 */}
      <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-12">
        {/* Wide Chart Section */}
        <div className="md:col-span-5 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Revenue Overview</CardTitle>
                    <CardDescription className="mt-1">
                      Monthly revenue and user growth trends
                    </CardDescription>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="rounded-xl bg-blue-500/10 p-2"
                  >
                    <TrendUp className="h-5 w-5 text-blue-600" weight="bold" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex h-[350px] items-center justify-center">
                  <motion.div
                    className="text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 dark:from-blue-950/20 dark:to-blue-900/10">
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Chart visualization area
                      </p>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        Integrate your preferred charting library
                      </p>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Narrow ChartLine Feed */}
        <div className="md:col-span-5 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.35 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent ChartLine</CardTitle>
                    <CardDescription className="mt-1">
                      Your latest transactions and events
                    </CardDescription>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="h-5 w-5 text-zinc-400" weight="bold" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: 0.4 + index * 0.05 }}
                      whileHover={{ x: 4, scale: 1.01 }}
                      className="group flex items-start gap-3 rounded-xl border border-zinc-200/50 bg-white/50 p-3 backdrop-blur-sm transition-all hover:border-zinc-300/50 hover:shadow-premium dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:border-zinc-700/50"
                    >
                      <motion.div
                        className={`mt-0.5 rounded-lg p-1.5 ${
                          activity.status === "completed"
                            ? "bg-emerald-500/10"
                            : "bg-orange-500/10"
                        }`}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${
                            activity.status === "completed"
                              ? "text-emerald-600"
                              : "text-orange-600"
                          }`}
                          weight="bold"
                        />
                      </motion.div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {activity.time}
                        </p>
                      </div>
                      {activity.amount !== "$0.00" && (
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {activity.amount}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
