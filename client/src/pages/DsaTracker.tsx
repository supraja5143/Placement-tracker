import { useDsaTopics, useCreateDsaTopic, useUpdateDsaTopic } from "@/hooks/use-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const CATEGORIES = [
  "Arrays", "Strings", "Linked List", "Stacks & Queues", 
  "Trees", "Graphs", "Dynamic Programming", "Recursion", "Backtracking"
];

export default function DsaTracker() {
  const { data: topics, isLoading } = useDsaTopics();
  const createMutation = useCreateDsaTopic();
  const updateMutation = useUpdateDsaTopic();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [newTopic, setNewTopic] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { topic: newTopic, category: newCategory, status: "not_started" },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewTopic("");
        }
      }
    );
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = 
      currentStatus === "not_started" ? "in_progress" :
      currentStatus === "in_progress" ? "completed" : "not_started";
    
    updateMutation.mutate({ id, status: nextStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress": return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const groupedTopics = CATEGORIES.map(cat => ({
    category: cat,
    topics: topics?.filter(t => t.category === cat) || []
  })).filter(g => g.topics.length > 0 || true); // Show all categories even if empty for better UX

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">DSA Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your Data Structures & Algorithms progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New DSA Topic</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Topic Name</Label>
                <Input 
                  value={newTopic} 
                  onChange={(e) => setNewTopic(e.target.value)} 
                  placeholder="e.g. Reverse Linked List" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Topic"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedTopics.map((group) => (
          <Card key={group.category} className="p-4 bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-4 font-display flex items-center justify-between">
              {group.category}
              <Badge variant="secondary" className="text-xs font-normal">
                {group.topics.filter(t => t.status === "completed").length}/{group.topics.length}
              </Badge>
            </h3>
            
            <div className="space-y-2">
              {group.topics.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No topics yet.</p>
              ) : (
                group.topics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => toggleStatus(topic.id, topic.status)}
                  >
                    <span className={cn(
                      "text-sm font-medium transition-all",
                      topic.status === "completed" && "text-muted-foreground line-through decoration-muted-foreground/50"
                    )}>
                      {topic.topic}
                    </span>
                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                      {getStatusIcon(topic.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
