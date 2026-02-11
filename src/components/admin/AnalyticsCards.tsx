import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Zap, DollarSign, Activity } from "lucide-react";

interface AnalyticsCardsProps {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalCredits: number;
}

export function AnalyticsCards({
  totalUsers,
  activeSubscriptions,
  totalRevenue,
  totalCredits,
}: AnalyticsCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "from-blue-600/10",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toString(),
      icon: Activity,
      color: "text-emerald-400",
      bgColor: "from-emerald-600/10",
    },
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(3)} TND`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "from-yellow-600/10",
    },
    {
      title: "Credits Distributed",
      value: totalCredits.toLocaleString(),
      icon: Zap,
      color: "text-purple-400",
      bgColor: "from-purple-600/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`bg-gradient-to-br ${card.bgColor} to-slate-900 border-slate-800`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
