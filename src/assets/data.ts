import { UserPlus } from "lucide-react";

export const notifications = [
  {
    id: "1",
    title: "New faculty member awaiting verification",
    time: "2 hours ago",
    type: "warning" as const,
    read: false,
  },
  {
    id: "2",
    title: "Computer Science department updated",
    time: "Yesterday",
    type: "success" as const,
    read: false,
  },
  {
    id: "3",
    title: "Monthly report is ready for review",
    time: "2 days ago",
    type: "info" as const,
    read: true,
  },
];

export const enrollmentData = [
  { name: "Jan", students: 720, future: false },
  { name: "Feb", students: 900, future: false },
  { name: "Mar", students: 780, future: false },
  { name: "Apr", students: 960, future: false },
  { name: "May", students: 1080, future: false },
  { name: "Jun", students: 840, future: false },
  { name: "Jul", students: 600, future: true },
  { name: "Aug", students: 660, future: true },
  { name: "Sep", students: 540, future: true },
  { name: "Oct", students: 720, future: true },
  { name: "Nov", students: 480, future: true },
  { name: "Dec", students: 840, future: true },
];

export const departmentData = [
  { name: "Engineering", value: 300, color: "hsl(var(--primary))" },
  { name: "Science", value: 200, color: "hsl(var(--secondary))" },
  { name: "Arts", value: 240, color: "hsl(var(--warning))" },
  { name: "Business", value: 150, color: "hsl(var(--destructive))" },
  { name: "Others", value: 310, color: "hsl(var(--chart-5))" },
];


