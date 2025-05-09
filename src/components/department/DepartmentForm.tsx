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

// Define department schema
export const departmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

const DepartmentForm = ({
  onSubmit,
  form,
  isSubmitting,
  isEditing,
}: {
  onSubmit: (data: DepartmentFormValues) => void;
  form: ReturnType<typeof useForm<DepartmentFormValues>>;
  isSubmitting: boolean;
  isEditing: boolean;
}) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department Name</FormLabel>
            <FormControl>
              <Input placeholder="Faculty of Engineering" {...field} />
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
            <FormLabel>Department Code</FormLabel>
            <FormControl>
              <Input placeholder="ENG" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Department"
            : "Add Department"}
        </Button>
      </DialogFooter>
    </form>
  </Form>
);
export default DepartmentForm;
