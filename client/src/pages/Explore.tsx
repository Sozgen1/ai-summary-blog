import { useState, FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Blog } from "@shared/schema";

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Get all blogs
  const { data: blogs, isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const response = await fetch('/api/blogs');
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      return response.json();
    }
  });

  // Filter blogs based on active tab
  const filteredBlogs = activeTab === "all" 
    ? blogs 
    : blogs?.filter(blog => blog.category === activeTab);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, you would make a search request to the API
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover new content from various categories</p>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex w-full max-w-lg">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="text" 
                placeholder="Search for blogs..." 
                className="pl-10 pr-4 py-2 w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Search</Button>
          </form>
        </div>
        
        {/* Category tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex overflow-x-auto pb-2 space-x-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="science">Science</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="h-48 w-full rounded-t-lg" />
                      <div className="p-4 space-y-3">
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
            ) : filteredBlogs && filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} className="blog-card">
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="relative">
                        {blog.featuredImage && (
                          <img 
                            src={blog.featuredImage} 
                            alt={blog.title} 
                            className="w-full h-48 object-cover"
                          />
                        )}
                        {blog.category && (
                          <span className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            {blog.category}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold line-clamp-2 h-12 mb-2">
                          <a href={`/blog/${blog.id}`} className="hover:text-primary-500 transition-colors duration-200">
                            {blog.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 h-16 mb-4">
                          {blog.summary || blog.content.slice(0, 120)}...
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <a 
                            href={`/blog/${blog.id}`} 
                            className="text-primary-500 hover:text-primary-600 font-medium"
                          >
                            Read more
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no blogs in this category yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;