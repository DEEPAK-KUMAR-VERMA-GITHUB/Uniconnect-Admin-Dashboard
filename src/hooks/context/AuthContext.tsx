import {
  useMutation,
  UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";
import { useToast } from "./ToastContext";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";

interface User {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  department: string;
  status: string;
  phoneNumber: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
  profilePic?: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const {
    data: userData,
    error,
    isLoading,
    refetch,
  } = useQuery<User | undefined, Error>({
    queryKey: ["users", "me"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          // If unauthorized, return null instead of throwing
          if (res.status === 401) {
            return null;
          }
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        return data.data || null; // Ensure we always return null if no user
      } catch (error) {
        console.error("Error fetching user:", error);
        return null; // Always return null on error, not undefined
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const user = userData || null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const deviceId = Math.random().toString(36).substring(2, 9);
      const res = await apiRequest("POST", "/users/login", {
        ...credentials,
        deviceId,
      });
      return await res.json();
    },

    onSuccess: (res: any) => {
      const { user } = res.data;

      if (user.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this application.",
          variant: "destructive",
        });
        return; // Prevent further actions
      }

      // Update the user data in the cache
      queryClient.setQueryData(["users", "me"], user);

      // Refetch to ensure we have the latest data
      refetch();

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },

    onError: (error: Error) => {
      let errorMessage = "Login failed. Please try again."; // Default message
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message || errorMessage; // Extract the message field
      } catch (e) {
        console.error("Error parsing error message:", e);
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/users/logout");
    },
    onSuccess: () => {
      // Clear the user data from the cache
      queryClient.setQueryData(["users", "me"], null);
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      let errorMessage = "Logout failed. Please try again."; // Default message
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message || errorMessage; // Extract the message field
      } catch (e) {
        console.error("Error parsing error message:", e);
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
