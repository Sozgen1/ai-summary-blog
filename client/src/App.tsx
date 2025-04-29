import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useDarkMode";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import BlogDetail from "@/pages/BlogDetail";
import BlogEditor from "@/pages/BlogEditor";
import UserProfile from "@/pages/UserProfile";
import Explore from "@/pages/Explore";
import Bookmarks from "@/pages/Bookmarks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/editor" component={BlogEditor} />
      <Route path="/editor/:id" component={BlogEditor} />
      <Route path="/profile/:id" component={UserProfile} />
      <Route path="/explore" component={Explore} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
