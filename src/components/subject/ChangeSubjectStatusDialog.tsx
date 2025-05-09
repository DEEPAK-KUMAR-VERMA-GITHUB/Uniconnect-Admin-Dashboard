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
import { useEffect, useState } from "react";

interface ChangeSubjectStatusDialogProps {
  subject: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (subjectId: string, status: string) => void;
}

const ChangeSubjectStatusDialog = ({
  subject,
  isOpen,
  onOpenChange,
  onStatusChange,
}: ChangeSubjectStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Reset selected status when dialog opens with a new subject
  useEffect(() => {
    if (subject && isOpen) {
      setSelectedStatus(subject.status);
    } else if (!isOpen) {
      setSelectedStatus("");
    }
  }, [subject, isOpen]);

  // Reset selected status when dialog closes
  if (!isOpen && selectedStatus !== "") {
    setTimeout(() => setSelectedStatus(""), 300);
  }

  const handleStatusChange = () => {
    if (subject && selectedStatus) {
      onStatusChange(subject._id, selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Subject Status</DialogTitle>
          <DialogDescription>
            Update the status of {subject?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStatusChange}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSubjectStatusDialog;
