import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// Define user type
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  isVerified: boolean;
  profilePicture?: string;
  phone?: string;
  department?: {
    _id: string;
    name: string;
  };
  studentDetails?: {
    rollNumber: string;
    batch: string;
    course: {
      _id: string;
      name: string;
    };
    currentSemester: number;
  };
  facultyDetails?: {
    employeeId: string;
    designation: string;
    specialization: string;
    joiningDate: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Define pagination response type
export interface PaginatedResponse {
  success: boolean;
  message: string;
  data: {
    data: User[];
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

// API functions
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse> => {
  let url = `/users?search=&page=${page}&limit=${limit}`;

  const response = await apiRequest("GET", url);
  return await response.json();
};

export const fetchUser = async (id: string): Promise<{ data: User }> => {
  const response = await apiRequest("GET", `/users/${id}`);
  return await response.json();
};

export const verifyUser = async (id: string): Promise<{ data: User }> => {
  const response = await apiRequest("PATCH", `/users/${id}/verify`);
  return await response.json();
};

export const updateUserStatus = async (id: string): Promise<{ data: User }> => {
  const response = await apiRequest("PATCH", `/users/${id}/status`);
  return await response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiRequest("DELETE", `/users/delete-user/${id}`);
};

export const updateUserRole = async (
  id: string,
  role: string
): Promise<{ data: User }> => {
  const response = await apiRequest("PATCH", `/users/${id}/role`, { role });
  return await response.json();
};

export const updateUserDepartment = async (
  id: string,
  departmentId: string
): Promise<{ data: User }> => {
  const response = await apiRequest("PATCH", `/users/${id}/department`, {
    departmentId,
  });
  return await response.json();
};

export const resetUserPassword = async (
  id: string
): Promise<{ message: string; tempPassword: string }> => {
  const response = await apiRequest("POST", `/users/${id}/reset-password`);
  return await response.json();
};

// React Query hooks
export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => fetchUsers(page, limit),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

export const useVerifyUser = () => {
  return useMutation({
    mutationFn: verifyUser,
  });
};

export const useUpdateUserStatus = () => {
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => updateUserStatus(userId),
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: deleteUser,
  });
};

export const useUpdateUserRole = () => {
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
  });
};

export const useUpdateUserDepartment = () => {
  return useMutation({
    mutationFn: ({
      userId,
      departmentId,
    }: {
      userId: string;
      departmentId: string;
    }) => updateUserDepartment(userId, departmentId),
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: resetUserPassword,
  });
};

// Additional functions for specific user types

// Get faculty members by department
export const fetchFacultyByDepartment = async (
  departmentId: string,
  page: number = 1,
  limit: number = 100
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/users/faculty/department/${departmentId}?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const useFacultyByDepartment = (
  departmentId: string,
  page: number = 1,
  limit: number = 100
) => {
  return useQuery({
    queryKey: ["faculty-by-department", departmentId, page, limit],
    queryFn: () => fetchFacultyByDepartment(departmentId, page, limit),
    enabled: !!departmentId,
  });
};

// Get students by course
export const fetchStudentsByCourse = async (
  courseId: string,
  page: number = 1,
  limit: number = 100
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/users/students/course/${courseId}?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const useStudentsByCourse = (
  courseId: string,
  page: number = 1,
  limit: number = 100
) => {
  return useQuery({
    queryKey: ["students-by-course", courseId, page, limit],
    queryFn: () => fetchStudentsByCourse(courseId, page, limit),
    enabled: !!courseId,
  });
};

// Get students by semester
export const fetchStudentsBySemester = async (
  semesterId: string,
  page: number = 1,
  limit: number = 100
): Promise<PaginatedResponse> => {
  const response = await apiRequest(
    "GET",
    `/users/students/semester/${semesterId}?page=${page}&limit=${limit}`
  );
  return await response.json();
};

export const useStudentsBySemester = (
  semesterId: string,
  page: number = 1,
  limit: number = 100
) => {
  return useQuery({
    queryKey: ["students-by-semester", semesterId, page, limit],
    queryFn: () => fetchStudentsBySemester(semesterId, page, limit),
    enabled: !!semesterId,
  });
};

// Update student details
export const updateStudentDetails = async (
  id: string,
  data: {
    rollNumber?: string;
    batch?: string;
    courseId?: string;
    currentSemester?: number;
  }
): Promise<{ data: User }> => {
  const response = await apiRequest("PATCH", `/users/students/${id}`, data);
  return await response.json();
};

export const useUpdateStudentDetails = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        rollNumber?: string;
        batch?: string;
        courseId?: string;
        currentSemester?: number;
      };
    }) => updateStudentDetails(userId, data),
  });
};

// Update faculty details
export const updateFacultyDetails = async (
  id: string,
  data: {
    employeeId?: string;
    designation?: string;
    specialization?: string;
    joiningDate?: string;
  }
): Promise<{ data: User }> => {
  const response = await apiRequest("PATCH", `/users/faculty/${id}`, data);
  return await response.json();
};

export const useUpdateFacultyDetails = () => {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        employeeId?: string;
        designation?: string;
        specialization?: string;
        joiningDate?: string;
      };
    }) => updateFacultyDetails(userId, data),
  });
};
