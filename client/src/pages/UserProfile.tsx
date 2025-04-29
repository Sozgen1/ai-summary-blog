import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MailIcon, LinkIcon, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Blog, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import ProfileEditForm from "@/components/ProfileEditForm";

interface BlogWithStats extends Blog {
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

const UserProfile: React.FC = () => {
  const [, params] = useRoute<{ id: string }>("/profile/:id");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const { user: currentUser } = useAuth();
  
  // User profile data
  const { data: user, isLoading: isUserLoading, error: userError } = useQuery<User>({
    queryKey: [`/api/users/${params?.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${params?.id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
    enabled: !!params?.id,
  });

  // User's blogs
  const { data: blogs, isLoading: isBlogsLoading, error: blogsError } = useQuery<BlogWithStats[]>({
    queryKey: [`/api/users/${params?.id}/blogs`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${params?.id}/blogs`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user blogs");
      }
      
      const blogsData = await response.json();
      
      // Add mock stats for UI demo purposes
      // In a real app, these would come from the API
      return blogsData.map((blog: Blog) => ({
        ...blog,
        stats: {
          views: Math.floor(Math.random() * 200) + 50,
          likes: Math.floor(Math.random() * 100) + 5,
          comments: Math.floor(Math.random() * 40) + 2,
        }
      }));
    },
    enabled: !!params?.id,
  });

  // Check if this is the current user's profile
  useEffect(() => {
    if (currentUser && params?.id) {
      setIsCurrentUser(currentUser.id.toString() === params.id);
    }
  }, [currentUser, params?.id]);

  // Loading state
  if (isUserLoading) {
    return (
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <Card>
          <div className="bg-gradient-to-r from-primary-500 to-indigo-600 h-48"></div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="-mt-16 sm:-mt-24">
                <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-full" />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <Skeleton className="h-8 w-40 mb-1" />
                <Skeleton className="h-4 w-64 mb-2" />
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 dark:text-red-300">
            {userError instanceof Error ? userError.message : "Failed to load user profile. Please try again."}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-indigo-600 h-48"></div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="-mt-16 sm:-mt-24">
              <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white dark:border-gray-800">
                <AvatarImage src={user.profileImage || undefined} alt={user.name || user.username} />
                <AvatarFallback>{(user.name || user.username).substring(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
              <p className="text-gray-600 dark:text-gray-300">{user.bio || "No bio provided"}</p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <a href={`mailto:${user.email}`} className="text-primary-500 hover:text-primary-600 text-sm flex items-center">
                  <MailIcon className="h-5 w-5 mr-1" />
                  {user.email}
                </a>
                {user.profileImage && (
                  <a href="#" className="text-primary-500 hover:text-primary-600 text-sm flex items-center">
                    <LinkIcon className="h-5 w-5 mr-1" />
                    {user.username}.com
                  </a>
                )}
              </div>
            </div>
            {isCurrentUser && (
              <div className="mt-6 sm:mt-0 sm:ml-auto">
                <Button 
                  className="flex items-center"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit2 className="h-5 w-5 mr-1" />
                  Edit Profile
                </Button>
              </div>
            )}
            
            {/* Profile Edit Form Dialog */}
            {isCurrentUser && user && showEditForm && (
              <ProfileEditForm 
                user={user}
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
              />
            )}
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {user.bio || "This user hasn't added a bio yet."}
            </p>
          </div>
          
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-bold mb-6">My Blogs</h2>
            
            {isBlogsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-4/5 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" />
                        <div className="flex space-x-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs && blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <div key={blog.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                    <Link href={`/blog/${blog.id}`}>
                      <a>
                        <img 
                          src={blog.featuredImage || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80`} 
                          alt={blog.title} 
                          className="w-full h-48 object-cover" 
                        />
                      </a>
                    </Link>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-primary-500 text-sm font-semibold">{blog.category || "Uncategorized"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(blog.publishedAt || blog.createdAt)}</span>
                      </div>
                      <Link href={`/blog/${blog.id}`}>
                        <a>
                          <h3 className="text-lg font-bold mb-2">{blog.title}</h3>
                        </a>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {blog.summary || blog.content.substring(0, 120) + "..."}
                      </p>
                      <div className="flex justify-between items-center">
                        <Link href={`/blog/${blog.id}`}>
                          <a className="text-primary-500 hover:text-primary-600 font-medium text-sm">Read more</a>
                        </Link>
                        <div className="flex text-gray-500 dark:text-gray-400 text-sm">
                          <span className="flex items-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {blog.stats.views}
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {blog.stats.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {isCurrentUser ? "You haven't created any blogs yet." : "This user hasn't created any blogs yet."}
                </p>
                {isCurrentUser && (
                  <Link href="/editor">
                    <a>
                      <Button>Create Your First Blog</Button>
                    </a>
                  </Link>
                )}
              </div>
            )}
            
            {blogs && blogs.length > 4 && (
              <div className="mt-6 text-center">
                <Button variant="outline" className="text-primary-500">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
