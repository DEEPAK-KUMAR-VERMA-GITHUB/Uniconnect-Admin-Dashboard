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
export const fetchCousesByDepartment = async (
  departmetnId: string
): Promise<{ data: Course[] }> => {
  const response = await apiRequest(
    "GET",
    `/courses/get-courses-by-department/${departmetnId}`
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

export const updateCourseStatus = async (
  id: string,
  status: string
): Promise<Course> => {
  const response = await apiRequest(
    "PATCH",
    `/courses/update-course-status/${id}`,
    { status }
  );
  return await response.json();
};

export const deleteCourse = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/courses/delete-course/${id}`);
};

// Custom hooks for course operations
export const useCoursesByDepartment = (departmentId: string) => {
  return useQuery({
    queryKey: ["department-courses", departmentId],
    queryFn: () => fetchCousesByDepartment(departmentId),
    enabled: !!departmentId,
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

export const useUpdateCourseStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateCourseStatus(id, status),
  });
};

export const useDeleteCourse = () => {
  return useMutation({
    mutationFn: deleteCourse,
  });
};
