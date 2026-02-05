import { useDsaTopics, useCsTopics, useProjects, useMockInterviews, useDailyLogs } from "@/hooks/use-data";
import { ProgressCard } from "@/components/ProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, BookOpen, FolderGit2, Users, Flame, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dsa, isLoading: dsaLoading } = useDsaTopics();
  const { data: cs, isLoading: csLoading } = useCsTopics();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: mocks, isLoading: mocksLoading } = useMockInterviews();
  const { data: logs, isLoading: logsLoading } = useDailyLogs();

  const isLoading = dsaLoading || csLoading || projectsLoading || mocksLoading || logsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Calculations
  const dsaCompleted = dsa?.filter(t => t.status === "completed").length || 0;
  const dsaTotal = dsa?.length || 0;
  const dsaScore = dsaTotal ? (dsaCompleted / dsaTotal) * 100 : 0;

  const csCompleted = cs?.filter(t => t.status === "completed").length || 0;
  const csTotal = cs?.length || 0;
  const csScore = csTotal ? (csCompleted / csTotal) * 100 : 0;

  const projectsCompleted = projects?.filter(p => p.status === "completed").length || 0;
  const projectsTotal = projects?.length || 0;
  const projectScore = projectsTotal ? (projectsCompleted / projectsTotal) * 100 : 0;

  // Mock score logic: average rating / 10 * 100
  const mockAvgRating = mocks?.length 
    ? mocks.reduce((acc, m) => acc + m.selfRating, 0) / mocks.length 
    : 0;
  const mockScore = (mockAvgRating / 10) * 100;

  // Readiness Score: DSA(30%) + CS(30%) + Projects(20%) + Mocks(20%)
  const readinessScore = Math.round(
    (dsaScore * 0.3) + (csScore * 0.3) + (projectScore * 0.2) + (mockScore * 0.2)
  );

  // Daily Streak - consecutive days with logs ending today or yesterday
  const streak = (() => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = [...new Set(
      logs.map(log => {
        const d = new Date(log.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    )].map(key => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d);
    }).sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstLogDate = uniqueDates[0];
    firstLogDate.setHours(0, 0, 0, 0);
    if (firstLogDate.getTime() !== today.getTime() && firstLogDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let count = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = uniqueDates[i - 1];
      const curr = uniqueDates[i];
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  const chartData = [
    { name: "Readiness", value: readinessScore, color: "#8b5cf6" }, // violet-500
    { name: "Remaining", value: 100 - readinessScore, color: "#f3f4f6" }, // gray-100
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your placement preparation overview</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl shadow-sm border border-border/50">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-lg">{streak}</span>
            <span className="text-sm text-muted-foreground">Log Streak</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard 
          title="DSA Progress" 
          value={dsaCompleted} 
          total={dsaTotal} 
          colorClass="bg-blue-500"
          icon={<Code2 className="w-5 h-5" />}
        />
        <ProgressCard 
          title="CS Fundamentals" 
          value={csCompleted} 
          total={csTotal} 
          colorClass="bg-emerald-500"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <ProgressCard 
          title="Projects Built" 
          value={projectsCompleted} 
          total={projectsTotal} 
          colorClass="bg-amber-500"
          icon={<FolderGit2 className="w-5 h-5" />}
        />
        <ProgressCard 
          title="Mock Interviews" 
          value={mocks?.length || 0} 
          total={10} // Target goal
          colorClass="bg-rose-500"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Readiness Score Chart */}
        <Card className="col-span-1 shadow-lg border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-bold font-display text-primary">{readinessScore}%</span>
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium mt-1">Ready</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1 lg:col-span-2 shadow-lg border-border/60">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="space-y-6">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="font-bold text-primary text-xs uppercase text-center leading-none">
                        {format(new Date(log.date), "MMM")}<br/>
                        <span className="text-sm">{format(new Date(log.date), "dd")}</span>
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{log.content}</p>
                      <p className="text-xs text-muted-foreground">{log.hoursSpent} hours spent</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No logs yet. Start tracking your daily progress!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
