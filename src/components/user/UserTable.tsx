import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Ban,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  profilePicture?: string;
  isVerified: boolean;
  createdAt: string;
  department?: {
    _id: string;
    name: string;
  };
}

interface UserTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onVerify: (userId: string) => void;
  onBlock: (user: User) => void;
  onDelete: (user: User) => void;
  verifyingUserId: string | null;
  blockingUserId: string | null;
  deletingUserId: string | null;
}

const UserTable = ({
  users,
  onViewDetails,
  onVerify,
  onBlock,
  onDelete,
  verifyingUserId,
  blockingUserId,
  deletingUserId,
}: UserTableProps) => {
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get status badge
  const getStatusBadge = (isBlocked: boolean, isVerified: boolean) => {
    if (isBlocked) {
      return <Badge variant="destructive">Blocked</Badge>;
    }

    if (!isVerified) {
      return <Badge variant="secondary">Unverified</Badge>;
    }

    return <Badge variant="success">Active</Badge>;
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500">Admin</Badge>;
      case "FACULTY":
        return <Badge className="bg-blue-500">Faculty</Badge>;
      case "STUDENT":
        return <Badge className="bg-green-500">Student</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                {getStatusBadge(user.isBlocked, user.isVerified)}
              </TableCell>
              <TableCell>
                {user.department?.name ||
                  (user.role === "ADMIN" ? "N/A" : "Not assigned")}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    {!user.isVerified && (
                      <DropdownMenuItem
                        onClick={() => onVerify(user._id)}
                        disabled={verifyingUserId === user._id}
                      >
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Verififying...
                        </>
                        :{" "}
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify User
                        </>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => onBlock(user)}
                      disabled={blockingUserId === user._id}
                    >
                      {blockingUserId === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <>
                          {user.isBlocked ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unblock User
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Block User
                            </>
                          )}
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(user)}
                      disabled={deletingUserId === user._id}
                    >
                      {deletingUserId === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
