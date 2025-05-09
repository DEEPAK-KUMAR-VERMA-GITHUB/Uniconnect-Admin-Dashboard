import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  icon: React.ReactNode;
  iconBgColor: string;
  content: React.ReactNode;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

const RecentActivity = ({ activities, className }: RecentActivityProps) => {
  return (
    <Card className={cn("lg:col-span-2", className)}>
      <CardHeader className="flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <a href="#" className="text-primary text-sm hover:underline">
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {activities.map((activity, index) => (
            <div key={activity.id} className="py-3 flex items-start">
              <div
                className={cn("rounded-full p-2 mr-3", activity.iconBgColor)}
              >
                {activity.icon}
              </div>
              <div>
                <div className="text-sm">{activity.content}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
