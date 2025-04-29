import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useDarkMode";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import BlogDetail from "@/pages/BlogDetail";
import BlogEditor from "@/pages/BlogEditor";
import UserProfile from "@/pages/UserProfile";
import Explore from "@/pages/Explore";
import Bookmarks from "@/pages/Bookmarks";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/editor" component={BlogEditor} />
      <ProtectedRoute path="/editor/:id" component={BlogEditor} />
      <ProtectedRoute path="/profile/:id" component={UserProfile} />
      <ProtectedRoute path="/bookmarks" component={Bookmarks} />
      <Route path="/explore" component={Explore} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition duration-200">
              <Header />
              <main className="flex-grow pt-16">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
