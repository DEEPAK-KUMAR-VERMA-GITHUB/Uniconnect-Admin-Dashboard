import { AlertTriangle, Bell, CheckCircle, Info } from "lucide-react";
import { FC } from "react";
import { useLocation } from "wouter";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

interface Notification {
  id: string;
  title: string;
  time: string;
  type: "info" | "warning" | "success";
  read: boolean;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
}

const NotificationsDropdown: FC<NotificationsDropdownProps> = ({
  notifications,
}) => {
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;
  const [_, setLocation] = useLocation();

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-primary" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Recent Notifications</h3>
        </div>
        {notifications.length > 0 ? (
          <>
            <ScrollArea className="max-h-60">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => {}}
                  >
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-muted-foreground"
                              : "text-foreground font-medium"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 border-t text-center">
              <Button
                variant="ghost"
                className="text-sm text-primary w-full"
                onClick={() => setLocation("/notifications")}
              >
                View all notifications
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No new notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
