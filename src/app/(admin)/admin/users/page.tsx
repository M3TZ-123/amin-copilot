import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Users</h1>
        <p className="text-slate-400 mt-1">
          Manage all subscribed users
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  );
}
