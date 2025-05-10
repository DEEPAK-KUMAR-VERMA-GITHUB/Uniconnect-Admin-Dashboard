import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/services/departmentService";
import { useCoursesByDepartment } from "@/services/courseService";
import { useEffect, useState } from "react";

// Define the form schema based on the mongoose model
export const subjectSchema = z.object({
  name: z
    .string()
    .min(1, "Subject name is required")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Subject name must contain only letters and spaces"
    ),
  code: z
    .string()
    .min(1, "Subject code is required")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Subject code must contain only letters and numbers"
    ),
  department: z.string().min(1, "Department is required"),
  course: z.string().min(1, "Course is required"),
  credits: z.coerce
    .number()
    .min(1, "Credits must be at least 1")
    .max(30, "Credits cannot exceed 30"),
  isElective: z.boolean().default(false),
  hasLab: z.boolean().default(false),
  isOnline: z.boolean().default(false),
  status: z.string().default("ACTIVE"),
});

// Define the form values type
export type SubjectFormValues = z.infer<typeof subjectSchema>;

// Define the props for the form component
interface SubjectFormProps {
  form: UseFormReturn<SubjectFormValues>;
  onSubmit: (data: SubjectFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  initialDepartmentId?: string;
  initialCourseId?: string;
}

const SubjectForm = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
  initialDepartmentId,
  initialCourseId,
}: SubjectFormProps) => {
  // State to track the selected department
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(
    initialDepartmentId || ""
  );

  // Fetch departments for dropdown
  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useDepartments(1, 100);
  const departments = departmentsData?.data?.data || [];

  // Fetch courses based on selected department
  const { data: coursesData, isLoading: isLoadingCourses } =
    useCoursesByDepartment(selectedDepartmentId, 1, 100);
  const courses = coursesData?.data?.data || [];

  // Handle department change
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    form.setValue("department", departmentId);
    form.setValue("course", ""); // Reset course when department changes
  };

  // Set initial department and course if provided
  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDepartmentId(initialDepartmentId);
    }
  }, [initialDepartmentId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Database Management Systems"
                  {...field}
                />
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
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g. CS301" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleDepartmentChange(value);
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingDepartments ? (
                      <SelectItem value="loading" disabled>
                        Loading departments...
                      </SelectItem>
                    ) : departments.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No departments found
                      </SelectItem>
                    ) : (
                      departments.map((department) => (
                        <SelectItem key={department._id} value={department._id}>
                          {department.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={!selectedDepartmentId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedDepartmentId
                            ? "Select a course"
                            : "Select department first"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!selectedDepartmentId ? (
                      <SelectItem value="none" disabled>
                        Select a department first
                      </SelectItem>
                    ) : isLoadingCourses ? (
                      <SelectItem value="loading" disabled>
                        Loading courses...
                      </SelectItem>
                    ) : courses.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No courses found for this department
                      </SelectItem>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credits</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  {...field}
                  min={1}
                  max={30}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Subject Properties</h3>

          <FormField
            control={form.control}
            name="isElective"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    id="isElective"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="isElective" className="cursor-pointer">
                    Elective Subject
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This subject is optional for students
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasLab"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    id="hasLab"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="hasLab" className="cursor-pointer">
                    Has Lab Component
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This subject includes practical laboratory sessions
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isOnline"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    id="isOnline"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="isOnline" className="cursor-pointer">
                    Online Subject
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This subject is taught online
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Subject"
              : "Create Subject"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SubjectForm;
