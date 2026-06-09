import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Cart from "@/pages/cart";
import Dashboard from "@/pages/dashboard";
import Telehealth from "@/pages/telehealth";
import Subscriptions from "@/pages/subscriptions";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Tracker from "@/pages/tracker";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/cart" component={Cart} />
        <Route path="/dashboard" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/telehealth" component={() => <ProtectedRoute><Telehealth /></ProtectedRoute>} />
        <Route path="/subscriptions" component={() => <ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/tracker" component={Tracker} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
