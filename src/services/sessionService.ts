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

// API service for sessions
export const fetchSessions = async (
  page: number,
  limit: number
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/sessions?page=${page}&limit=${limit}`
  );
  return await response.json();
};

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

export const createSession = async (sessionData: {
  name: string;
  startYear: string;
  endDate: string;
}): Promise<Session> => {
  const response = await apiRequest(
    "POST",
    "/sessions/create-session",
    sessionData
  );
  return await response.json();
};

export const createCourseSession = async (sessionData: {
  name: string;
  startYear: string;
  endYear: string;
  course: string;
}): Promise<Session> => {
  const response = await apiRequest("POST", "/sessions/create", sessionData);
  return await response.json();
};

export const updateSession = async (
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
    `/sessions/update-session/${id}`,
    sessionData
  );
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

export const deleteSession = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/sessions/delete-session/${id}`);
};

export const deleteCourseSession = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/sessions/delete/${id}`);
};

export const updateSessionStatus = async (
  id: string,
  status: string
): Promise<Session> => {
  const response = await apiRequest("PUT", `/sessions/update-session/${id}`, {
    status,
  });
  return await response.json();
};

export const updateCourseSessionStatus = async (
  id: string,
  status: string
): Promise<Session> => {
  const response = await apiRequest(
    "PUT",
    `/sessions/toggle-session-status/${id}`,
    { status }
  );
  return await response.json();
};

// Custom hooks for session operations
export const useSessions = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["sessions", page, limit],
    queryFn: () => fetchSessions(page, limit),
  });
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

export const useCreateSession = () => {
  return useMutation({
    mutationFn: createSession,
  });
};

export const useCreateCourseSession = () => {
  return useMutation({
    mutationFn: createCourseSession,
  });
};

export const useUpdateSession = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSession(id, data),
  });
};

export const useUpdateCourseSession = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCourseSession(id, data),
  });
};

export const useDeleteSession = () => {
  return useMutation({
    mutationFn: deleteSession,
  });
};

export const useDeleteCourseSession = () => {
  return useMutation({
    mutationFn: deleteCourseSession,
  });
};

export const useUpdateSessionStatus = () => {
  return useMutation({
    mutationFn: ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: string;
    }) => updateSessionStatus(sessionId, status),
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
