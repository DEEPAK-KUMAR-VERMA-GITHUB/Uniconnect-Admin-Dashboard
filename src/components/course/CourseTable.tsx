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
import { Course } from "@/services/courseService";
import { BookOpen, Edit, Settings, Trash2, CalendarDays } from "lucide-react";
import { useLocation } from "wouter";

const CourseTable = ({
  courses,
  onEdit,
  onDelete,
  onChangeStatus,
}: {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (course: Course) => void;
}) => {
  const [, navigate] = useLocation();

  const handleViewSessions = (courseId: string) => {
    navigate(`/course-sessions/${courseId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course Name</TableHead>
          <TableHead className="text-center">Code</TableHead>
          <TableHead className="text-center">Department</TableHead>
          <TableHead className="text-center">Duration</TableHead>
          <TableHead className="text-center">Type</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.length > 0 ? (
          courses.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="font-medium">
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-left"
                  onClick={() => handleViewSessions(course._id)}
                  disabled={course.status !== "ACTIVE"}
                >
                  {course.name}
                </Button>
              </TableCell>
              <TableCell className="text-center">{course.code}</TableCell>
              <TableCell className="text-center">
                {course.department?.name || "N/A"}
              </TableCell>
              <TableCell className="text-center">
                {course.duration} years
              </TableCell>
              <TableCell className="text-center">{course.type}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Badge
                    variant={
                      course.status === "ACTIVE"
                        ? "success"
                        : course.status === "INACTIVE"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {course.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onChangeStatus(course)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewSessions(course._id)}
                    title="View Sessions"
                    disabled={course.status !== "ACTIVE"}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(course)}
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
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{course.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(course._id)}
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
};

const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => (
  <TableRow>
    <TableCell colSpan={7} className="text-center py-8">
      <div className="flex flex-col items-center justify-center text-muted-foreground">
        <BookOpen className="h-12 w-12 mb-2 opacity-20" />
        <p>No courses found</p>
        <Button variant="link" onClick={onAddClick} className="mt-2">
          Add your first course
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export default CourseTable;
