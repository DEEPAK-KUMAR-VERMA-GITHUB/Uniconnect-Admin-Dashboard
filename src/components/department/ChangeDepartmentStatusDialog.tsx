import { Department } from "@/services/departmentService";
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

// Define available department statuses
const DEPARTMENT_STATUSES = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Department is fully operational",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    description: "Department is temporarily suspended",
  },
  {
    value: "DISCONTINUED",
    label: "Discontinued",
    description: "Department is permanently closed",
  },
];

const ChangeDepartmentStatusDialog = ({
  department,
  isOpen,
  onOpenChange,
  onStatusChange,
}: {
  department: Department | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (departmentId: string, status: string) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Set the current status when department changes
  useEffect(() => {
    if (department) {
      setSelectedStatus(department.status);
    }
  }, [department]);

  const handleStatusChange = () => {
    if (department && selectedStatus) {
      onStatusChange(department._id, selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Department Status</DialogTitle>
          <DialogDescription>
            Update the operational status of this department
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {department && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <h4 className="text-sm font-medium mb-1">
                Department Information
              </h4>
              <p className="font-medium">{department.name}</p>
              <p className="text-xs text-muted-foreground">
                Code: {department.code}
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-xs">Current Status: </span>
                <span
                  className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                    department.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : department.status === "INACTIVE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {department.status}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex flex-col">
                      <span>{status.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {status.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            disabled={!selectedStatus || selectedStatus === department?.status}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeDepartmentStatusDialog;
