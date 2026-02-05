import {
  useCustomSections,
  useCreateCustomSection,
  useDeleteCustomSection,
  useCustomTopics,
  useCreateCustomTopic,
  useUpdateCustomTopic,
  useDeleteCustomTopic,
} from "@/hooks/use-data";
import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Plus, CheckCircle2, Circle, Clock, RotateCcw,
  Trash2, Layers, ChevronDown, ChevronRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function SectionCard({ section }: { section: { id: number; name: string; icon: string } }) {
  const { data: topics, isLoading } = useCustomTopics(section.id);
  const createTopicMutation = useCreateCustomTopic();
  const updateTopicMutation = useUpdateCustomTopic();
  const deleteTopicMutation = useDeleteCustomTopic();
  const deleteSectionMutation = useDeleteCustomSection();
  const { toast } = useToast();

  const [expanded, setExpanded] = useState(true);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    createTopicMutation.mutate(
      { sectionId: section.id, topic: newTopicName, status: "not_started" },
      {
        onSuccess: () => {
          setIsAddTopicOpen(false);
          setNewTopicName("");
          toast({
            title: (<div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /><span className="text-blue-600">Topic added!</span></div>),
            description: `Added to ${section.name}`,
            className: "border-blue-400 bg-blue-50",
          });
        },
      }
    );
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const nextStatus =
      currentStatus === "not_started" ? "in_progress" :
      currentStatus === "in_progress" ? "completed" : "not_started";

    updateTopicMutation.mutate({ id, status: nextStatus }, {
      onSuccess: () => {
        if (nextStatus === "in_progress") {
          toast({
            title: (<div className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" /><span className="text-yellow-600">Keep going!</span></div>),
            description: "Your topic is now in progress",
            className: "border-yellow-400 bg-yellow-50",
          });
        } else if (nextStatus === "completed") {
          toast({
            title: (<div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-green-600">Yay! Topic completed!</span></div>),
            description: "Great job, keep up the momentum!",
            className: "border-green-400 bg-green-50",
          });
        } else {
          toast({
            title: (<div className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-gray-500" /><span>Topic reset</span></div>),
            description: "Topic marked as not started",
          });
        }
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress": return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const completedCount = topics?.filter(t => t.status === "completed").length || 0;
  const totalCount = topics?.length || 0;

  return (
    <Card className="p-4 bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <h3 className="text-lg font-bold font-display">{section.name}</h3>
          <Badge variant="secondary" className="text-xs font-normal">
            {completedCount}/{totalCount}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Topic to {section.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTopic} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Topic Name</Label>
                  <Input
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="e.g. Load Balancing"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createTopicMutation.isPending}>
                  {createTopicMutation.isPending ? "Adding..." : "Add Topic"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm(`Delete "${section.name}" and all its topics?`)) {
                deleteSectionMutation.mutate(section.id, {
                  onSuccess: () => {
                    toast({
                      title: (<div className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-500" /><span className="text-red-600">Section deleted</span></div>),
                      description: `"${section.name}" and its topics have been removed`,
                      className: "border-red-400 bg-red-50",
                    });
                  }
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : totalCount === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No topics yet. Click + to add one.
            </p>
          ) : (
            topics?.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => toggleStatus(topic.id, topic.status)}
              >
                <span className={cn(
                  "text-sm font-medium transition-all flex-1",
                  topic.status === "completed" &&
                    "text-muted-foreground line-through decoration-muted-foreground/50"
                )}>
                  {topic.topic}
                </span>
                <div className="flex items-center gap-1">
                  <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                    {getStatusIcon(topic.status)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-70 hover:!opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTopicMutation.mutate(topic.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

export default function CustomTrackers() {
  const [, params] = useRoute("/custom/:id");
  const sectionId = params?.id ? parseInt(params.id) : undefined;
  const { data: sections, isLoading } = useCustomSections();
  const createSectionMutation = useCreateCustomSection();
  const { toast } = useToast();
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // If viewing a specific section from the sidebar
  const filteredSections = sectionId
    ? sections?.filter(s => s.id === sectionId)
    : sections;

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    createSectionMutation.mutate(
      { name: newSectionName, icon: "BookOpen" },
      {
        onSuccess: () => {
          setIsSectionDialogOpen(false);
          setNewSectionName("");
          toast({
            title: (<div className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-500" /><span className="text-purple-600">Section created!</span></div>),
            description: `"${newSectionName}" is ready to use`,
            className: "border-purple-400 bg-purple-50",
          });
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">Custom Trackers</h1>
          <p className="text-muted-foreground mt-1">
            Create your own tracking sections for any topic
          </p>
        </div>
        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Section</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSection} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder='e.g. System Design, Aptitude, HR Questions'
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createSectionMutation.isPending}>
                {createSectionMutation.isPending ? "Creating..." : "Create Section"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredSections && filteredSections.length === 0 && !sectionId ? (
        <Card className="p-12 text-center border-dashed border-2">
          <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No custom sections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first section to start tracking any topic you want.
          </p>
          <Button onClick={() => setIsSectionDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Section
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections?.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
