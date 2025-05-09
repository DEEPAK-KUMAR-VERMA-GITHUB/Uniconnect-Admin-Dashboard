import { Course } from "@/services/courseService";
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

// Define available course statuses
const COURSE_STATUSES = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Course is currently offered",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    description: "Course is temporarily suspended",
  },
  {
    value: "DISCONTINUED",
    label: "Discontinued",
    description: "Course is no longer offered",
  },
];

const ChangeCourseStatusDialog = ({
  course,
  isOpen,
  onOpenChange,
  onStatusChange,
}: {
  course: Course | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (courseId: string, status: string) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Set the current status when course changes
  useEffect(() => {
    if (course) {
      setSelectedStatus(course.status);
    }
  }, [course]);

  const handleStatusChange = () => {
    if (course && selectedStatus) {
      onStatusChange(course._id, selectedStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Course Status</DialogTitle>
          <DialogDescription>
            Update the operational status of this course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {course && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <h4 className="text-sm font-medium mb-1">Course Information</h4>
              <p className="font-medium">{course.name}</p>
              <p className="text-xs text-muted-foreground">
                Code: {course.code}
              </p>
              <p className="text-xs text-muted-foreground">
                Department: {course.department?.name}
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-xs">Current Status: </span>
                <span
                  className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                    course.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : course.status === "INACTIVE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.status}
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
                {COURSE_STATUSES.map((status) => (
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
            disabled={!selectedStatus || selectedStatus === course?.status}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeCourseStatusDialog;
