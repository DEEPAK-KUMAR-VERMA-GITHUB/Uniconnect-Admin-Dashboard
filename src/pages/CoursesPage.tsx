import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Course,
  useCreateCourse,
  useDeleteCourse,
  useCourses,
  useUpdateCourse,
} from "@/services/courseService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// UI Components
import CourseForm, {
  CourseFormValues,
  courseSchema,
} from "@/components/course/CourseForm";
import CourseTable from "@/components/course/CourseTable";
import PaginationControls from "@/components/department/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import ChangeCourseStatusDialog from "@/components/course/ChangeCourseStatusDialog";

const CoursesPage = () => {
  const { toast } = useToast();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const queryClient = useQueryClient();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [courseForStatusChange, setCourseForStatusChange] =
    useState<Course | null>(null);

  // Form setup
  const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      code: "",
      department: "",
      duration: 4,
      type: "",
    },
  });

  // Reset form when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      courseForm.reset({
        name: selectedCourse.name,
        code: selectedCourse.code,
        department: selectedCourse.department._id,
        duration: selectedCourse.duration,
        type: selectedCourse.type,
      });
    } else {
      courseForm.reset({
        name: "",
        code: "",
        department: "",
        duration: 4,
        type: "",
      });
    }
  }, [selectedCourse, courseForm]);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useCourses(currentPage, coursesPerPage);
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  // Extract data with safe fallbacks
  const { courses, pagination } = useMemo(
    () => ({
      courses: res?.data?.data || [],
      pagination: res?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
      },
    }),
    [res]
  );

  // Calculate pagination values
  const { totalPages, totalItems, startItem, endItem } = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    const totalItems = pagination.totalItems || 0;
    const startItem =
      courses.length > 0 ? (currentPage - 1) * coursesPerPage + 1 : 0;
    const endItem = Math.min(currentPage * coursesPerPage, totalItems);
    return { totalPages, totalItems, startItem, endItem };
  }, [pagination, currentPage, coursesPerPage, courses.length]);

  // Handle page changes
  const goToPage = useCallback(
    (pageNumber: number) => setCurrentPage(pageNumber),
    []
  );
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }, [currentPage, totalPages]);
  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  // Handle course actions
  const handleEdit = useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteCourseMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["courses"] });
          toast({
            title: "Success",
            description: "Course deleted successfully",
            variant: "default",
          });
        },
        onError: (error: Error) => {
          try {
            const err = JSON.parse(error.message);
            toast({
              title: err.error || "Error",
              description: err.message || "Failed to delete course",
              variant: "destructive",
            });
          } catch {
            toast({
              title: "Error",
              description: error.message || "Failed to delete course",
              variant: "destructive",
            });
          }
        },
      });
    },
    [deleteCourseMutation, queryClient, toast]
  );

  // Handle status change
  const handleStatusChange = useCallback(
    (courseId: string, status: string) => {
      updateCourseMutation.mutate(
        {
          id: courseId,
          data: { status },
        },
        {
          onSuccess: () => {
            setIsStatusDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast({
              title: "Success",
              description: "Course status updated successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to update course status",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description: error.message || "Failed to update course status",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [updateCourseMutation, queryClient, toast]
  );

  // Form submission
  const onSubmit = useCallback(
    (data: CourseFormValues) => {
      if (selectedCourse) {
        // Update existing course
        updateCourseMutation.mutate(
          {
            id: selectedCourse._id,
            data: {
              name: data.name,
              code: data.code,
              department: data.department,
              duration: data.duration,
              type: data.type,
            },
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              setSelectedCourse(null);
              queryClient.invalidateQueries({ queryKey: ["courses"] });
              toast({
                title: "Success",
                description: "Course updated successfully",
                variant: "default",
              });
            },
            onError: (error: Error) => {
              try {
                const err = JSON.parse(error.message);
                toast({
                  title: err.error || "Error",
                  description: err.message || "Failed to update course",
                  variant: "destructive",
                });
              } catch {
                toast({
                  title: "Error",
                  description: error.message || "Failed to update course",
                  variant: "destructive",
                });
              }
            },
          }
        );
      } else {
        // Create new course
        createCourseMutation.mutate(data, {
          onSuccess: () => {
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast({
              title: "Success",
              description: "Course created successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to create course",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description: error.message || "Failed to create course",
                variant: "destructive",
              });
            }
          },
        });
      }
    },
    [
      selectedCourse,
      createCourseMutation,
      updateCourseMutation,
      queryClient,
      toast,
    ]
  );

  const isSubmitting =
    createCourseMutation.isPending || updateCourseMutation.isPending;

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Course Management</h1>
              <p className="text-muted-foreground">
                Manage university courses and their details
              </p>
            </div>

            <ChangeCourseStatusDialog
              course={courseForStatusChange}
              isOpen={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
              onStatusChange={handleStatusChange}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedCourse(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCourse ? "Edit Course" : "Add Course"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCourse
                      ? "Update the course details below"
                      : "Fill in the course details below"}
                  </DialogDescription>
                </DialogHeader>

                <CourseForm
                  form={courseForm}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  isEditing={!!selectedCourse}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : isError ? (
                <div className="text-center text-destructive py-4">
                  Error loading courses: {(error as Error).message}
                </div>
              ) : (
                <>
                  <CourseTable
                    courses={courses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChangeStatus={(course: Course) => {
                      setCourseForStatusChange(course);
                      setIsStatusDialogOpen(true);
                    }}
                  />

                  {/* Pagination */}
                  {courses.length > 0 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      startItem={startItem}
                      endItem={endItem}
                      totalItems={totalItems}
                      onPrevPage={prevPage}
                      onNextPage={nextPage}
                      onGoToPage={goToPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;
