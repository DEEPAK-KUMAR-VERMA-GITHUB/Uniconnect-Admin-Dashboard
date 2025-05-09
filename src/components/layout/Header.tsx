import { ChevronRight, HomeIcon } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import NotificationsDropdown from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HeaderProps {
  notifications: any[];
}

const Header: FC<HeaderProps> = ({ notifications }) => {
  const [location] = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const paths = location.split("/").filter(Boolean);
      let currentPath = "";

      // Start with home
      const breadcrumbItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

      // Add path segments
      paths.forEach((path: string) => {
        currentPath += `/${path}`;
        const formattedLabel = path.charAt(0).toUpperCase() + path.slice(1);
        breadcrumbItems.push({
          label: formattedLabel,
          href: currentPath,
        });
      });

      return breadcrumbItems;
    };

    setBreadcrumbs(generateBreadcrumbs());
  }, [location]);

  return (
    <header className="bg-card shadow-sm p-4 flex items-center justify-between border-b">
      <div className="flex items-center">
        <nav className="text-sm">
          <ol className="flex items-center space-x-1">
            {breadcrumbs.map((breadcrumb, index) => {
              return (
                <li key={index} className="flex items-center">
                  {index === 0 ? (
                    <a
                      href={breadcrumb.href}
                      className="text-primary hover:underline flex items-center"
                    >
                      <HomeIcon className="h-3.5 w-3.5 mr-1" />
                      {breadcrumb.label}
                    </a>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                      {index === breadcrumbs.length - 1 ? (
                        <span className="text-foreground font-medium">
                          {breadcrumb.label}
                        </span>
                      ) : (
                        <a
                          href={breadcrumb.href}
                          className="text-primary hover:underline"
                        >
                          {breadcrumb.label}
                        </a>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center space-x-2">
        <NotificationsDropdown notifications={notifications} />
        <Separator orientation="vertical" className="h-6" />
        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
