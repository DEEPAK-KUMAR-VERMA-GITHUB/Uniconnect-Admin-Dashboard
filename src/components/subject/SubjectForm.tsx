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
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema
export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  credits: z.coerce.number().min(1, "Credits must be at least 1"),
  isElective: z.boolean().default(false),
  hasLab: z.boolean().default(false),
  isOnline: z.boolean().default(false),
});

// Define the form values type
export type SubjectFormValues = z.infer<typeof subjectSchema>;

// Define the props for the form component
interface SubjectFormProps {
  form: UseFormReturn<SubjectFormValues>;
  onSubmit: (data: SubjectFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const SubjectForm = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
}: SubjectFormProps) => {
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

        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credits</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 3" {...field} min={1} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="isElective"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Elective Subject</FormLabel>
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
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Has Lab Component</FormLabel>
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
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Online Subject</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    This subject is taught online
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Subject"
              : "Create Subject"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubjectForm;
