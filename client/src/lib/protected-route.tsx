import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // Encode the current path to redirect back after login
    const encodedRedirect = encodeURIComponent(path);
    return (
      <Route path={path}>
        <Redirect to={`/auth/${encodedRedirect}`} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}