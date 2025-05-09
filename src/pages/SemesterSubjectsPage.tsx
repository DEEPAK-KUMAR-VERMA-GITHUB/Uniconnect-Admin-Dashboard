// src/pages/SemesterSubjectsPage.tsx
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useParams } from "wouter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowLeft, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Services
import { useSemester } from "@/services/semesterService";
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjectsBySemester,
  useUpdateSubject,
  useUpdateSubjectStatus,
  useAssignFaculty,
  Subject,
} from "@/services/subjectService";
import { useFacultyByDepartment } from "@/services/facultyService";

// Components
import SubjectTable from "@/components/subject/SubjectTable";
import SubjectForm, {
  SubjectFormValues,
  subjectSchema,
} from "@/components/subject/SubjectForm";
import PaginationControls from "@/components/department/PaginationControls";
import ChangeSubjectStatusDialog from "@/components/subject/ChangeSubjectStatusDialog";
import AssignFacultyDialog from "@/components/semester/AssignFacultyDialog";

const SemesterSubjectsPage = () => {
  const { semesterId } = useParams();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectsPerPage] = useState(5);

  // Dialog states
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAssignFacultyDialogOpen, setIsAssignFacultyDialogOpen] =
    useState(false);

  // Selected items
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectForStatusChange, setSubjectForStatusChange] = useState(null);
  const [subjectForFacultyAssignment, setSubjectForFacultyAssignment] =
    useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("all");

  const queryClient = useQueryClient();

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
  const assignFacultyMutation = useAssignFaculty();

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

  // Filter subjects based on active tab
  const filteredSubjects = useMemo(() => {
    if (activeTab === "all") return subjects;
    if (activeTab === "core")
      return subjects.filter((s) => !s.metadata?.isElective);
    if (activeTab === "elective")
      return subjects.filter((s) => s.metadata?.isElective);
    if (activeTab === "lab") return subjects.filter((s) => s.metadata?.hasLab);
    if (activeTab === "online")
      return subjects.filter((s) => s.metadata?.isOnline);
    return subjects;
  }, [subjects, activeTab]);

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
    setIsSubjectDialogOpen(true);
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
            setSubjectForStatusChange(null);
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

  // Handle faculty assignment
  const handleAssignFaculty = useCallback(
    (subjectId: string, facultyId: string) => {
      assignFacultyMutation.mutate(
        {
          subjectId,
          facultyId,
        },
        {
          onSuccess: () => {
            setIsAssignFacultyDialogOpen(false);
            setSubjectForFacultyAssignment(null);
            queryClient.invalidateQueries({
              queryKey: ["semester-subjects", semesterId],
            });
            toast({
              title: "Success",
              description: "Faculty assigned successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to assign faculty",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description: error.message || "Failed to assign faculty",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [assignFacultyMutation, queryClient, toast, semesterId]
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
              setIsSubjectDialogOpen(false);
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
              setIsSubjectDialogOpen(false);
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

  // Get semester name and session name
  const semesterName = semesterData?.data?.semesterName || "Semester";
  const sessionName = semesterData?.data?.session?.name || "Session";

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
                {semesterName} - {sessionName}
              </h1>
              <p className="text-muted-foreground">
                Manage subjects for this semester
              </p>
            </div>
          </div>

          {/* Subject Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Core Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subjects.filter((s) => !s.metadata?.isElective).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Elective Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subjects.filter((s) => s.metadata?.isElective).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Lab Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subjects.filter((s) => s.metadata?.hasLab).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="all">All Subjects</TabsTrigger>
                <TabsTrigger value="core">Core</TabsTrigger>
                <TabsTrigger value="elective">Elective</TabsTrigger>
                <TabsTrigger value="lab">Lab</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              onClick={() => {
                setSelectedSubject(null);
                setIsSubjectDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Subject
            </Button>
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
                    subjects={filteredSubjects}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChangeStatus={(subject) => {
                      setSubjectForStatusChange(subject);
                      setIsStatusDialogOpen(true);
                    }}
                    onAssignFaculty={(subject) => {
                      setSubjectForFacultyAssignment(subject);
                      setIsAssignFacultyDialogOpen(true);
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

      {/* Subject Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
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

      {/* Status Change Dialog */}
      <ChangeSubjectStatusDialog
        subject={subjectForStatusChange}
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onStatusChange={handleStatusChange}
      />

      {/* Assign Faculty Dialog */}
      <AssignFacultyDialog
        subject={subjectForFacultyAssignment}
        isOpen={isAssignFacultyDialogOpen}
        onOpenChange={setIsAssignFacultyDialogOpen}
        onAssignFaculty={handleAssignFaculty}
        semesterId={semesterId || ""}
      />
    </div>
  );
};

export default SemesterSubjectsPage;
