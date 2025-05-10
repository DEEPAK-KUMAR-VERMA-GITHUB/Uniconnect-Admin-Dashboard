import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAvailableSubjects } from "@/services/subjectService";
import { Loader2, Search } from "lucide-react"; // Changed to Loader2 from lucide-react
import { useEffect, useMemo, useState } from "react";

interface AddSemesterSubjectsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSubjects: (subjectIds: string[]) => void;
  departmentId: string;
  courseId: string;
  semesterId: string;
}

const AddSemesterSubjectsDialog = ({
  isOpen,
  onOpenChange,
  onAddSubjects,
  departmentId,
  courseId,
  semesterId,
}: AddSemesterSubjectsDialogProps) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch available subjects for this department and course
  const { data, isLoading, isError, error } = useAvailableSubjects(
    departmentId,
    courseId,
    semesterId
  );

  const subjects = data?.data || [];

  // Reset selected subjects when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSubjects([]);
      setSearchTerm("");
      setActiveTab("all");
    }
  }, [isOpen, departmentId, courseId, semesterId]);

  // Filter subjects based on search term and active tab
  const filteredSubjects = useMemo(() => {
    let filtered = subjects;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(term) ||
          subject.code.toLowerCase().includes(term)
      );
    }

    // Apply tab filter
    if (activeTab === "core") {
      filtered = filtered.filter((s) => !s.metadata?.isElective);
    } else if (activeTab === "elective") {
      filtered = filtered.filter((s) => s.metadata?.isElective);
    } else if (activeTab === "lab") {
      filtered = filtered.filter((s) => s.metadata?.hasLab);
    } else if (activeTab === "online") {
      filtered = filtered.filter((s) => s.metadata?.isOnline);
    }

    return filtered;
  }, [subjects, searchTerm, activeTab]);

  // Toggle subject selection
  const toggleSubjectSelection = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Toggle all subjects selection
  const toggleAllSubjects = (checked: boolean) => {
    if (checked) {
      setSelectedSubjects(filteredSubjects.map((subject) => subject._id));
    } else {
      setSelectedSubjects([]);
    }
  };

  // Handle adding selected subjects
  const handleAddSubjects = () => {
    console.log("Adding subjects:", selectedSubjects);
    onAddSubjects(selectedSubjects);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Subjects to Semester</DialogTitle>
          <DialogDescription>
            Select subjects from the list below to add to this semester.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              toggleAllSubjects(
                selectedSubjects.length !== filteredSubjects.length
              )
            }
          >
            {selectedSubjects.length === filteredSubjects.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="elective">Elective</TabsTrigger>
            <TabsTrigger value="lab">Lab</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="overflow-y-auto flex-1 mt-4 border rounded-md">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />{" "}
            </div>
          ) : isError ? (
            <div className="text-center text-destructive py-4">
              Error loading subjects: {(error as Error).message}
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subjects found. All subjects may already be added to this
              semester.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        filteredSubjects.length > 0 &&
                        selectedSubjects.length === filteredSubjects.length
                      }
                      onCheckedChange={toggleAllSubjects}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubjects.includes(subject._id)}
                        onCheckedChange={() =>
                          toggleSubjectSelection(subject._id)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {subject.name}
                    </TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell className="text-center">
                      {subject.credits}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {subject.metadata?.isElective ? (
                          <Badge variant="outline">Elective</Badge>
                        ) : (
                          <Badge>Core</Badge>
                        )}
                        {subject.metadata?.hasLab && (
                          <Badge variant="secondary">Lab</Badge>
                        )}
                        {subject.metadata?.isOnline && (
                          <Badge variant="outline">Online</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSubjects}
            disabled={selectedSubjects.length === 0}
          >
            Add {selectedSubjects.length} Subject
            {selectedSubjects.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSemesterSubjectsDialog;
