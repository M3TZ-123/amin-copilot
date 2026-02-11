import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface CreditCardProps {
  balance: number;
  label?: string;
}

export function CreditCard({ balance, label = "Credit Balance" }: CreditCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 border-blue-500/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-300">
          {label}
        </CardTitle>
        <Zap className="h-5 w-5 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold tracking-tight text-blue-100">
          {balance.toLocaleString()}
        </div>
        <p className="text-sm text-blue-400/70 mt-1">
          GitHub Copilot credits remaining
        </p>
      </CardContent>
    </Card>
  );
}
