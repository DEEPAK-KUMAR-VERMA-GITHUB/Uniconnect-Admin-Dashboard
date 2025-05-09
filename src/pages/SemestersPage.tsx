import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Semester,
  useDeleteSemester,
  useSemesters,
  useUpdateSemester,
  useUpdateSemesterStatus,
} from "@/services/semesterService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// UI Components
import SemesterForm, {
  SemesterFormValues,
  semesterSchema,
} from "@/components/semester/SemesterForm";
import SemesterTable from "@/components/semester/SemesterTable";
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
import ChangeSemesterStatusDialog from "@/components/semester/ChangeSemesterStatusDialog";
import { useLocation } from "wouter";

const SemestersPage = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [semestersPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );

  const queryClient = useQueryClient();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [semesterForStatusChange, setSemesterForStatusChange] =
    useState<Semester | null>(null);

  // Form setup
  const semesterForm = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      semesterName: "",
      semesterNumber: 1,
      startDate: "",
      endDate: "",
    },
  });

  // Reset form when selected semester changes
  useEffect(() => {
    if (selectedSemester) {
      // Format dates to YYYY-MM-DD for input[type="date"]
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      semesterForm.reset({
        semesterName: selectedSemester.semesterName,
        semesterNumber: selectedSemester.semesterNumber,
        startDate: formatDateForInput(selectedSemester.startDate),
        endDate: formatDateForInput(selectedSemester.endDate),
      });
    } else {
      semesterForm.reset({
        semesterName: "",
        semesterNumber: 1,
        startDate: "",
        endDate: "",
      });
    }
  }, [selectedSemester, semesterForm]);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useSemesters(currentPage, semestersPerPage);
  const updateSemesterMutation = useUpdateSemester();
  const deleteSemesterMutation = useDeleteSemester();
  const updateSemesterStatusMutation = useUpdateSemesterStatus();

  // Extract data with safe fallbacks
  const { semesters, pagination } = useMemo(
    () => ({
      semesters: res?.data?.data || [],
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
      semesters.length > 0 ? (currentPage - 1) * semestersPerPage + 1 : 0;
    const endItem = Math.min(currentPage * semestersPerPage, totalItems);
    return { totalPages, totalItems, startItem, endItem };
  }, [pagination, currentPage, semestersPerPage, semesters.length]);

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

  // Handle semester actions
  const handleEdit = useCallback((semester: Semester) => {
    setSelectedSemester(semester);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSemesterMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["semesters"] });
          toast({
            title: "Success",
            description: "Semester deleted successfully",
            variant: "default",
          });
        },
        onError: (error: Error) => {
          try {
            const err = JSON.parse(error.message);
            toast({
              title: err.error || "Error",
              description: err.message || "Failed to delete semester",
              variant: "destructive",
            });
          } catch {
            toast({
              title: "Error",
              description: error.message || "Failed to delete semester",
              variant: "destructive",
            });
          }
        },
      });
    },
    [deleteSemesterMutation, queryClient, toast]
  );

  // Handle status change
  const handleStatusChange = useCallback(
    (semesterId: string, status: string) => {
      updateSemesterStatusMutation.mutate(
        {
          semesterId,
          status,
        },
        {
          onSuccess: () => {
            setIsStatusDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["semesters"] });
            toast({
              title: "Success",
              description: "Semester status updated successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to update semester status",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description:
                  error.message || "Failed to update semester status",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [updateSemesterStatusMutation, queryClient, toast]
  );

  // Navigate to sessions page to create a semester
  const handleAddSemester = () => {
    toast({
      title: "Info",
      description: "Please select a session first to create a semester",
      variant: "default",
    });
    navigate("/sessions");
  };

  // Form submission for editing only
  const onSubmit = useCallback(
    (data: SemesterFormValues) => {
      if (selectedSemester) {
        // Update existing semester
        updateSemesterMutation.mutate(
          {
            id: selectedSemester._id,
            data: {
              name: data.semesterName,
              number: data.semesterNumber,
              startDate: data.startDate,
              endDate: data.endDate,
            },
          },
          {
            onSuccess: () => {
              setIsDialogOpen(false);
              setSelectedSemester(null);
              queryClient.invalidateQueries({ queryKey: ["semesters"] });
              toast({
                title: "Success",
                description: "Semester updated successfully",
                variant: "default",
              });
            },
            onError: (error: Error) => {
              try {
                const err = JSON.parse(error.message);
                toast({
                  title: err.error || "Error",
                  description: err.message || "Failed to update semester",
                  variant: "destructive",
                });
              } catch {
                toast({
                  title: "Error",
                  description: error.message || "Failed to update semester",
                  variant: "destructive",
                });
              }
            },
          }
        );
      }
    },
    [selectedSemester, updateSemesterMutation, queryClient, toast]
  );

  const isSubmitting = updateSemesterMutation.isPending;

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Semester Management</h1>
              <p className="text-muted-foreground">
                Manage academic semesters across all sessions
              </p>
            </div>

            <ChangeSemesterStatusDialog
              semester={semesterForStatusChange}
              isOpen={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
              onStatusChange={handleStatusChange}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddSemester}>
                  <Plus className="mr-2 h-4 w-4" /> Add Semester
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSemester ? "Edit Semester" : "Add Semester"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedSemester
                      ? "Update the semester details below"
                      : "Fill in the semester details below"}
                  </DialogDescription>
                </DialogHeader>

                <SemesterForm
                  form={semesterForm}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  isEditing={!!selectedSemester}
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
                  Error loading semesters: {(error as Error).message}
                </div>
              ) : (
                <>
                  <SemesterTable
                    semesters={semesters}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onChangeStatus={(semester: Semester) => {
                      setSemesterForStatusChange(semester);
                      setIsStatusDialogOpen(true);
                    }}
                  />

                  {/* Pagination */}
                  {semesters.length > 0 && (
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

export default SemestersPage;
