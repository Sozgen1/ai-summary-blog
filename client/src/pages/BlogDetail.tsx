import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Blog, Comment, Bookmark as BookmarkType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface Author {
  id: number;
  name: string;
  image?: string;
}

interface CommentWithAuthor extends Comment {
  author: Author;
}

const BlogDetail: React.FC = () => {
  const [, params] = useRoute<{ id: string }>("/blog/:id");
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // User object for commenting and interactions
  const currentUser = user ? {
    id: user.id,
    name: user.name || user.username,
    image: user.profileImage
  } : null;

  const { data: blog, isLoading, error } = useQuery<Blog & { author: Author }>({
    queryKey: [`/api/blogs/${params?.id}`],
    queryFn: async () => {
      // Fetch blog data
      const response = await fetch(`/api/blogs/${params?.id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }
      
      const blogData = await response.json();
      
      // Fetch author data
      const authorResponse = await fetch(`/api/users/${blogData.authorId}`, {
        credentials: "include",
      });
      
      if (!authorResponse.ok) {
        throw new Error("Failed to fetch author");
      }
      
      const authorData = await authorResponse.json();
      
      return {
        ...blogData,
        author: {
          id: authorData.id,
          name: authorData.name || authorData.username,
          image: authorData.profileImage
        }
      };
    },
    enabled: !!params?.id
  });

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!params?.id) return;
      
      try {
        const response = await fetch(`/api/blogs/${params.id}/comments`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        
        const commentsData = await response.json();
        
        // Fetch author data for each comment
        const commentsWithAuthors = await Promise.all(
          commentsData.map(async (comment: Comment) => {
            const authorResponse = await fetch(`/api/users/${comment.authorId}`, {
              credentials: "include",
            });
            
            if (!authorResponse.ok) {
              throw new Error(`Failed to fetch author for comment ${comment.id}`);
            }
            
            const authorData = await authorResponse.json();
            
            return {
              ...comment,
              author: {
                id: authorData.id,
                name: authorData.name || authorData.username,
                image: authorData.profileImage
              }
            };
          })
        );
        
        setComments(commentsWithAuthors);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchComments();
  }, [params?.id, toast]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    if (!params?.id || !currentUser) {
      toast({
        title: "Error",
        description: !params?.id ? "Blog ID is missing" : "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/blogs/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          authorId: currentUser.id,
        }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      
      const newCommentData = await response.json();
      
      setComments([
        {
          ...newCommentData,
          author: currentUser
        },
        ...comments
      ]);
      
      setNewComment("");
      
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
    // In a real app, you would call an API to update the like status
  };

  // Check if blog is bookmarked
  useEffect(() => {
    // Only check bookmarks if the user is logged in
    if (!user || !params?.id) return;
    
    const checkBookmark = async () => {
      try {
        // Fetch bookmarks
        const bookmarksResponse = await fetch('/api/bookmarks', {
          credentials: 'include'
        });
        
        if (!bookmarksResponse.ok) {
          throw new Error('Failed to fetch bookmarks');
        }
        
        const bookmarksData = await bookmarksResponse.json();
        
        // Check if this blog is bookmarked
        const isBookmarked = bookmarksData.some((bookmark: Blog) => bookmark.id === Number(params.id));
        setSaved(isBookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    checkBookmark();
  }, [user, params?.id]);
  
  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user || !params?.id) {
        throw new Error('User or blog ID missing');
      }
      
      const response = await apiRequest('POST', '/api/bookmarks', {
        userId: user.id,
        blogId: Number(params.id)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add bookmark');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: 'Bookmark added',
        description: 'Article saved to your bookmarks',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to bookmark',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user || !params?.id) {
        throw new Error('Missing user or blog ID');
      }
      
      const response = await apiRequest('DELETE', `/api/bookmarks/blog/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove bookmark');
      }
      
      return response;
    },
    onSuccess: () => {
      setSaved(false);
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: 'Bookmark removed',
        description: 'Article removed from your bookmarks',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove bookmark',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Toggle bookmark
  const toggleSave = () => {
    if (!user) {
      // Redirect to login if not logged in
      toast({
        title: 'Authentication required',
        description: 'Please log in to bookmark articles',
        variant: 'destructive',
      });
      return;
    }
    
    if (saved) {
      removeBookmarkMutation.mutate();
    } else {
      addBookmarkMutation.mutate();
    }
  };

  const handleShare = () => {
    // In a real app, you would implement social sharing functionality
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Blog link copied to clipboard",
    });
  };

  // Set page title and OpenGraph meta tags
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | BlogAI`;
      
      // Update meta tags
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", blog.summary || blog.content.substring(0, 160));
      }
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", blog.title);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute("content", blog.summary || blog.content.substring(0, 160));
      }
    }
  }, [blog]);

  if (isLoading) {
    return (
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          <Skeleton className="w-full h-72" />
          <div className="p-8">
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center mr-6 mb-2">
                <Skeleton className="h-10 w-10 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32 mr-6 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
            </div>
            <Skeleton className="h-10 w-3/4 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Blog</h2>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : "Failed to load blog post. Please try again."}
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
    <section className="px-4 py-8 max-w-4xl mx-auto">
      <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
        {blog.featuredImage && (
          <img 
            src={blog.featuredImage} 
            alt={blog.title} 
            className="w-full h-72 object-cover" 
          />
        )}
        
        <div className="p-8">
          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center mr-6 mb-2">
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={blog.author.image} alt={blog.author.name} />
                <AvatarFallback>{blog.author.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span>{blog.author.name}</span>
            </div>
            <div className="flex items-center mr-6 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            <div className="flex items-center mr-6 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{calculateReadingTime(blog.content)} min read</span>
            </div>
            {blog.category && (
              <div className="flex items-center mb-2">
                <span className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                  {blog.category}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none blog-content" 
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={toggleLike}
                  className={`flex items-center text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 ${liked ? 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500' : ''}`}
                >
                  <Heart className={`h-6 w-6 mr-1 ${liked ? 'fill-current' : ''}`} />
                  <span>142 likes</span>
                </Button>
                <Button 
                  variant="ghost"
                  className="flex items-center text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  <MessageSquare className="h-6 w-6 mr-1" />
                  <span>{comments.length} comments</span>
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={toggleSave}
                  className={`flex items-center text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 ${saved ? 'text-primary-500 dark:text-primary-400' : ''}`}
                >
                  <Bookmark className={`h-5 w-5 mr-1 ${saved ? 'fill-current' : ''}`} />
                  <span>Save</span>
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleShare}
                  className="flex items-center text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  <Share2 className="h-5 w-5 mr-1" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-xl font-bold mb-6">Comments ({comments.length})</h3>
              
              {/* Comment form */}
              {currentUser ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.image || undefined} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 resize-none"
                        placeholder="Add a comment..."
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button type="submit" disabled={!newComment.trim()}>
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 mb-8 rounded-lg text-center">
                  <p className="mb-2 text-gray-600 dark:text-gray-400">
                    Please sign in to leave a comment.
                  </p>
                  <Button 
                    onClick={() => window.location.href = `/auth/${encodeURIComponent(window.location.pathname)}`}
                    className="mt-2"
                  >
                    Sign In
                  </Button>
                </div>
              )}
              
              {/* Comments list */}
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author.image} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{comment.author.name}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            {comment.content}
                          </p>
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <button className="flex items-center hover:text-primary-500 transition duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              <span>12</span>
                            </button>
                            <button className="hover:text-primary-500 transition duration-200">Reply</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
              
              {comments.length > 5 && (
                <div className="mt-8 text-center">
                  <Button variant="link" className="text-primary-500 hover:text-primary-600 font-medium">
                    Load more comments
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default BlogDetail;
