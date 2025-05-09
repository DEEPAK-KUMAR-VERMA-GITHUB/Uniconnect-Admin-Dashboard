import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Department } from "./departmentService";

// Define course type
export interface Course {
  _id: string;
  name: string;
  code: string;
  department: Department;
  duration: number;
  type: string;
  sessions: string[];
  status: string;
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
    data: Course[];
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

// API service for courses
export const fetchCourses = async (
  page: number,
  limit: number
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/courses?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const fetchCourse = async (id: string): Promise<{ data: Course }> => {
  const response = await apiRequest("GET", `/courses/get-course/${id}`);
  return await response.json();
};

export const createCourse = async (courseData: {
  name: string;
  code: string;
  department: string;
  duration: number;
  type: string;
}): Promise<Course> => {
  const response = await apiRequest(
    "POST",
    "/courses/create-course",
    courseData
  );
  return await response.json();
};

export const updateCourse = async (
  id: string,
  courseData: {
    name?: string;
    code?: string;
    department?: string;
    duration?: number;
    type?: string;
    status?: string;
  }
): Promise<Course> => {
  const response = await apiRequest(
    "PUT",
    `/courses/update-course/${id}`,
    courseData
  );
  return await response.json();
};

export const deleteCourse = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/courses/delete-course/${id}`);
};

// Custom hooks for course operations
export const useCourses = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["courses", page, limit],
    queryFn: () => fetchCourses(page, limit),
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  return useMutation({
    mutationFn: createCourse,
  });
};

export const useUpdateCourse = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCourse(id, data),
  });
};

export const useDeleteCourse = () => {
  return useMutation({
    mutationFn: deleteCourse,
  });
};