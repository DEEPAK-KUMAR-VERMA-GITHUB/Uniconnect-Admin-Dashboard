import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Define department type
export interface Department {
  _id: string;
  name: string;
  code: string;
  head: {
    _id: string;
    fullName: string;
    email: string;
  };
  courses: {
    _id: string;
    name: string;
    code: string;
    duration: number;
  }[];
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Define pagination response type
export interface PaginatedResponse {
  success: boolean;
  message: string;
  data: {
    data: Department[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  statusCode: number;
  timestamp: string;
}

// API service for departments
export const fetchDepartment = async (id: string): Promise<Department> => {
  const response = await apiRequest("GET", `/departments/${id}`);
  return await response.json();
};

export const fetchDepartments = async (
  page: number,
  limit: number
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/departments?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const createDepartment = async (departmentData: {
  name: string;
  code: string;
}): Promise<Department> => {
  const response = await apiRequest(
    "POST",
    "/departments/create-department",
    departmentData
  );
  return await response.json();
};

export const updateDepartment = async (
  id: string,
  departmentData: {
    name?: string;
    code?: string;
    status?: string;
  }
): Promise<Department> => {
  const response = await apiRequest(
    "PUT",
    `/departments/${id}`,
    departmentData
  );
  return await response.json();
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/departments/${id}`);
};

export const assignDepartmentHead = async (
  departmentId: string,
  facultyId: string
): Promise<Department> => {
  const response = await apiRequest(
    "PUT",
    `/departments/${departmentId}/assign-head`,
    { head: facultyId }
  );
  return await response.json();
};

export const updateDepartmentStatus = async (
  id: string,
  status: string
): Promise<Department> => {
  const response = await apiRequest("PUT", `/departments/${id}`, { status });
  return await response.json();
};

// Custom hooks for department operations
export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => fetchDepartment(id),
    enabled: !!id,
  });
};

export const useDepartments = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["departments", page, limit],
    queryFn: () => fetchDepartments(page, limit),
  });
};

export const useCreateDepartment = () => {
  return useMutation({
    mutationFn: createDepartment,
  });
};

export const useUpdateDepartment = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateDepartment(id, data),
  });
};

export const useDeleteDepartment = () => {
  return useMutation({
    mutationFn: deleteDepartment,
  });
};

export const useAssignDepartmentHead = () => {
  return useMutation({
    mutationFn: ({
      departmentId,
      facultyId,
    }: {
      departmentId: string;
      facultyId: string;
    }) => assignDepartmentHead(departmentId, facultyId),
  });
};

export const useUpdateDepartmentStatus = () => {
  return useMutation({
    mutationFn: ({
      departmentId,
      status,
    }: {
      departmentId: string;
      status: string;
    }) => updateDepartmentStatus(departmentId, status),
  });
};
