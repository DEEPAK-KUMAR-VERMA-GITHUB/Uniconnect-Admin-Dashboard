import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

// Define the form schema
export const semesterSchema = z.object({
  semesterName: z.string().min(1, "Semester name is required"),
  semesterNumber: z.coerce.number().min(1, "Semester number must be at least 1"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

// Define the form values type
export type SemesterFormValues = z.infer<typeof semesterSchema>;

// Define the props for the form component
interface SemesterFormProps {
  form: UseFormReturn<SemesterFormValues>;
  onSubmit: (data: SemesterFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const SemesterForm = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
}: SemesterFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="semesterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Semester 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="semesterNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester Number</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 1" 
                  {...field} 
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Semester"
              : "Create Semester"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SemesterForm;
