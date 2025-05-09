import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Define session type
export interface Session {
  _id: string;
  name: string;
  startYear: string;
  endYear: string;
  course: {
    _id: string;
    name: string;
    code: string;
  };
  status: string;
  currentSemester: number;
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
    data: Session[];
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

export const fetchSession = async (id: string): Promise<{ data: Session }> => {
  const response = await apiRequest("GET", `/sessions/get-session/${id}`);
  return await response.json();
};

export const fetchCourseSessionsById = async (
  courseId: string
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/sessions/get-sessions/${courseId}`
  );
  return await response.json();
};

export const createCourseSession = async (sessionData: {
  name: string;
  startYear: string;
  course: string;
}): Promise<Session> => {
  const response = await apiRequest("POST", "/sessions/create", sessionData);
  return await response.json();
};

export const updateCourseSession = async (
  id: string,
  sessionData: {
    name?: string;
    startYear?: string;
    endYear?: string;
    status?: string;
  }
): Promise<Session> => {
  const response = await apiRequest(
    "PUT",
    `/sessions/update/${id}`,
    sessionData
  );
  return await response.json();
};

export const deleteCourseSession = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/sessions/delete/${id}`);
};

export const updateCourseSessionStatus = async (
  id: string,
  status: string
): Promise<Session> => {
  const response = await apiRequest(
    "PATCH",
    `/sessions/toggle-session-status/${id}`,
    { status }
  );
  return await response.json();
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => fetchSession(id),
    enabled: !!id,
  });
};

export const useCourseSessionsById = (courseId: string) => {
  return useQuery({
    queryKey: ["course-sessions", courseId],
    queryFn: () => fetchCourseSessionsById(courseId),
    enabled: !!courseId,
  });
};

export const useCreateCourseSession = () => {
  return useMutation({
    mutationFn: createCourseSession,
  });
};

export const useUpdateCourseSession = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCourseSession(id, data),
  });
};

export const useDeleteCourseSession = () => {
  return useMutation({
    mutationFn: deleteCourseSession,
  });
};

export const useUpdateCourseSessionStatus = () => {
  return useMutation({
    mutationFn: ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: string;
    }) => updateCourseSessionStatus(sessionId, status),
  });
};
