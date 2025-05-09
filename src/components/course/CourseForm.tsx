// src/components/course/CourseForm.tsx
import { z } from "zod";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDepartments } from "@/services/departmentService";

// Define course schema
export const courseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  department: z.string().min(1, "Department is required"),
  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 year")
    .max(10, "Duration cannot exceed 10 years"),
  type: z.string().min(1, "Course type is required"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

const COURSE_TYPES = [
  { value: "UG", label: "Undergraduate" },
  { value: "PG", label: "Postgraduate" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "CERTIFICATE", label: "Certificate" },
];

const CourseForm = ({
  onSubmit,
  form,
  isSubmitting,
  isEditing,
  departmentId,
  hideDeparmtentField = false,
}: {
  onSubmit: (data: CourseFormValues) => void;
  form: ReturnType<typeof useForm<CourseFormValues>>;
  isSubmitting: boolean;
  isEditing: boolean;
  departmentId?: string;
  hideDeparmtentField?: boolean;
}) => {
  // Fetch departments for dropdown
  const { data: departmentsData } = useDepartments(1, 100);
  const departments = departmentsData?.data?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input placeholder="Bachelor of Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Code</FormLabel>
              <FormControl>
                <Input placeholder="BCS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideDeparmtentField && (
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (years)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="4"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COURSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Course"
              : "Add Course"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CourseForm;
