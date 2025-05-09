// src/components/subject/SubjectTable.tsx
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
import { 
  MoreHorizontal, 
  Pencil, 
  ToggleLeft, 
  Trash2,
  UserPlus 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface SubjectTableProps {
  subjects: any[];
  onEdit: (subject: any) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (subject: any) => void;
  onAssignFaculty: (subject: any) => void;
}

const SubjectTable = ({
  subjects,
  onEdit,
  onDelete,
  onChangeStatus,
  onAssignFaculty,
}: SubjectTableProps) => {
  // Track which alert dialog is open
  const [openAlertId, setOpenAlertId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
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

  // Get initials for faculty avatar
  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Handle delete with confirmation
  const handleDelete = (id: string) => {
    onDelete(id);
    setOpenAlertId(null); // Close the dialog after deletion
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-center">Credits</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Faculty</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No subjects found
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow key={`${subject._id}-${subject.updatedAt || Date.now()}`}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.code}</TableCell>
                <TableCell className="text-center">{subject.credits}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(subject?.status || "")}
                </TableCell>
                <TableCell className="text-center">
                  {subject.metadata?.isElective ? "Elective" : "Core"}
                  {subject.metadata?.hasLab ? ", Lab" : ""}
                  {subject.metadata?.isOnline ? ", Online" : ""}
                </TableCell>
                <TableCell className="text-center">
                  {subject.faculty ? (
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(subject.faculty.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{subject.faculty.fullName}</span>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onAssignFaculty(subject)}
                      className="text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Assign
                    </Button>
                  )}
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
                      <DropdownMenuItem 
                        onClick={() => onEdit(subject)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onChangeStatus(subject)}
                        className="cursor-pointer"
                      >
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onAssignFaculty(subject)}
                        className="cursor-pointer"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {subject.faculty ? "Change Faculty" : "Assign Faculty"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setOpenAlertId(subject._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Separate AlertDialog from DropdownMenu */}
                  <AlertDialog 
                    open={openAlertId === subject._id}
                    onOpenChange={(open) => {
                      if (!open) setOpenAlertId(null);
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{subject.name}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenAlertId(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(subject._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubjectTable;
