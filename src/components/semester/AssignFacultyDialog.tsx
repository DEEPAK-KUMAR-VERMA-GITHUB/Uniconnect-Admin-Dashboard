// src/components/subject/AssignFacultyDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFacultyByDepartment } from "@/services/facultyService";
import { useState, useEffect } from "react";

interface AssignFacultyDialogProps {
  subject: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignFaculty: (subjectId: string, facultyId: string) => void;
  semesterId: string;
}

const AssignFacultyDialog = ({
  subject,
  isOpen,
  onOpenChange,
  onAssignFaculty,
  semesterId,
}: AssignFacultyDialogProps) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");

  // Get department ID from the subject's course
  const departmentId = subject?.course?.department || "";

  // Fetch faculty members from the department
  const { data: facultyData, isLoading } = useFacultyByDepartment(departmentId);
  const facultyMembers = facultyData?.data?.data || [];

  // Reset selected faculty when dialog opens with a new subject
  useEffect(() => {
    if (subject && isOpen) {
      setSelectedFaculty(subject.faculty?._id || "");
    } else if (!isOpen) {
      // Clear selection when dialog closes
      setSelectedFaculty("");
    }
  }, [subject, isOpen]);

  const handleAssign = () => {
    if (subject && selectedFaculty) {
      onAssignFaculty(subject._id, selectedFaculty);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Faculty</DialogTitle>
          <DialogDescription>
            Select a faculty member to teach {subject?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {subject && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <h4 className="text-sm font-medium mb-1">Subject Information</h4>
              <p className="font-medium">{subject.name}</p>
              <p className="text-xs text-muted-foreground">
                Code: {subject.code}
              </p>
              <p className="text-xs text-muted-foreground">
                Credits: {subject.credits}
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-xs">Current Faculty: </span>
                <span className="ml-2 text-xs font-medium">
                  {subject.faculty?.fullName || "Not assigned"}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Faculty Member</label>
            {isLoading ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : facultyMembers.length === 0 ? (
              <div className="text-center text-muted-foreground py-2">
                No faculty members available for this department
              </div>
            ) : (
              <Select
                value={selectedFaculty}
                onValueChange={setSelectedFaculty}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a faculty member" />
                </SelectTrigger>
                <SelectContent>
                  {facultyMembers.map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      <div className="flex flex-col">
                        <span>{faculty.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {faculty.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedFaculty || isLoading}
          >
            Assign Faculty
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFacultyDialog;
