import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Define subject type
export interface Subject {
  _id: string;
  name: string;
  code: string;
  credits: number;
  status: string;
  metadata: {
    isElective: boolean;
    hasLab: boolean;
    isOnline: boolean;
  };
  faculty: string;
  semester: string;
  resources: string[];
  assignments: string[];
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

// API service for subjects
export const fetchSubjectsBySemester = async (
  semesterId: string
): Promise<PaginatedResponse> => {
  const response = await apiRequest("GET", `/subjects/semester/${semesterId}`);
  return await response.json();
};

export const fetchSubject = async (id: string): Promise<{ data: Subject }> => {
  const response = await apiRequest("GET", `/subjects/${id}`);
  return await response.json();
};

export const createSubject = async (subjectData: {
  semesterId: string;
  data: {
    name: string;
    code: string;
    credits: number;
    metadata: {
      isElective: boolean;
      hasLab: boolean;
      isOnline: boolean;
    };
  };
}): Promise<Subject> => {
  const response = await apiRequest(
    "POST",
    `/subjects/semester/${subjectData.semesterId}/create-subject`,
    subjectData.data
  );
  return await response.json();
};

export const updateSubject = async (
  id: string,
  subjectData: {
    name?: string;
    code?: string;
    credits?: number;
    metadata?: {
      isElective?: boolean;
      hasLab?: boolean;
      isOnline?: boolean;
    };
  }
): Promise<Subject> => {
  const response = await apiRequest(
    "PUT",
    `/subjects/update/${id}`,
    subjectData
  );
  return await response.json();
};

export const deleteSubject = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/subjects/delete/${id}`);
};

export const updateSubjectStatus = async (
  id: string,
  status: string
): Promise<Subject> => {
  const response = await apiRequest("PUT", `/subjects/change-status/${id}`, {
    status,
  });
  return await response.json();
};

// Custom hooks for subject operations
export const useSubjectsBySemester = (semesterId: string) => {
  return useQuery({
    queryKey: ["semester-subjects", semesterId],
    queryFn: () => fetchSubjectsBySemester(semesterId),
    enabled: !!semesterId,
  });
};

export const useSubject = (id: string) => {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: () => fetchSubject(id),
    enabled: !!id,
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

// Faculty assignment
export const assignFaculty = async (
  subjectId: string,
  facultyId: string
): Promise<Subject> => {
  const response = await apiRequest(
    "PUT",
    `/subjects/${subjectId}/assign-faculty`,
    { facultyId }
  );
  return await response.json();
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

// Resource management
export const addResource = async (
  subjectId: string,
  resourceData: {
    title: string;
    type: string;
    file: File;
    year?: string;
  }
): Promise<any> => {
  const formData = new FormData();
  formData.append("title", resourceData.title);
  formData.append("type", resourceData.type);
  formData.append("file", resourceData.file);
  if (resourceData.year) {
    formData.append("year", resourceData.year);
  }

  const response = await apiRequest(
    "POST",
    `/subjects/${subjectId}/add-resource`,
    formData
  );
  return await response.json();
};

export const useAddResource = () => {
  return useMutation({
    mutationFn: ({ subjectId, data }: { subjectId: string; data: any }) =>
      addResource(subjectId, data),
  });
};

export const removeResource = async (
  subjectId: string,
  resourceId: string
): Promise<void> => {
  await apiRequest("DELETE", `/subjects/${subjectId}/remove-resource`, {
    resourceId,
  });
};

export const useRemoveResource = () => {
  return useMutation({
    mutationFn: ({
      subjectId,
      resourceId,
    }: {
      subjectId: string;
      resourceId: string;
    }) => removeResource(subjectId, resourceId),
  });
};

// Assignment management
export const addAssignment = async (
  subjectId: string,
  assignmentData: {
    title: string;
    dueDate: string;
    file: File;
  }
): Promise<any> => {
  const formData = new FormData();
  formData.append("title", assignmentData.title);
  formData.append("dueDate", assignmentData.dueDate);
  formData.append("file", assignmentData.file);

  const response = await apiRequest(
    "POST",
    `/subjects/${subjectId}/add-assignment`,
    formData
  );
  return await response.json();
};

export const useAddAssignment = () => {
  return useMutation({
    mutationFn: ({ subjectId, data }: { subjectId: string; data: any }) =>
      addAssignment(subjectId, data),
  });
};

export const removeAssignment = async (
  subjectId: string,
  assignmentId: string
): Promise<void> => {
  await apiRequest("DELETE", `/subjects/${subjectId}/remove-assignment`, {
    assignmentId,
  });
};

export const useRemoveAssignment = () => {
  return useMutation({
    mutationFn: ({
      subjectId,
      assignmentId,
    }: {
      subjectId: string;
      assignmentId: string;
    }) => removeAssignment(subjectId, assignmentId),
  });
};

// Get subject resources and assignments
export const getSubjectResources = async (subjectId: string): Promise<any> => {
  const response = await apiRequest("GET", `/subjects/${subjectId}/resources`);
  return await response.json();
};

export const useSubjectResources = (subjectId: string) => {
  return useQuery({
    queryKey: ["subject-resources", subjectId],
    queryFn: () => getSubjectResources(subjectId),
    enabled: !!subjectId,
  });
};
