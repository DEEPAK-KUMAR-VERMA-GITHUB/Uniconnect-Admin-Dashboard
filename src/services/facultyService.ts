import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  password: string; // Note: This should be handled securely
  phoneNumber: string;
  role: "admin" | "faculty" | "student";
  profilePic?: string;
  department: string; // ObjectId as string
  facultyId?: string;
  designation?: "Associate Professor" | "Assistant Professor" | "Professor";
  rollNumber?: string;
  associations: {
    courses?: string[]; // Array of ObjectId as string
    sessions?: string[]; // Array of ObjectId as string
    semesters?: string[]; // Array of ObjectId as string
    subjects?: string[]; // Array of ObjectId as string
  };
  teachingAssignments?: {
    course: string; // ObjectId as string
    session: string; // ObjectId as string
    semester: string; // ObjectId as string
    subject: string; // ObjectId as string
  }[];
  isVerified: boolean;
  isBlocked: boolean;
  tokenVersion: number;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  lastLogin?: Date;
  loginAttempts: {
    count: number;
    lastAttempt?: Date;
    lockUntil?: Date;
  };
  device: {
    deviceToken?: string;
    platform?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
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

// api services for faculty
export const fetchFacultyByDepartment = async (
  departmentId?: string
): Promise<PaginatedResponse> => {
  const response = await apiRequest("GET", `/users/faculty/${departmentId}`);
  return await response.json();
};

export const useFacultyByDepartment = (departmentId?: string) => {
  return useQuery({
    queryKey: ["faculty", departmentId],
    queryFn: () => fetchFacultyByDepartment(departmentId!),
    enabled: !!departmentId, // Only run the query if departmentId is provided
  });
};
