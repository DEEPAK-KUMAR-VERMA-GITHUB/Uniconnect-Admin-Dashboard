import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, Ban, Trash2, Loader2 } from "lucide-react";

interface UserDetailsDialogProps {
  user: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (userId: string) => void;
  onBlock: (userId: string, isBlocked: string) => void;
  onDelete: (userId: string) => void;
  verifyingUserId?: string | null;
  blockingUserId?: string | null;
  deletingUserId?: string | null;
}

const UserDetailsDialog = ({
  user,
  isOpen,
  onOpenChange,
  onVerify,
  onBlock,
  onDelete,
  verifyingUserId = null,
  blockingUserId = null,
  deletingUserId = null,
}: UserDetailsDialogProps) => {
  if (!user) return null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Check if current user is being processed
  const isVerifying = verifyingUserId === user._id;
  const isBlocking = blockingUserId === user._id;
  const isDeleting = deletingUserId === user._id;
  const isAdmin = user.role === "admin";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user account information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePic} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <Badge
                variant={
                  user.isBlocked
                    ? "destructive"
                    : !user.isVerified
                    ? "secondary"
                    : "success"
                }
              >
                {user.isBlocked
                  ? "Blocked"
                  : !user.isVerified
                  ? "Unverified"
                  : "Active"}
              </Badge>
              <Badge className="mt-1">{user.role}</Badge>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-medium">{user.fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Department
                </h4>
                <p>{user.department?.name || "Not assigned"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h4>
                <p>{user.phoneNumber || "Not provided"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Joined
                </h4>
                <p>{format(new Date(user.createdAt), "PPP")}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Last Login
                </h4>
                <p>
                  {user.lastLogin
                    ? format(new Date(user.lastLogin), "PPP")
                    : "Never"}
                </p>
              </div>
            </div>

            {user.role === "STUDENT" && user.studentDetails && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Student Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Roll Number
                    </h4>
                    <p>{user.studentDetails.rollNumber || "Not assigned"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Batch
                    </h4>
                    <p>{user.studentDetails.batch || "Not assigned"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Course
                    </h4>
                    <p>{user.studentDetails.course?.name || "Not assigned"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Current Semester
                    </h4>
                    <p>
                      {user.studentDetails.currentSemester || "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user.role === "FACULTY" && user.facultyDetails && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Faculty Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Employee ID
                    </h4>
                    <p>{user.facultyDetails.employeeId || "Not assigned"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Designation
                    </h4>
                    <p>{user.facultyDetails.designation || "Not assigned"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Specialization
                    </h4>
                    <p>
                      {user.facultyDetails.specialization || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Joining Date
                    </h4>
                    <p>
                      {user.facultyDetails.joiningDate
                        ? format(
                            new Date(user.facultyDetails.joiningDate),
                            "PPP"
                          )
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!user.isVerified && (
            <Button
              onClick={() => onVerify(user._id)}
              className="w-full sm:w-auto"
              variant="outline"
              disabled={isVerifying || isBlocking || isDeleting || isAdmin}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify User
                </>
              )}
            </Button>
          )}
          <Button
            onClick={() =>
              onBlock(user._id, user.isBlocked ? "Blocked" : "Unblocked")
            }
            className="w-full sm:w-auto"
            variant={user.isBlocked ? "outline" : "secondary"}
            disabled={isVerifying || isBlocking || isDeleting || isAdmin}
          >
            {isBlocking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {user.isBlocked ? "Unblocking..." : "Blocking..."}
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                {user.isBlocked ? "Unblock User" : "Block User"}
              </>
            )}
          </Button>
          <Button
            onClick={() => onDelete(user._id)}
            className="w-full sm:w-auto"
            variant="destructive"
            disabled={isVerifying || isBlocking || isDeleting || isAdmin}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
