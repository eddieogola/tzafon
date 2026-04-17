import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Detailed analytics and insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
