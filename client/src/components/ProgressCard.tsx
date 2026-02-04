import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  colorClass?: string;
  icon?: React.ReactNode;
}

export function ProgressCard({ title, value, total, colorClass = "bg-primary", icon }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground/50 group-hover:text-primary transition-colors">{icon}</div>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end justify-between mb-2">
          <div className="text-3xl font-bold font-display">{percentage}%</div>
          <div className="text-sm text-muted-foreground mb-1">
            {value} / {total}
          </div>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass)} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
