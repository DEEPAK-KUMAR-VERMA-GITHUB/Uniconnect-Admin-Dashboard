import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useParams } from "wouter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

// UI Components
import SessionForm, {
  SessionFormValues,
  sessionSchema,
} from "@/components/session/SessionForm";
import SessionTable from "@/components/session/SessionTable";
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
import ChangeSessionStatusDialog from "@/components/session/ChangeSessionStatusDialog";

// Services
import { useCourse } from "@/services/courseService";
import {
  Session,
  useCreateCourseSession,
  useDeleteCourseSession,
  useCourseSessionsById,
  useUpdateCourseSession,
  useUpdateCourseSessionStatus,
} from "@/services/sessionService";

const CourseSessionsPage = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const queryClient = useQueryClient();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [sessionForStatusChange, setSessionForStatusChange] =
    useState<Session | null>(null);

  // Get course details
  const { data: courseData, isLoading: isLoadingCourse } = useCourse(
    courseId || ""
  );

  // Form setup
  const sessionForm = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      startYear: "",
    },
  });

  // Reset form when selected session changes
  useEffect(() => {
    if (selectedSession) {
      // Format dates to YYYY-MM-DD for input[type="date"]
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      sessionForm.reset({
        name: selectedSession.name,
        startYear: formatDateForInput(selectedSession.startYear),
      });
    } else {
      sessionForm.reset({
        name: "",
        startYear: "",
      });
    }
  }, [selectedSession, sessionForm]);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useCourseSessionsById(courseId || "");

  const createSessionMutation = useCreateCourseSession();
  const updateSessionMutation = useUpdateCourseSession();
  const deleteSessionMutation = useDeleteCourseSession();
  const updateSessionStatusMutation = useUpdateCourseSessionStatus();

  // Extract data with safe fallbacks
  const { sessions, pagination } = useMemo(
    () => ({
      sessions: res?.data?.data || [],
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
      sessions.length > 0 ? (currentPage - 1) * sessionsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * sessionsPerPage, totalItems);
    return { totalPages, totalItems, startItem, endItem };
  }, [pagination, currentPage, sessionsPerPage, sessions.length]);

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

  // Handle session actions
  const handleEdit = useCallback((session: Session) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSessionMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["course-sessions", courseId],
          });
          toast({
            title: "Success",
            description: "Session deleted successfully",
            variant: "default",
          });
        },
        onError: (error: Error) => {
          try {
            const err = JSON.parse(error.message);
            toast({
              title: err.error || "Error",
              description: err.message || "Failed to delete session",
              variant: "destructive",
            });
          } catch {
            toast({
              title: "Error",
              description: error.message || "Failed to delete session",
              variant: "destructive",
            });
          }
        },
      });
    },
    [deleteSessionMutation, queryClient, toast, courseId]
  );

  // Handle status change
  const handleStatusChange = useCallback(
    (sessionId: string, status: string) => {
      updateSessionStatusMutation.mutate(
        {
          sessionId,
          status,
        },
        {
          onSuccess: () => {
            setIsStatusDialogOpen(false);
            queryClient.invalidateQueries({
              queryKey: ["course-sessions", courseId],
            });
            toast({
              title: "Success",
              description: "Session status updated successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to update session status",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description: error.message || "Failed to update session status",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [updateSessionStatusMutation, queryClient, toast, courseId]
  );

  // Form submission
  const onSubmit = useCallback(
    (data: SessionFormValues) => {
      if (selectedSession) {
        // Update existing session
        updateSessionMutation.mutate(
          {
            id: selectedSession._id,
            data: {
              name: data.name,
              startYear: data.startYear,
            },
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              setSelectedSession(null);
              queryClient.invalidateQueries({
                queryKey: ["course-sessions", courseId],
              });
              toast({
                title: "Success",
                description: "Session updated successfully",
                variant: "default",
              });
            },
            onError: (error: Error) => {
              try {
                const err = JSON.parse(error.message);
                toast({
                  title: err.error || "Error",
                  description: err.message || "Failed to update session",
                  variant: "destructive",
                });
              } catch {
                toast({
                  title: "Error",
                  description: error.message || "Failed to update session",
                  variant: "destructive",
                });
              }
            },
          }
        );
      } else {
        // Create new session
        createSessionMutation.mutate(
          {
            name: data.name,
            startYear: data.startYear,
            course: courseId || "",
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              queryClient.invalidateQueries({
                queryKey: ["course-sessions", courseId],
              });
              toast({
                title: "Success",
                description: "Session created successfully",
                variant: "default",
              });
            },
            onError: (error: Error) => {
              try {
                const err = JSON.parse(error.message);
                toast({
                  title: err.error || "Error",
                  description: err.message || "Failed to create session",
                  variant: "destructive",
                });
              } catch {
                toast({
                  title: "Error",
                  description: error.message || "Failed to create session",
                  variant: "destructive",
                });
              }
            },
          }
        );
      }
    },
    [
      selectedSession,
      createSessionMutation,
      updateSessionMutation,
      queryClient,
      toast,
      courseId,
    ]
  );

  const isSubmitting =
    createSessionMutation.isPending || updateSessionMutation.isPending;

  const handleBackToCourses = () => {
    navigate("/courses");
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToCourses}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>

            <div>
              <h1 className="text-2xl font-bold">
                {isLoadingCourse
                  ? "Loading..."
                  : `Sessions for ${courseData?.data?.name || "Course"}`}
              </h1>
              <p className="text-muted-foreground">
                Manage academic sessions for this course
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <ChangeSessionStatusDialog
              session={sessionForStatusChange}
              isOpen={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
              onStatusChange={handleStatusChange}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedSession(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSession ? "Edit Session" : "Add Session"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedSession
                      ? "Update the session details below"
                      : "Fill in the session details below"}
                  </DialogDescription>
                </DialogHeader>

                <SessionForm
                  form={sessionForm}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  isEditing={!!selectedSession}
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
                  Error loading sessions: {(error as Error).message}
                </div>
              ) : (
                <>
                  <SessionTable
                    sessions={sessions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChangeStatus={(session: Session) => {
                      setSessionForStatusChange(session);
                      setIsStatusDialogOpen(true);
                    }}
                  />

                  {/* Pagination */}
                  {sessions.length > 0 && (
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

export default CourseSessionsPage;
