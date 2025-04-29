import { Link } from "wouter";
import { Heart, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, truncateText, calculateReadingTime, extractTextFromHtml } from "@/lib/utils";
import { Blog } from "@shared/schema";

interface BlogCardProps {
  blog: Blog;
  author: {
    id: number;
    name: string;
    image?: string;
  };
  variant?: "featured" | "recent";
  stats?: {
    likes: number;
    comments: number;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  author, 
  variant = "featured",
  stats
}) => {
  // Placeholder image in case the blog doesn't have a featured image
  const defaultImage = `https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80`;
  
  const featuredImage = blog.featuredImage || defaultImage;
  // Extract text from HTML for reading time calculation
  const plainText = extractTextFromHtml(blog.content);
  const readingTime = calculateReadingTime(plainText);
  
  if (variant === "featured") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-200">
        <Link href={`/blog/${blog.id}`}>
          <div className="block cursor-pointer">
            <img src={featuredImage} alt={blog.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <span className="text-primary-500 text-sm font-semibold">{blog.category}</span>
              <h3 className="text-xl font-bold mt-2 mb-3">{blog.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {blog.summary ? truncateText(blog.summary, 120) : truncateText(extractTextFromHtml(blog.content), 120)}
              </p>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={author.image} alt={author.name} />
                  <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{author.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(blog.publishedAt || blog.createdAt)} · {readingTime} min read
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
  
  // Recent blog post (horizontal layout)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row">
      <Link href={`/blog/${blog.id}`}>
        <div className="block md:w-64 h-48 cursor-pointer">
          <img src={featuredImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      </Link>
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-primary-500 text-sm font-semibold">{blog.category}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
        </div>
        <Link href={`/blog/${blog.id}`}>
          <div className="block cursor-pointer">
            <h3 className="text-xl font-bold mb-3">{blog.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {blog.summary ? truncateText(blog.summary, 150) : truncateText(extractTextFromHtml(blog.content), 150)}
            </p>
          </div>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/profile/${author.id}`}>
              <div className="flex items-center cursor-pointer">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={author.image} alt={author.name} />
                  <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{author.name}</p>
              </div>
            </Link>
          </div>
          {stats && (
            <div className="flex text-gray-500 dark:text-gray-400">
              <span className="flex items-center mr-4">
                <Heart className="h-5 w-5 mr-1" />
                {stats.likes}
              </span>
              <span className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-1" />
                {stats.comments}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
