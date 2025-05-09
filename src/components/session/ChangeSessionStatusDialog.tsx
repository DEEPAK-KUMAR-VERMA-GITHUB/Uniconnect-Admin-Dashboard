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
import { Session } from "@/services/sessionService";
import { useState } from "react";

interface ChangeSessionStatusDialogProps {
  session: Session | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (sessionId: string, status: string) => void;
}

const ChangeSessionStatusDialog = ({
  session,
  isOpen,
  onOpenChange,
  onStatusChange,
}: ChangeSessionStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Reset selected status when dialog opens with a new session
  if (session && isOpen && selectedStatus === "") {
    setSelectedStatus(session.status);
  }

  // Reset selected status when dialog closes
  if (!isOpen && selectedStatus !== "") {
    setTimeout(() => setSelectedStatus(""), 300);
  }

  const handleStatusChange = () => {
    if (session && selectedStatus) {
      onStatusChange(session._id, selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Session Status</DialogTitle>
          <DialogDescription>
            Update the status of {session?.name}
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
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

export default ChangeSessionStatusDialog;