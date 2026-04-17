import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your users and permissions
          </p>
        </div>
        <Button variant="primary">Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div>
                    <p className="font-medium">User {i}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      user{i}@example.com
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
