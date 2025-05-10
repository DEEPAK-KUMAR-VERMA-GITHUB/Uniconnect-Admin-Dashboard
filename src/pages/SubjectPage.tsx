// src/pages/SubjectPage.tsx
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

// UI Components
import SubjectForm, {
  SubjectFormValues,
  subjectSchema,
} from "@/components/subject/SubjectForm";
import SubjectTable from "@/components/subject/SubjectTable";
import PaginationControls from "@/components/department/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/context/ToastContext";
import ChangeSubjectStatusDialog from "@/components/subject/ChangeSubjectStatusDialog";

// Services
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjects,
  useUpdateSubject,
  useUpdateSubjectStatus,
} from "@/services/subjectService";

const SubjectPage = () => {
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const queryClient = useQueryClient();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [subjectForStatusChange, setSubjectForStatusChange] = useState(null);

  // Form setup
  const subjectForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      department: "",
      course: "",
      credits: 3,
      isElective: false,
      hasLab: false,
      isOnline: false,
      status: "ACTIVE",
    },
  });

  // Reset form when selected subject changes
  useEffect(() => {
    if (selectedSubject) {
      subjectForm.reset({
        name: selectedSubject.name,
        code: selectedSubject.code,
        department: selectedSubject.department._id,
        course: selectedSubject.course._id,
        credits: selectedSubject.credits,
        isElective: selectedSubject.metadata?.isElective || false,
        hasLab: selectedSubject.metadata?.hasLab || false,
        isOnline: selectedSubject.metadata?.isOnline || false,
        status: selectedSubject.status,
      });
    } else {
      subjectForm.reset({
        name: "",
        code: "",
        department: "",
        course: "",
        credits: 3,
        isElective: false,
        hasLab: false,
        isOnline: false,
        status: "ACTIVE",
      });
    }
  }, [selectedSubject, subjectForm]);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useSubjects(currentPage, subjectsPerPage);

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
  const handleEdit = useCallback((subject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSubjectMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["subjects"] });
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
    [deleteSubjectMutation, queryClient, toast]
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
            setSubjectForStatusChange(null);
            queryClient.invalidateQueries({
              queryKey: ["subjects"],
              refetchType: "all",
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
    [updateSubjectStatusMutation, queryClient, toast]
  );

  // Form submission
  const onSubmit = useCallback(
    (data: SubjectFormValues) => {
      const subjectData = {
        name: data.name,
        code: data.code,
        department: data.department,
        course: data.course,
        credits: data.credits,
        metadata: {
          isElective: data.isElective,
          hasLab: data.hasLab,
          isOnline: data.isOnline,
        },
        status: data.status,
      };

      if (selectedSubject) {
        // Update existing subject
        updateSubjectMutation.mutate(
          {
            id: selectedSubject._id,
            data: subjectData,
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              setSelectedSubject(null);
              queryClient.invalidateQueries({ queryKey: ["subjects"] });
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
        // Create new subject
        createSubjectMutation.mutate(subjectData, {
          onSuccess: () => {
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
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
        });
      }
    },
    [
      selectedSubject,
      createSubjectMutation,
      updateSubjectMutation,
      queryClient,
      toast,
      subjectForm,
    ]
  );

  const isSubmitting =
    createSubjectMutation.isPending || updateSubjectMutation.isPending;

  // Handle adding a new subject
  const handleAddSubject = () => {
    setSelectedSubject(null);
    subjectForm.reset({
      name: "",
      code: "",
      department: "",
      course: "",
      credits: 3,
      isElective: false,
      hasLab: false,
      isOnline: false,
      status: "ACTIVE",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Subject Management</h1>
              <p className="text-muted-foreground">
                Manage subjects across departments and courses
              </p>
            </div>

            <ChangeSubjectStatusDialog
              subject={subjectForStatusChange}
              isOpen={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
              onStatusChange={handleStatusChange}
            />

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  // Clean up when dialog closes
                  setTimeout(() => {
                    if (!open) setSelectedSubject(null);
                  }, 300);
                }
                setIsDialogOpen(open);
              }}
            >
              <Button onClick={handleAddSubject}>
                <Plus className="mr-2 h-4 w-4" /> Add Subject
              </Button>
              <DialogContent className="sm:max-w-[600px]">
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
                  initialDepartmentId={selectedSubject?.department?._id}
                  initialCourseId={selectedSubject?.course?._id}
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
                    onChangeStatus={(subject) => {
                      setSubjectForStatusChange(subject);
                      setIsStatusDialogOpen(true);
                    }}
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
