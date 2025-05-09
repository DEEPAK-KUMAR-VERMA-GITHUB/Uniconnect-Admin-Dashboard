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

// Services
import { useSemester } from "@/services/semesterService";
import {
  Subject,
  useCreateSubject,
  useDeleteSubject,
  useSubjectsBySemester,
  useUpdateSubject,
  useUpdateSubjectStatus,
} from "@/services/subjectService";
import SubjectTable from "@/components/subject/SubjectTable";
import SubjectForm, {
  SubjectFormValues,
  subjectSchema,
} from "@/components/subject/SubjectForm";
import PaginationControls from "@/components/department/PaginationControls";
import ChangeSubjectStatusDialog from "@/components/subject/ChangeSubjectStatusDialog";

const SubjectPage = () => {
  const { semesterId } = useParams();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const queryClient = useQueryClient();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [subjectForStatusChange, setSubjectForStatusChange] = useState(null);

  // Get semester details
  const { data: semesterData, isLoading: isLoadingSemester } = useSemester(
    semesterId || ""
  );

  // Form setup
  const subjectForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      credits: 3,
      isElective: false,
      hasLab: false,
      isOnline: false,
    },
  });

  // Reset form when selected subject changes
  useEffect(() => {
    if (selectedSubject) {
      subjectForm.reset({
        name: selectedSubject.name,
        code: selectedSubject.code,
        credits: selectedSubject.credits,
        isElective: selectedSubject.metadata?.isElective || false,
        hasLab: selectedSubject.metadata?.hasLab || false,
        isOnline: selectedSubject.metadata?.isOnline || false,
      });
    } else {
      subjectForm.reset({
        name: "",
        code: "",
        credits: 3,
        isElective: false,
        hasLab: false,
        isOnline: false,
      });
    }
  }, [selectedSubject, subjectForm]);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useSubjectsBySemester(semesterId || "");

  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();
  const updateSubjectStatusMutation = useUpdateSubjectStatus();

  // Extract data with safe fallbacks
  const { subjects, pagination } = useMemo(
    () => ({
      subjects: res?.data?.data || [],
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
      subjects.length > 0 ? (currentPage - 1) * subjectsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * subjectsPerPage, totalItems);
    return { totalPages, totalItems, startItem, endItem };
  }, [pagination, currentPage, subjectsPerPage, subjects.length]);

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

  // Handle subject actions
  const handleEdit = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSubjectMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["semester-subjects", semesterId],
          });
          toast({
            title: "Success",
            description: "Subject deleted successfully",
            variant: "default",
          });
        },
        onError: (error: Error) => {
          try {
            const err = JSON.parse(error.message);
            toast({
              title: err.error || "Error",
              description: err.message || "Failed to delete subject",
              variant: "destructive",
            });
          } catch {
            toast({
              title: "Error",
              description: error.message || "Failed to delete subject",
              variant: "destructive",
            });
          }
        },
      });
    },
    [deleteSubjectMutation, queryClient, toast, semesterId]
  );

  // Handle status change
  const handleStatusChange = useCallback(
    (subjectId: string, status: string) => {
      updateSubjectStatusMutation.mutate(
        {
          subjectId,
          status,
        },
        {
          onSuccess: () => {
            setIsStatusDialogOpen(false);
            queryClient.invalidateQueries({
              queryKey: ["semester-subjects", semesterId],
            });
            toast({
              title: "Success",
              description: "Subject status updated successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to update subject status",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description: error.message || "Failed to update subject status",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [updateSubjectStatusMutation, queryClient, toast, semesterId]
  );

  // Form submission
  const onSubmit = useCallback(
    (data: SubjectFormValues) => {
      if (selectedSubject) {
        // Update existing subject
        updateSubjectMutation.mutate(
          {
            id: selectedSubject._id,
            data: {
              name: data.name,
              code: data.code,
              credits: data.credits,
              metadata: {
                isElective: data.isElective,
                hasLab: data.hasLab,
                isOnline: data.isOnline,
              },
            },
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              setSelectedSubject(null);
              queryClient.invalidateQueries({
                queryKey: ["semester-subjects", semesterId],
              });
              toast({
                title: "Success",
                description: "Subject updated successfully",
                variant: "default",
              });
            },
            onError: (error: Error) => {
              try {
                const err = JSON.parse(error.message);
                toast({
                  title: err.error || "Error",
                  description: err.message || "Failed to update subject",
                  variant: "destructive",
                });
              } catch {
                toast({
                  title: "Error",
                  description: error.message || "Failed to update subject",
                  variant: "destructive",
                });
              }
            },
          }
        );
      } else {
        // Create new subject for this semester
        createSubjectMutation.mutate(
          {
            semesterId: semesterId || "",
            data: {
              name: data.name,
              code: data.code,
              credits: data.credits,
              metadata: {
                isElective: data.isElective,
                hasLab: data.hasLab,
                isOnline: data.isOnline,
              },
            },
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              queryClient.invalidateQueries({
                queryKey: ["semester-subjects", semesterId],
              });
              toast({
                title: "Success",
                description: "Subject created successfully",
                variant: "default",
              });
              subjectForm.reset();
            },
            onError: (error: Error) => {
              try {
                const err = JSON.parse(error.message);
                toast({
                  title: err.error || "Error",
                  description: err.message || "Failed to create subject",
                  variant: "destructive",
                });
              } catch {
                toast({
                  title: "Error",
                  description: error.message || "Failed to create subject",
                  variant: "destructive",
                });
              }
            },
          }
        );
      }
    },
    [
      selectedSubject,
      updateSubjectMutation,
      createSubjectMutation,
      queryClient,
      toast,
      semesterId,
      subjectForm,
    ]
  );

  // Handle opening status change dialog
  const handleOpenStatusDialog = useCallback((subject) => {
    setSubjectForStatusChange(subject);
    setIsStatusDialogOpen(true);
  }, []);

  const handleBackToSemesters = () => {
    navigate("/semesters");
  };

  const isSubmitting =
    createSubjectMutation.isPending || updateSubjectMutation.isPending;

  if (isLoadingSemester) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading semester details...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToSemesters}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Semesters
            </Button>

            <div>
              <h1 className="text-2xl font-bold">
                {semesterData?.data?.semesterName || "Subjects"}
              </h1>
              <p className="text-muted-foreground">
                Manage subjects for this semester
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <ChangeSubjectStatusDialog
              isOpen={isStatusDialogOpen}
              onClose={() => setIsStatusDialogOpen(false)}
              subject={subjectForStatusChange}
              onStatusChange={handleStatusChange}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedSubject(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSubject ? "Edit Subject" : "Add Subject"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedSubject
                      ? "Update the subject details below"
                      : "Fill in the subject details below"}
                  </DialogDescription>
                </DialogHeader>

                <SubjectForm
                  form={subjectForm}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  isEditing={!!selectedSubject}
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
                  Error loading subjects: {(error as Error).message}
                </div>
              ) : (
                <>
                  <SubjectTable
                    subjects={subjects}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChangeStatus={handleOpenStatusDialog}
                  />

                  {/* Pagination */}
                  {subjects.length > 0 && (
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

export default SubjectPage;
