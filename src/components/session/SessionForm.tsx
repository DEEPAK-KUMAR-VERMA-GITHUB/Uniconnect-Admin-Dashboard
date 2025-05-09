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
import { Select } from "../ui/select";

// Define the form schema
export const sessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  startYear: z.string().min(1, "Start date is required"),
});

// Define the form values type
export type SessionFormValues = z.infer<typeof sessionSchema>;

// Define the props for the form component
interface SessionFormProps {
  form: UseFormReturn<SessionFormValues>;
  onSubmit: (data: SessionFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const SessionForm = ({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
}: SessionFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2023-2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Year</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2023" {...field} />
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
              ? "Update Session"
              : "Create Session"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SessionForm;
