// src/pages/UserPage.tsx
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Search } from "lucide-react";

// Services
import {
  useDeleteUser,
  useUpdateUserStatus,
  useUsers,
  useVerifyUser,
} from "@/services/userService";

// Components
import PaginationControls from "@/components/department/PaginationControls";
import ConfirmDialog from "@/components/user/ConfirmDialog";
import UserDetailsDialog from "@/components/user/UserDetailsDialog";
import UserTable from "@/components/user/UserTable";

const UserPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToBlock, setUserToBlock] = useState(null);

  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // API hooks
  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useUsers(currentPage, usersPerPage);

  const updateUserStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const verifyUserMutation = useVerifyUser();

  const allUsers = useMemo(() => res?.data?.data || [], [res]);

  // filter users
  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (user) => user.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return result;
  }, [allUsers, searchTerm, roleFilter, statusFilter]);

  // Apply pagination locally
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers?.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, usersPerPage]);

  // Calculate pagination values
  const { totalPages, totalItems, startItem, endItem } = useMemo(() => {
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / usersPerPage);
    const startItem =
      totalItems === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
    const endItem = Math.min(currentPage * usersPerPage, totalItems);
    return { totalPages, totalItems, startItem, endItem };
  }, [filteredUsers, currentPage, usersPerPage]);

  // Handle page changes
  const goToPage = useCallback(
    (pageNumber: number) => setCurrentPage(pageNumber),
    []
  );
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }, [currentPage, totalPages]);
  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Handle user actions
  const handleViewDetails = useCallback((user) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleVerifyUser = useCallback(
    (userId: string) => {
      setVerifyingUserId(userId);
      verifyUserMutation.mutate(userId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast({
            title: "Success",
            description: "User verified successfully",
            variant: "default",
          });
          setVerifyingUserId(null);
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to verify user",
            variant: "destructive",
          });
          setVerifyingUserId(null);
        },
      });
    },
    [verifyUserMutation, queryClient, toast]
  );

  const handleBlockUser = useCallback(
    (userId: string, isBlocked: string) => {
      setBlockingUserId(userId);
      updateUserStatusMutation.mutate(
        { userId },
        {
          onSuccess: () => {
            setIsBlockDialogOpen(false);
            setUserToBlock(null);
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast({
              title: "Success",
              description: `User ${
                isBlocked ? "unblocked" : "blocked"
              } successfully`,
              variant: "default",
            });
            setBlockingUserId(null);
          },
          onError: (error: Error) => {
            toast({
              title: "Error",
              description:
                error.message ||
                `Failed to ${isBlocked ? "unblock" : "block"} user`,
              variant: "destructive",
            });
            setBlockingUserId(null);
          },
        }
      );
    },
    [updateUserStatusMutation, queryClient, toast]
  );

  const handleDeleteUser = useCallback(
    (userId: string) => {
      setDeletingUserId(userId);
      deleteUserMutation.mutate(userId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast({
            title: "Success",
            description: "User deleted successfully",
            variant: "default",
          });
          setDeletingUserId(null);
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete user",
            variant: "destructive",
          });
          setDeletingUserId(null);
        },
      });
    },
    [deleteUserMutation, queryClient, toast]
  );

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = {
      all: allUsers.length,
      admin: 0,
      faculty: 0,
      student: 0,
    };

    allUsers.forEach((user) => {
      const role = user.role.toLowerCase();
      if (counts[role] !== undefined) {
        counts[role]++;
      }
    });

    return counts;
  }, [allUsers]);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={[]} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">
                Manage users, verify accounts, and control access
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role Tabs */}
          <Tabs
            defaultValue="all"
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setCurrentPage(1);
            }}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all" className="flex gap-2">
                All Users
                <Badge variant="secondary">{roleCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex gap-2">
                Admins
                <Badge variant="secondary">{roleCounts.admin}</Badge>
              </TabsTrigger>
              <TabsTrigger value="faculty" className="flex gap-2">
                Faculty
                <Badge variant="secondary">{roleCounts.faculty}</Badge>
              </TabsTrigger>
              <TabsTrigger value="student" className="flex gap-2">
                Students
                <Badge variant="secondary">{roleCounts.student}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : isError ? (
                <div className="text-center text-destructive py-4">
                  Error loading users: {(error as Error).message}
                </div>
              ) : (
                <>
                  <UserTable
                    users={paginatedUsers}
                    onViewDetails={handleViewDetails}
                    onVerify={handleVerifyUser}
                    onBlock={(user) => {
                      setUserToBlock(user);
                      setIsBlockDialogOpen(true);
                    }}
                    onDelete={(user) => {
                      setUserToDelete(user);
                      setIsDeleteDialogOpen(true);
                    }}
                    verifyingUserId={verifyingUserId}
                    blockingUserId={blockingUserId}
                    deletingUserId={deletingUserId}
                  />

                  {/* Pagination */}
                  {filteredUsers.length > 0 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      startItem={startItem}
                      endItem={endItem}
                      totalItems={totalItems}
                      onPrevPage={prevPage}
                      onNextPage={nextPage}
                      onGoToPage={goToPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* User Details Dialog */}
      <UserDetailsDialog
        user={selectedUser}
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onVerify={handleVerifyUser}
        onBlock={handleBlockUser}
        onDelete={(userId) => {
          setIsDetailsDialogOpen(false);
          setUserToDelete({ _id: userId });
          setIsDeleteDialogOpen(true);
        }}
        verifyingUserId={verifyingUserId}
        blockingUserId={blockingUserId}
        deletingUserId={deletingUserId}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${
          userToDelete?.fullName || "this user"
        }? This action cannot be undone.`}
        confirmText={deletingUserId ? "Deleting..." : "Delete"}
        confirmVariant="destructive"
        onConfirm={() => userToDelete && handleDeleteUser(userToDelete._id)}
        isLoading={!!deletingUserId}
        disabled={!!deletingUserId}
      />

      {/* Confirm Block/Unblock Dialog */}
      <ConfirmDialog
        isOpen={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
        title={userToBlock?.isBlocked ? "Unblock User" : "Block User"}
        description={
          userToBlock?.isBlocked
            ? `Are you sure you want to unblock ${
                userToBlock?.fullName || "this user"
              }?`
            : `Are you sure you want to block ${
                userToBlock?.fullName || "this user"
              }? They will not be able to access the system.`
        }
        confirmText={
          blockingUserId
            ? userToBlock?.isBlocked
              ? "Unblocking..."
              : "Blocking..."
            : userToBlock?.isBlocked
            ? "Unblock"
            : "Block"
        }
        confirmVariant={userToBlock?.isBlocked ? "default" : "destructive"}
        onConfirm={() => userToBlock && handleBlockUser(userToBlock._id)}
        isLoading={!!blockingUserId}
        disabled={!!blockingUserId}
      />
    </div>
  );
};

export default UserPage;
