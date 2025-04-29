import { useState, FormEvent } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BlogList from "@/components/BlogList";

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, you would redirect to a search results page
    // or filter the blog list
    console.log("Search query:", searchQuery);
  };

  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      <div className="py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to BlogAI</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Create, read, and share blogs with AI-powered suggestions for titles and summaries.
        </p>
        <div className="mt-6">
          <Link href="/editor">
            <a className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Blog
            </a>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit"
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Search className="h-6 w-6" />
          </Button>
        </form>
      </div>

      {/* Featured posts */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
        <BlogList type="featured" limit={3} />
      </div>

      {/* Recent posts */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link href="/blogs">
            <a className="text-primary-500 hover:text-primary-600 font-medium">View all</a>
          </Link>
        </div>
        <BlogList type="recent" limit={2} />
      </div>
    </section>
  );
};

export default Home;
