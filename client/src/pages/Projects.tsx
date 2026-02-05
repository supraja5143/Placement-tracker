import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Rocket, Code, ExternalLink, FolderGit2, CheckCircle2, Clock, FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [status, setStatus] = useState("planned");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { name, techStack, status, isInterviewReady: false },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setName("");
          setTechStack("");
          setStatus("planned");
          toast({
            title: (<div className="flex items-center gap-2"><FolderPlus className="w-4 h-4 text-blue-500" /><span className="text-blue-600">Project added!</span></div>),
            description: `"${name}" has been created`,
            className: "border-blue-400 bg-blue-50",
          });
        }
      }
    );
  };

  const toggleInterviewReady = (id: number, current: boolean) => {
    updateMutation.mutate({ id, isInterviewReady: !current }, {
      onSuccess: () => {
        if (!current) {
          toast({
            title: (<div className="flex items-center gap-2"><Rocket className="w-4 h-4 text-green-500" /><span className="text-green-600">Interview ready!</span></div>),
            description: "Project marked as interview ready",
            className: "border-green-400 bg-green-50",
          });
        } else {
          toast({
            title: (<div className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" /><span className="text-yellow-600">Not ready yet</span></div>),
            description: "Project unmarked as interview ready",
            className: "border-yellow-400 bg-yellow-50",
          });
        }
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">Projects</h1>
          <p className="text-muted-foreground mt-1">Showcase your practical skills</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. E-commerce API" required />
              </div>
              <div className="space-y-2">
                <Label>Tech Stack (comma separated)</Label>
                <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
             <FolderGit2 className="h-12 w-12 mb-4 opacity-20" />
             <p>No projects yet. Add one to get started!</p>
          </div>
        ) : (
          projects?.map((project) => (
            <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-border/60">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                    <Badge variant={
                      project.status === "completed" ? "default" : 
                      project.status === "in_progress" ? "secondary" : "outline"
                    } className="capitalize">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {project.isInterviewReady && (
                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                      <Rocket className="w-3 h-3 mr-1" /> Ready
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="w-4 h-4" />
                  <span>{project.techStack}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={project.isInterviewReady || false} 
                    onCheckedChange={() => toggleInterviewReady(project.id, project.isInterviewReady || false)}
                    id={`ready-${project.id}`}
                  />
                  <Label htmlFor={`ready-${project.id}`} className="text-xs cursor-pointer text-muted-foreground">
                    Interview Ready
                  </Label>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Delete this project?")) deleteMutation.mutate(project.id, {
                      onSuccess: () => {
                        toast({
                          title: (<div className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-500" /><span className="text-red-600">Project deleted</span></div>),
                          description: `"${project.name}" has been removed`,
                          className: "border-red-400 bg-red-50",
                        });
                      }
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
