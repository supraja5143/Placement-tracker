import { useCsTopics, useCreateCsTopic, useUpdateCsTopic } from "@/hooks/use-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SUBJECTS = ["OS", "DBMS", "CN", "OOPs"];

export default function CsFundamentals() {
  const { data: topics, isLoading } = useCsTopics();
  const createMutation = useCreateCsTopic();
  const updateMutation = useUpdateCsTopic();
  const [activeTab, setActiveTab] = useState("OS");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [newTopic, setNewTopic] = useState("");
  const [newSubject, setNewSubject] = useState("OS");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { topic: newTopic, subject: newSubject, status: "not_started" },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewTopic("");
        }
      }
    );
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "not_started" : "completed";
    updateMutation.mutate({ id, status: nextStatus });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">CS Fundamentals</h1>
          <p className="text-muted-foreground mt-1">Core computer science concepts for interviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Concept</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Concept Name</Label>
                <Input 
                  value={newTopic} 
                  onChange={(e) => setNewTopic(e.target.value)} 
                  placeholder="e.g. Deadlocks" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={newSubject} onValueChange={setNewSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Add Concept
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8 p-1 bg-muted/50 rounded-xl">
          {SUBJECTS.map((subject) => (
            <TabsTrigger 
              key={subject} 
              value={subject}
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              {subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {SUBJECTS.map((subject) => {
          const subjectTopics = topics?.filter(t => t.subject === subject) || [];
          return (
            <TabsContent key={subject} value={subject} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {subjectTopics.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    No topics added for {subject} yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {subjectTopics.map((topic) => (
                      <div 
                        key={topic.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group cursor-pointer"
                        onClick={() => toggleStatus(topic.id, topic.status)}
                      >
                        <span className={cn(
                          "font-medium transition-all duration-300",
                          topic.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {topic.topic}
                        </span>
                        
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                          topic.status === "completed" 
                            ? "bg-green-500 border-green-500 text-white" 
                            : "border-muted-foreground/30 text-transparent group-hover:border-primary/50"
                        )}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
