import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Blog } from "@shared/schema";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Bookmarks: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get bookmarks from the API
  const { data: bookmarks, isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/bookmarks'],
    queryFn: async () => {
      const response = await fetch('/api/bookmarks');
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    }
  });
  
  // Mutation to remove bookmark
  const removeBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: number) => {
      await apiRequest('DELETE', `/api/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      // Refetch bookmarks after successful deletion
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: "Bookmark removed",
        description: "The article has been removed from your bookmarks",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Function to remove a bookmark
  const handleRemoveBookmark = (blogId: number) => {
    removeBookmarkMutation.mutate(blogId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col space-y-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bookmark className="text-primary-500" size={24} />
            <h1 className="text-3xl font-bold">Your Bookmarks</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Access your saved articles quickly</p>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center pt-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="space-y-6">
            {bookmarks.map((blog) => (
              <Card key={blog.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Link href={`/blog/${blog.id}`}>
                        <h2 className="text-xl font-semibold cursor-pointer hover:text-primary-500 transition-colors duration-200">
                          {blog.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {blog.summary || blog.content.substring(0, 150)}...
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveBookmark(blog.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>Saved on {formatDate(blog.publishedAt || blog.createdAt)}</span>
                    </div>
                    <Link href={`/blog/${blog.id}`}>
                      <span className="text-primary-500 hover:underline cursor-pointer">Read article</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold">No bookmarks yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">You haven't saved any articles yet.</p>
            <Link href="/">
              <Button className="mt-6">Browse Articles</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;