import { FC, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  change?: {
    value: string;
    positive: boolean;
  };
}

const SummaryCard: FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-primary/10",
  change,
}) => {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6 flex items-center">
        <div className={cn("rounded-full p-3 mr-4", iconBgColor)}>{icon}</div>
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
          {change && (
            <p
              className={cn(
                "text-xs flex items-center",
                change.positive ? "text-secondary" : "text-destructive"
              )}
            >
              {change.positive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              <span>{change.value}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
