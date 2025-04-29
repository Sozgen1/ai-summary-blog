import { useQuery } from "@tanstack/react-query";
import { Blog } from "@shared/schema";
import BlogCard from "./BlogCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Author {
  id: number;
  name: string;
  image?: string;
}

interface BlogWithAuthor extends Blog {
  authorData: Author;
}

interface BlogListProps {
  type: "featured" | "recent";
  limit?: number;
}

const BlogList: React.FC<BlogListProps> = ({ type, limit = 3 }) => {
  const endpoint = type === "featured" ? "/api/blogs/featured" : "/api/blogs";
  const queryKey = type === "featured" ? ["/api/blogs/featured", limit] : ["/api/blogs", limit];
  
  const { data, isLoading, error } = useQuery<BlogWithAuthor[]>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`${endpoint}?limit=${limit}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} blogs`);
      }
      
      const blogs = await response.json();
      
      // Fetch author information for each blog
      // In a real app, the API would likely include this information
      const blogsWithAuthors = await Promise.all(
        blogs.map(async (blog: Blog) => {
          const authorResponse = await fetch(`/api/users/${blog.authorId}`, {
            credentials: "include",
          });
          
          if (!authorResponse.ok) {
            throw new Error(`Failed to fetch author for blog ${blog.id}`);
          }
          
          const authorData = await authorResponse.json();
          
          return {
            ...blog,
            authorData: {
              id: authorData.id,
              name: authorData.name || authorData.username,
              image: authorData.profileImage
            }
          };
        })
      );
      
      return blogsWithAuthors;
    }
  });
  
  if (isLoading) {
    return (
      <div className={type === "featured" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid gap-8"}>
        {Array(limit).fill(0).map((_, index) => (
          <div key={index} className={type === "featured" ? "" : "flex flex-col md:flex-row"}>
            <Skeleton className="h-48 w-full md:w-64" />
            <div className="p-6 flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-2" />
                <div>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
        <p>Error loading blogs: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-300">No blogs found.</p>
      </div>
    );
  }
  
  return (
    <div className={type === "featured" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid gap-8"}>
      {data.map((blog) => (
        <BlogCard 
          key={blog.id} 
          blog={blog} 
          author={blog.authorData}
          variant={type}
          stats={type === "recent" ? { likes: 89, comments: 24 } : undefined}
        />
      ))}
    </div>
  );
};

export default BlogList;
