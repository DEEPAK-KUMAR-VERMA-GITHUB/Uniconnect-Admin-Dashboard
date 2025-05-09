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
import { Session } from "@/services/sessionService";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface SessionTableProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (session: Session) => void;
}

const SessionTable = ({
  sessions,
  onEdit,
  onDelete,
  onChangeStatus,
}: SessionTableProps) => {
  const [, navigate] = useLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-amber-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewSemesters = (sessionId: string) => {
    navigate(`/session-semesters/${sessionId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Semester</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No sessions found
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell className="font-medium">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-left"
                    onClick={() => handleViewSemesters(session._id)}
                  >
                    {`${session.startYear} - ${session.endYear}`}
                  </Button>
                </TableCell>
                <TableCell>{session.startYear}</TableCell>
                <TableCell>{session.endYear}</TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell>{session.currentSemester || "N/A"}</TableCell>
                <TableCell>{formatDate(session.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewSemesters(session._id)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Semesters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(session)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangeStatus(session)}>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(session._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SessionTable;
