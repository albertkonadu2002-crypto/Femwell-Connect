import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  university: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const { mutate: register, isPending } = useRegisterUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", phone: "", university: "" },
  });

  function onSubmit(values: FormValues) {
    register({ data: values }, {
      onSuccess: (data) => {
        setToken(data.token);
        toast({ title: "Welcome to Femwell Connect!", description: "Your account has been created." });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Registration failed", description: "This email may already be registered.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col justify-between p-12 bg-primary text-primary-foreground"
      >
        <div className="flex items-center gap-2">
          <Heart className="h-7 w-7 fill-primary-foreground/30" />
          <span className="text-2xl font-serif font-bold">Femwell Connect</span>
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold mb-4">Join thousands of women taking charge of their health.</h2>
          <p className="text-primary-foreground/80">Access discreet care kits, telehealth consultations, and a community built for you.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["4,820+", "Women supported"], ["18", "Campuses served"], ["98.5%", "Satisfaction rate"], ["3", "Subscription plans"]].map(([stat, label]) => (
            <div key={label} className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{stat}</p>
              <p className="text-sm text-primary-foreground/70">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Start your wellness journey today</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl><Input placeholder="Ama Mensah" data-testid="input-name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl><Input type="email" placeholder="ama@university.edu.gh" data-testid="input-email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="At least 6 characters" data-testid="input-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="+233 24 000 0000" data-testid="input-phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="university" render={({ field }) => (
                <FormItem>
                  <FormLabel>University / Institution <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="University of Ghana, Legon" data-testid="input-university" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-12 text-base" disabled={isPending} data-testid="button-register">
                {isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
