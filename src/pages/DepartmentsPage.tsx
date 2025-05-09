import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Department,
  useAssignDepartmentHead,
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/services/departmentService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// UI Components
import DepartmentForm, {
  DepartmentFormValues,
  departmentSchema,
} from "@/components/department/DepartmentForm";
import DepartmentTable from "@/components/department/DepartmentTable";
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
import AssignHeadDialog from "@/components/department/AssignHeadDialog ";
import ChangeDepartmentStatusDialog from "@/components/department/ChangeDepartmentStatusDialog";
import { useUpdateDepartmentStatus } from "@/services/departmentService";

const DepartmentsPage = () => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const queryClient = useQueryClient();

  const [isAssignHeadDialogOpen, setIsAssignHeadDialogOpen] = useState(false);
  const [departmentForHeadAssignment, setDepartmentForHeadAssignment] =
    useState<Department | null>(null);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [departmentForStatusChange, setDepartmentForStatusChange] =
    useState<Department | null>(null);

  const assignHeadMutation = useAssignDepartmentHead();
  const updateDepartmentStatusMutation = useUpdateDepartmentStatus();

  const handleHeadAssignment = useCallback(
    (departmentId: string, facultyId: string) => {
      assignHeadMutation.mutate(
        { departmentId, facultyId },
        {
          onSuccess: () => {
            setIsAssignHeadDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            toast({
              title: "Success",
              description: "Department head assigned successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description: err.message || "Failed to assign department head",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description:
                  error.message || "Failed to assign department head",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [assignHeadMutation, queryClient, toast]
  );

  const handleStatusChange = useCallback(
    (departmentId: string, status: string) => {
      updateDepartmentStatusMutation.mutate(
        { departmentId, status },
        {
          onSuccess: () => {
            setIsStatusDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            toast({
              title: "Success",
              description: "Department status updated successfully",
              variant: "default",
            });
          },
          onError: (error: Error) => {
            try {
              const err = JSON.parse(error.message);
              toast({
                title: err.error || "Error",
                description:
                  err.message || "Failed to update department status",
                variant: "destructive",
              });
            } catch {
              toast({
                title: "Error",
                description:
                  error.message || "Failed to update department status",
                variant: "destructive",
              });
            }
          },
        }
      );
    },
    [updateDepartmentStatusMutation, queryClient, toast]
  );

  // Form setup
  const departmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "" },
  });

  // Reset form when selected department changes
  useEffect(() => {
    departmentForm.reset(
      selectedDepartment
        ? { name: selectedDepartment.name, code: selectedDepartment.code }
        : { name: "", code: "" }
    );
  }, [selectedDepartment, departmentForm]);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useDepartments(currentPage, departmentsPerPage);
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  // Extract data with safe fallbacks
  const { departments, pagination } = useMemo(
    () => ({
      departments: res?.data?.data || [],
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
      departments.length > 0 ? (currentPage - 1) * departmentsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * departmentsPerPage, totalItems);
    return { totalPages, totalItems, startItem, endItem };
  }, [pagination, currentPage, departmentsPerPage, departments.length]);

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

  // Handle department actions
  const handleEdit = useCallback((department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteDepartmentMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["departments"] });
          toast({
            title: "Success",
            description: "Department deleted successfully",
            variant: "default",
          });
        },
        onError: (error: Error) => {
          try {
            const err = JSON.parse(error.message);
            toast({
              title: err.error || "Error",
              description: err.message || "Failed to delete department",
              variant: "destructive",
            });
          } catch {
            toast({
              title: "Error",
              description: error.message || "Failed to delete department",
              variant: "destructive",
            });
          }
        },
      });
    },
    [deleteDepartmentMutation, queryClient, toast]
  );

  // Form submission
  const onSubmit = useCallback(
    (data: DepartmentFormValues) => {
      const isEditing = !!selectedDepartment;
      const mutation = isEditing
        ? updateDepartmentMutation.mutate({
            id: selectedDepartment._id,
            data: { name: data.name, code: data.code },
          })
        : createDepartmentMutation.mutate(data);

      const successHandler = () => {
        setIsDialogOpen(false);
        if (isEditing) setSelectedDepartment(null);
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        toast({
          title: "Success",
          description: `Department ${
            isEditing ? "updated" : "created"
          } successfully`,
          variant: "default",
        });
      };

      const errorHandler = (error: Error) => {
        try {
          const err = JSON.parse(error.message);
          toast({
            title: err.error || "Error",
            description:
              err.message ||
              `Failed to ${isEditing ? "update" : "create"} department`,
            variant: "destructive",
          });
        } catch {
          toast({
            title: "Error",
            description:
              error.message ||
              `Failed to ${isEditing ? "update" : "create"} department`,
            variant: "destructive",
          });
        }
      };

      if (isEditing) {
        updateDepartmentMutation.mutate(
          {
            id: selectedDepartment._id,
            data: { name: data.name, code: data.code },
          },
          { onSuccess: successHandler, onError: errorHandler }
        );
      } else {
        createDepartmentMutation.mutate(data, {
          onSuccess: successHandler,
          onError: errorHandler,
        });
      }
    },
    [
      selectedDepartment,
      createDepartmentMutation,
      updateDepartmentMutation,
      queryClient,
      toast,
    ]
  );

  const isSubmitting =
    createDepartmentMutation.isPending || updateDepartmentMutation.isPending;

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Department Management</h1>
              <p className="text-muted-foreground">
                Manage university departments and their details
              </p>
            </div>

            <AssignHeadDialog
              department={departmentForHeadAssignment}
              isOpen={isAssignHeadDialogOpen}
              onOpenChange={setIsAssignHeadDialogOpen}
              onAssign={handleHeadAssignment}
            />

            <ChangeDepartmentStatusDialog
              department={departmentForStatusChange}
              isOpen={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
              onStatusChange={handleStatusChange}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedDepartment(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedDepartment ? "Edit Department" : "Add Department"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedDepartment
                      ? "Update the department details below"
                      : "Fill in the department details below"}
                  </DialogDescription>
                </DialogHeader>

                <DepartmentForm
                  form={departmentForm}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  isEditing={!!selectedDepartment}
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
                  Error loading departments: {(error as Error).message}
                </div>
              ) : (
                <>
                  <DepartmentTable
                    departments={departments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAssignHead={(department: Department) => {
                      setDepartmentForHeadAssignment(department);
                      setIsAssignHeadDialogOpen(true);
                    }}
                    onChangeStatus={(department: Department) => {
                      setDepartmentForStatusChange(department);
                      setIsStatusDialogOpen(true);
                    }}
                  />

                  {/* Pagination */}
                  {departments.length > 0 && (
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

export default DepartmentsPage;
