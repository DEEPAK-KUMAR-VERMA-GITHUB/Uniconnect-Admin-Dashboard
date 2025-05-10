import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Define subject type
export interface Subject {
  _id: string;
  name: string;
  code: string;
  department: {
    _id: string;
    name: string;
  };
  course: {
    _id: string;
    name: string;
    code: string;
  };
  faculty?: {
    _id: string;
    fullName: string;
    email: string;
  };
  credits: number;
  metadata: {
    isElective: boolean;
    hasLab: boolean;
    isOnline: boolean;
  };
  status: string;
  createdBy: {
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
    data: Subject[];
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

export const fetchSubjects = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/subjects?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const fetchSubject = async (id: string): Promise<{ data: Subject }> => {
  const response = await apiRequest("GET", `/subjects/${id}`);
  return await response.json();
};

export const fetchSubjectsBySemester = async (
  semesterId: string
): Promise<PaginatedResponse> => {
  const response = await apiRequest("GET", `/semesters/get-all-subjects/${semesterId}`);
  return await response.json();
};

export const fetchAvailableSubjects = async (
  departmentId: string,
  courseId: string,
  semesterId: string
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/subjects/available?departmentId=${departmentId}&courseId=${courseId}&semesterId=${semesterId}`
  );
  return await response.json();
};

export const createSubject = async (subjectData: any): Promise<Subject> => {
  const response = await apiRequest("POST", "/subjects/create", subjectData);
  return await response.json();
};

export const updateSubject = async (
  id: string,
  subjectData: any
): Promise<Subject> => {
  const response = await apiRequest("PUT", `/subjects/${id}`, subjectData);
  return await response.json();
};

export const deleteSubject = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/subjects/${id}`);
};

export const updateSubjectStatus = async (
  id: string,
  status: string
): Promise<Subject> => {
  const response = await apiRequest("PATCH", `/subjects/${id}/status`, {
    status,
  });
  return await response.json();
};

export const assignFaculty = async (
  subjectId: string,
  facultyId: string
): Promise<Subject> => {
  const response = await apiRequest(
    "PATCH",
    `/subjects/${subjectId}/assign-faculty`,
    { facultyId }
  );
  return await response.json();
};

export const addSubjectsToSemester = async (
  semesterId: string,
  subjectIds: string[]
): Promise<any> => {
  const response = await apiRequest(
    "POST",
    `/semesters/${semesterId}/add-subjects`,
    { subjectIds }
  );
  return await response.json();
};

// React Query hooks
export const useSubjects = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["subjects", page, limit],
    queryFn: () => fetchSubjects(page, limit),
  });
};

export const useSubject = (id: string) => {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: () => fetchSubject(id),
    enabled: !!id,
  });
};

export const useSubjectsBySemester = (semesterId: string) => {
  return useQuery({
    queryKey: ["semester-subjects", semesterId],
    queryFn: () => fetchSubjectsBySemester(semesterId),
    enabled: !!semesterId,
  });
};

export const useAvailableSubjects = (
  departmentId: string,
  courseId: string,
  semesterId: string
) => {
  return useQuery({
    queryKey: ["available-subjects", departmentId, courseId, semesterId],
    queryFn: () => fetchAvailableSubjects(departmentId, courseId, semesterId),
    enabled: !!(departmentId && courseId && semesterId),
  });
};

export const useCreateSubject = () => {
  return useMutation({
    mutationFn: createSubject,
  });
};

export const useUpdateSubject = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSubject(id, data),
  });
};

export const useDeleteSubject = () => {
  return useMutation({
    mutationFn: deleteSubject,
  });
};

export const useUpdateSubjectStatus = () => {
  return useMutation({
    mutationFn: ({
      subjectId,
      status,
    }: {
      subjectId: string;
      status: string;
    }) => updateSubjectStatus(subjectId, status),
  });
};

export const useAssignFaculty = () => {
  return useMutation({
    mutationFn: ({
      subjectId,
      facultyId,
    }: {
      subjectId: string;
      facultyId: string;
    }) => assignFaculty(subjectId, facultyId),
  });
};

export const useAddSubjectsToSemester = () => {
  return useMutation({
    mutationFn: ({
      semesterId,
      subjectIds,
    }: {
      semesterId: string;
      subjectIds: string[];
    }) => addSubjectsToSemester(semesterId, subjectIds),
  });
};
