import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Define semester type
export interface Semester {
  _id: string;
  semesterName: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  session: {
    _id: string;
    name: string;
  };
  status: string;
  subjects: any[];
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
  createdAt: string;
  updatedAt: string;
}

// Define pagination response type
export interface PaginatedResponse {
  success: boolean;
  message: string;
  data: {
    data: Semester[];
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

// API service for semesters
export const fetchSemesters = async (
  page: number,
  limit: number
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/semesters?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const fetchSessionSemesters = async (
  sessionId: string
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/semesters/get-all-semesters/${sessionId}`
  );
  return await response.json();
};

export const fetchSemester = async (
  id: string
): Promise<{ data: Semester }> => {
  const response = await apiRequest("GET", `/semesters/${id}`);
  return await response.json();
};

export const createSemester = async (semesterData: {
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  session: string;
}): Promise<Semester> => {
  const response = await apiRequest("POST", "/semesters/create", semesterData);
  return await response.json();
};

export const createSessionSemester = async (
  sessionId: string,
  semesterData: {
    name: string;
    number: number;
    startDate: string;
    endDate: string;
  }
): Promise<Semester> => {
  const response = await apiRequest(
    "POST",
    `/semesters/${sessionId}/create-semester`,
    semesterData
  );
  return await response.json();
};

export const updateSemester = async (
  id: string,
  semesterData: {
    name?: string;
    number?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Promise<Semester> => {
  const response = await apiRequest(
    "PUT",
    `/semesters/update/${id}`,
    semesterData
  );
  return await response.json();
};

export const deleteSemester = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/semesters/delete-semester/${id}`);
};

export const updateSemesterStatus = async (
  id: string,
  status: string
): Promise<Semester> => {
  const response = await apiRequest("PUT", `/semesters/toggle-status/${id}`, {
    status,
  });
  return await response.json();
};

// Custom hooks for semester operations
export const useSemesters = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["semesters", page, limit],
    queryFn: () => fetchSemesters(page, limit),
  });
};

export const useSessionSemesters = (sessionId: string) => {
  return useQuery({
    queryKey: ["session-semesters", sessionId],
    queryFn: () => fetchSessionSemesters(sessionId),
    enabled: !!sessionId,
  });
};

export const useSemester = (id: string) => {
  return useQuery({
    queryKey: ["semester", id],
    queryFn: () => fetchSemester(id),
    enabled: !!id,
  });
};

export const useCreateSemester = () => {
  return useMutation({
    mutationFn: createSemester,
  });
};

export const useCreateSessionSemester = () => {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) =>
      createSessionSemester(sessionId, data),
  });
};

export const useUpdateSemester = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSemester(id, data),
  });
};

export const useDeleteSemester = () => {
  return useMutation({
    mutationFn: deleteSemester,
  });
};

export const useUpdateSemesterStatus = () => {
  return useMutation({
    mutationFn: ({
      semesterId,
      status,
    }: {
      semesterId: string;
      status: string;
    }) => updateSemesterStatus(semesterId, status),
  });
};
