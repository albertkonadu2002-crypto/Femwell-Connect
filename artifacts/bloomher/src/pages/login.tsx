import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLoginUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLoginUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ data: { email, password } }, {
      onSuccess: (data) => {
        setToken(data.token);
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Login Failed", description: "Invalid email or password. Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-secondary/30">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary fill-primary/20" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Welcome Back</CardTitle>
          <CardDescription>Log in to access your care kit and dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu.gh" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isPending}>
              {isPending ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Register here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
