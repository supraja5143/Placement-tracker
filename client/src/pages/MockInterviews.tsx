import { useMockInterviews, useCreateMockInterview, useDeleteMockInterview } from "@/hooks/use-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Star, Trash2, CalendarDays, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function MockInterviews() {
  const { data: mocks, isLoading } = useMockInterviews();
  const createMutation = useCreateMockInterview();
  const deleteMutation = useDeleteMockInterview();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [topicsCovered, setTopicsCovered] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState([5]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { 
        topicsCovered, 
        feedback, 
        selfRating: rating[0], 
        date: new Date() // Sending Date object, zod coercion handles it
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setTopicsCovered("");
          setFeedback("");
          setRating([5]);
          toast({
            title: (<div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-green-600">Interview logged!</span></div>),
            description: "Great practice session recorded",
            className: "border-green-400 bg-green-50",
          });
        }
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">Mock Interviews</h1>
          <p className="text-muted-foreground mt-1">Record and reflect on your practice sessions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Log Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Interview</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>Topics Covered</Label>
                <Input value={topicsCovered} onChange={(e) => setTopicsCovered(e.target.value)} placeholder="System Design, LeetCode Hard..." required />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                   <Label>Self Rating (1-10)</Label>
                   <span className="text-sm font-bold text-primary">{rating[0]}/10</span>
                </div>
                <Slider 
                  value={rating} 
                  onValueChange={setRating} 
                  max={10} 
                  min={1} 
                  step={1} 
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label>Feedback / Notes</Label>
                <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well? What needs improvement?" />
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Save Log
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {mocks?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
            No interviews logged yet. Time to practice!
          </div>
        ) : (
          mocks?.slice().reverse().map((mock) => (
            <Card key={mock.id} className="group overflow-hidden hover:shadow-md transition-all duration-300">
              <CardContent className="p-0 flex flex-col md:flex-row">
                 <div className="bg-primary/5 p-6 flex flex-col items-center justify-center min-w-[120px] border-r border-border/50">
                    <span className="text-2xl font-bold font-display text-primary">{mock.selfRating}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Rating</span>
                 </div>
                 <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg">{mock.topicsCovered}</h3>
                       <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                         <CalendarDays className="w-3 h-3 mr-1" />
                         {format(new Date(mock.date), "PPP")}
                       </div>
                    </div>
                    {mock.feedback && (
                      <p className="text-muted-foreground text-sm mt-2 italic border-l-2 border-primary/20 pl-3">
                        "{mock.feedback}"
                      </p>
                    )}
                 </div>
                 <div className="p-4 flex items-center justify-center md:border-l border-t md:border-t-0 border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Delete this log?")) deleteMutation.mutate(mock.id, {
                          onSuccess: () => {
                            toast({
                              title: (<div className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-500" /><span className="text-red-600">Interview deleted</span></div>),
                              description: "Log has been removed",
                              className: "border-red-400 bg-red-50",
                            });
                          }
                        });
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
