import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, ChevronLeft } from "lucide-react";
import {
  LucideIcon,
  LayoutDashboard,
  Building,
  BookOpen,
  Calendar,
  CalendarDays,
  FileText,
  Users,
  Bell,
  BarChart3,
  LogOut,
  School,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const Sidebar = () => {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: SidebarLink[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/departments", label: "Departments", icon: Building },
    // { href: "/courses", label: "Courses", icon: BookOpen },
    // { href: "/sessions", label: "Sessions", icon: Calendar },
    // { href: "/semesters", label: "Semesters", icon: CalendarDays },
    { href: "/subjects", label: "Subjects", icon: FileText },
    { href: "/users", label: "User Management", icon: Users },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const NavigationLink = ({ link }: { link: SidebarLink }) => {
    const isActive = location === link.href;
    const Icon = link.icon;

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1",
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "hover:bg-muted text-foreground"
        )}
        onClick={() => {
          setLocation(link.href);
          closeMobileSidebar();
        }}
      >
        <Icon className="h-5 w-5 mr-3" />
        {!collapsed && <span>{link.label}</span>}
      </Button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileSidebar}
        />
      )}

      <div
        className={cn(
          "bg-card text-card-foreground z-50 h-screen border-r transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          isMobile && "fixed top-0 left-0 bottom-0",
          isMobile && !mobileOpen && "-translate-x-full"
        )}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            <School className="h-5 w-5 text-primary shrink-0" />
            {!collapsed && (
              <h1 className="text-xl font-semibold ml-2 text-primary">
                Uniconnect
              </h1>
            )}
          </div>
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            {isMobile ? (
              <ChevronLeft className="h-4 w-4" />
            ) : collapsed ? (
              <ChevronLeft className="h-4 w-4 rotate-180" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-2">
            <div className="py-2">
              {!collapsed && (
                <div className="flex flex-col items-center p-3 mb-3">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.fullName} />
                      ) : (
                        user?.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-foreground">
                    {user?.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">Admin</p>
                </div>
              )}

              <nav className="space-y-1">
                {links.map((link) => (
                  <NavigationLink key={link.href} link={link} />
                ))}
              </nav>
            </div>

            <Separator className="my-4" />

            <Button
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-30"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default Sidebar;
