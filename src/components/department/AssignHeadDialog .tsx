import { Department } from "@/services/departmentService";
import { useFacultyByDepartment } from "@/services/facultyService";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const AssignHeadDialog = ({
  department,
  isOpen,
  onOpenChange,
  onAssign,
}: {
  department: Department | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (departmentId: string, facultyId: string) => void;
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const { data: facultiesData, isLoading } = useFacultyByDepartment(
    department?._id
  );
  const faculties = facultiesData?.data?.data || [];

  // Reset selected faculty when department changes
  useEffect(() => {
    if (department?.head) {
      setSelectedFaculty(department.head._id);
    } else {
      setSelectedFaculty("");
    }
  }, [department]);

  const handleAssign = () => {
    if (department && selectedFaculty) {
      onAssign(department._id, selectedFaculty);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {department?.head
              ? "Change Department Head"
              : "Assign Department Head"}
          </DialogTitle>
          <DialogDescription>
            Select a faculty member from this department to serve as department
            head
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : faculties.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>No eligible faculty members found in this department.</p>
              <p className="text-sm mt-2">
                Faculty must be verified and active.
              </p>
            </div>
          ) : (
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a faculty member" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty._id} value={faculty._id}>
                    {faculty.fullName} ({faculty.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedFaculty || isLoading || faculties.length === 0}
          >
            {department?.head ? "Change Head" : "Assign Head"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignHeadDialog;
