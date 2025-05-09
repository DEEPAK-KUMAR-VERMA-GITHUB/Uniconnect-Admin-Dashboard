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
import { Semester } from "@/services/semesterService";
import { MoreHorizontal, Pencil, Trash2, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface SemesterTableProps {
  semesters: Semester[];
  onEdit: (semester: Semester) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (semester: Semester) => void;
}

const SemesterTable = ({
  semesters,
  onEdit,
  onDelete,
  onChangeStatus,
}: SemesterTableProps) => {
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

  const handleViewSubjects = (semesterId: string) => {
    navigate(`/semester-subjects/${semesterId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Number</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {semesters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No semesters found
              </TableCell>
            </TableRow>
          ) : (
            semesters.map((semester) => (
              <TableRow key={semester._id}>
                <TableCell className="font-medium">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-left"
                    onClick={() => handleViewSubjects(semester._id)}
                  >
                    {semester.semesterName}
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  {semester.semesterNumber}
                </TableCell>
                <TableCell>{formatDate(semester.startDate)}</TableCell>
                <TableCell>{formatDate(semester.endDate)}</TableCell>
                <TableCell>{getStatusBadge(semester?.status || "")}</TableCell>
                <TableCell>{semester.subjects.length || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(semester)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onChangeStatus(semester)}
                      >
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(semester._id)}
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

export default SemesterTable;
