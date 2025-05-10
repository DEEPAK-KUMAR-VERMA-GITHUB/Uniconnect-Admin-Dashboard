import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { School } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/context/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [_, navigate] = useLocation();

  // redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* left side - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-full p-2 bg-primary/10">
                <School className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Uniconnect</CardTitle>
            <CardDescription className="text-2xl font-bold text-primary ">
              University Admin Panel
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4 text-left"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero section */}

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary items-center justify-center">
        <div className="max-w-md text-white p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Uniconnect</h1>
          <p className="text-lg mb-6">
            A comprehensive educational institution management system to help
            you efficiently manage departments, courses, and users.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="mr-2 rounded-full bg-white bg-opacity-10 p-1">
                ✓
              </div>
              <span>Complete hierarchical management system</span>
            </li>
            <li className="flex items-center">
              <div className="mr-2 rounded-full bg-white bg-opacity-10 p-1">
                ✓
              </div>
              <span>Advanced analytics dashboard</span>
            </li>
            <li className="flex items-center">
              <div className="mr-2 rounded-full bg-white bg-opacity-10 p-1">
                ✓
              </div>
              <span>User management with granular permissions</span>
            </li>
            <li className="flex items-center">
              <div className="mr-2 rounded-full bg-white bg-opacity-10 p-1">
                ✓
              </div>
              <span>Comprehensive reporting capabilities</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
