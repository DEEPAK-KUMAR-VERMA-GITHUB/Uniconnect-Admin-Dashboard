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
import { Semester } from "@/services/semesterService";
import { useState } from "react";

interface ChangeSemesterStatusDialogProps {
  semester: Semester | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (semesterId: string, status: string) => void;
}

const ChangeSemesterStatusDialog = ({
  semester,
  isOpen,
  onOpenChange,
  onStatusChange,
}: ChangeSemesterStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Reset selected status when dialog opens with a new semester
  if (semester && isOpen && selectedStatus === "") {
    setSelectedStatus(semester.status);
  }

  // Reset selected status when dialog closes
  if (!isOpen && selectedStatus !== "") {
    setTimeout(() => setSelectedStatus(""), 300);
  }

  const handleStatusChange = () => {
    if (semester && selectedStatus) {
      onStatusChange(semester._id, selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Semester Status</DialogTitle>
          <DialogDescription>
            Update the status of {semester?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleStatusChange}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSemesterStatusDialog;