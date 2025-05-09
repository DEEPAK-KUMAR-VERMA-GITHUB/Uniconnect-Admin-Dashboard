import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Department } from "@/services/departmentService";
import { Building, Edit, Settings, Trash2 } from "lucide-react";

const DepartmentTable = ({
  departments,
  onEdit,
  onDelete,
  onAssignHead,
  onChangeStatus,
}: {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
  onAssignHead: (department: Department) => void;
  onChangeStatus: (department: Department) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Department Name</TableHead>
        <TableHead className="text-center">Code</TableHead>
        <TableHead className="text-center">Status</TableHead>
        <TableHead className="text-center">Head</TableHead>
        <TableHead className="text-center">Courses</TableHead>
        <TableHead className="text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {departments.length > 0 ? (
        departments.map((department) => (
          <TableRow key={department._id}>
            <TableCell className="font-medium">{department.name}</TableCell>
            <TableCell className="text-center">{department.code}</TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Badge
                  variant={
                    department.status === "ACTIVE"
                      ? "success"
                      : department.status === "INACTIVE"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {department.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onChangeStatus(department)}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
            <TableCell className="text-center">
              {department.head ? (
                <div className="flex items-center justify-center">
                  <span>{department?.head.fullName || "Faculty Member"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => onAssignHead(department)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssignHead(department)}
                >
                  Assign Head
                </Button>
              )}
            </TableCell>
            <TableCell className="text-center">
              {department.courses.length}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(department)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Department</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{department.name}"?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(department._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <EmptyState onAddClick={() => {}} />
      )}
    </TableBody>
  </Table>
);

const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <div className="flex flex-col items-center justify-center text-muted-foreground">
        <Building className="h-12 w-12 mb-2 opacity-20" />
        <p>No departments found</p>
        <Button variant="link" onClick={onAddClick} className="mt-2">
          Add your first department
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export default DepartmentTable;
