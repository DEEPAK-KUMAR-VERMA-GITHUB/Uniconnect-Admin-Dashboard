import { departmentData, enrollmentData, notifications } from "@/assets/data";
import { DepartmentDistribution } from "@/components/dashboard/DepartmentDistribution";
import { EnrollmentChart } from "@/components/dashboard/EnrollmentCharts";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SummaryCard from "@/components/dashboard/SummaryCard";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  BookOpen,
  Building,
  Download,
  FileBarChart2,
  NotebookPen,
  PlusCircle,
  School,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

const DashboardPage = () => {
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
    queryFn: async () => {
      // In a real app, this would fetch from an API
      // Return mock data for development purposes
      return {
        departments: { count: 12, change: "+2 this month" },
        courses: { count: 64, change: "+8 this month" },
        students: { count: 1234, change: "+120 this month" },
        faculty: { count: 86, change: "-2 this month" },
      };
    },
  });

  const activities = [
    {
      id: "1",
      icon: <UserPlus className="h-4 w-4 text-primary" />,
      iconBgColor: "bg-primary/10",
      content: (
        <p>
          New faculty member{" "}
          <span className="font-medium">Dr. Sarah Johnson</span> has been added
          to the <span className="font-medium">Computer Science</span>{" "}
          department
        </p>
      ),
      time: "2 hours ago",
    },
    {
      id: "2",
      icon: <NotebookPen className="h-4 w-4 text-secondary" />,
      iconBgColor: "bg-secondary/10",
      content: (
        <p>
          Course <span className="font-medium">Advanced Database Systems</span>{" "}
          has been updated with new session dates
        </p>
      ),
      time: "Yesterday",
    },
    {
      id: "3",
      icon: <BellRing className="h-4 w-4 text-warning" />,
      iconBgColor: "bg-warning/10",
      content: (
        <p>
          System-wide notification sent about{" "}
          <span className="font-medium">upcoming maintenance</span> scheduled
          for this weekend
        </p>
      ),
      time: "2 days ago",
    },
    {
      id: "4",
      icon: <Users className="h-4 w-4 text-destructive" />,
      iconBgColor: "bg-destructive/10",
      content: (
        <p>
          User account for <span className="font-medium">John Smith</span> has
          been temporarily blocked due to multiple failed login attempts
        </p>
      ),
      time: "3 days ago",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      id: "1",
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Add New Department",
      variant: "default" as const,
      href: "/departments",
    },
    {
      id: "2",
      icon: <BookOpen className="h-5 w-5" />,
      label: "Create New Course",
      variant: "outline" as const,
      color: "text-primary border-primary",
      href: "/courses",
    },
    {
      id: "3",
      icon: <Users className="h-5 w-5" />,
      label: "Manage Users",
      variant: "outline" as const,
      color: "text-secondary border-secondary",
      href: "/users",
    },
    {
      id: "4",
      icon: <BellRing className="h-5 w-5" />,
      label: "Send Notification",
      variant: "outline" as const,
      color: "text-warning border-warning",
      href: "/notifications",
    },
    {
      id: "5",
      icon: <FileBarChart2 className="h-5 w-5" />,
      label: "Generate Report",
      variant: "outline" as const,
      href: "/reports",
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header notifications={notifications} />

        <main className="flex-1 p-6 overflow-scroll max-h-screen">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Uniconnect Dashboard</h1>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-[200px] md:w-[260px]"
                />
              </div>
              <Button variant="outline" size="sm" className="h-10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-card animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard
                title="Departments"
                value={summaryData?.departments.count}
                icon={<Building className="h-5 w-5 text-primary" />}
                change={{
                  value: summaryData?.departments.change,
                  positive: true,
                }}
              />
              <SummaryCard
                title="Courses"
                value={summaryData?.courses.count}
                icon={<BookOpen className="h-5 w-5 text-secondary" />}
                iconBgColor="bg-secondary/10"
                change={{
                  value: summaryData?.courses.change,
                  positive: true,
                }}
              />
              <SummaryCard
                title="Students"
                value={summaryData?.students.count}
                icon={<Users className="h-5 w-5 text-warning" />}
                iconBgColor="bg-warning/10"
                change={{
                  value: summaryData?.students.change,
                  positive: true,
                }}
              />
              <SummaryCard
                title="Faculty"
                value={summaryData?.faculty.count}
                icon={<School className="h-5 w-5 text-primary" />}
                change={{
                  value: summaryData?.faculty.change,
                  positive: false,
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <EnrollmentChart data={enrollmentData} />
            <DepartmentDistribution data={departmentData} />
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <RecentActivity activities={activities} />
            <QuickActions actions={quickActions} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
