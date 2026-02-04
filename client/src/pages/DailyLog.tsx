import { useDailyLogs, useCreateDailyLog } from "@/hooks/use-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function DailyLog() {
  const { data: logs, isLoading } = useDailyLogs();
  const createMutation = useCreateDailyLog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [content, setContent] = useState("");
  const [hoursSpent, setHoursSpent] = useState("0");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { content, hoursSpent: parseInt(hoursSpent) || 0, date: new Date().toISOString() }, // Fixed: sending Date, handled by zod coercion
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setContent("");
          setHoursSpent("0");
        }
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">Daily Log</h1>
          <p className="text-muted-foreground mt-1">Consistency is key. What did you do today?</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Daily Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>What did you study?</Label>
                <Textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Solved 3 DP problems and read about Indexing in DBMS..." 
                  required 
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Hours Spent</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={hoursSpent} 
                  onChange={(e) => setHoursSpent(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Save Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative border-l border-border/60 ml-3 space-y-8 pb-8">
        {logs?.length === 0 ? (
          <div className="pl-8 text-muted-foreground">No logs yet. Start your streak today!</div>
        ) : (
          logs?.slice().reverse().map((log) => (
            <div key={log.id} className="relative pl-8 group">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background group-hover:ring-primary/20 transition-all" />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <time className="text-sm text-muted-foreground font-medium mb-1 sm:mb-0">
                  {format(new Date(log.date), "PPP")}
                </time>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">
                  {log.hoursSpent} hours
                </span>
              </div>
              
              <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm group-hover:shadow-md transition-all">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{log.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
