import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import AISuggestionModal from "@/components/AISuggestionModal";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { getAiTitleSuggestions, getAiSummarySuggestion } from "@/lib/aiService";
import { Blog } from "@shared/schema";

const categories = [
  { value: "technology", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "productivity", label: "Productivity" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" }
];

const BlogEditor: React.FC = () => {
  const [, params] = useRoute<{ id: string }>("/editor/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!params?.id;

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // AI suggestion state
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [summarySuggestion, setSummarySuggestion] = useState("");
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Load blog data if in edit mode
  const { data: blogData, isLoading: isBlogLoading } = useQuery<Blog>({
    queryKey: [`/api/blogs/${params?.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${params?.id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }
      
      return response.json();
    },
    enabled: isEditMode,
  });

  // Fetch tags for the blog if in edit mode
  useEffect(() => {
    if (isEditMode && params?.id) {
      const fetchBlogTags = async () => {
        try {
          const response = await fetch(`/api/blogs/${params.id}/tags`, {
            credentials: "include",
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch blog tags");
          }
          
          const tagsData = await response.json();
          setTags(tagsData.map((tag: { name: string }) => tag.name));
        } catch (error) {
          console.error("Error fetching blog tags:", error);
          toast({
            title: "Error",
            description: "Failed to load blog tags",
            variant: "destructive",
          });
        }
      };
      
      fetchBlogTags();
    }
  }, [isEditMode, params?.id, toast]);

  // Set form values when blog data is loaded
  useEffect(() => {
    if (blogData) {
      setTitle(blogData.title);
      setContent(blogData.content);
      setSummary(blogData.summary || "");
      setCategory(blogData.category || "");
      setFeaturedImage(blogData.featuredImage || "");
    }
  }, [blogData]);

  // Create/Update blog mutation
  const { mutate: saveBlog, isPending: isSaving } = useMutation({
    mutationFn: async (published: boolean) => {
      // Validate form
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!content.trim()) {
        throw new Error("Content is required");
      }

      // Create a blog data object without the publishedAt field for now
      const blogData = {
        title,
        content,
        summary: summary.trim() || null,
        category: category === 'none' ? null : category,
        featuredImage: featuredImage || null,
        // In a real app, this would come from the auth context
        authorId: 1, 
        isPublished: published,
        isFeatured: false, // Default value
        // We'll handle the date differently on the server
      };

      if (isEditMode) {
        const response = await apiRequest('PUT', `/api/blogs/${params!.id}`, blogData);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/blogs', blogData);
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blogs/featured'] });
      
      toast({
        title: "Success",
        description: isEditMode ? "Blog updated successfully" : "Blog created successfully",
      });
      
      // Navigate to the blog detail page
      navigate(`/blog/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog",
        variant: "destructive",
      });
    }
  });

  // Handle AI title suggestions
  const handleGenerateTitleSuggestions = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please add some content first",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingTitles(true);
    setTitleModalOpen(true);
    
    try {
      const result = await getAiTitleSuggestions(content);
      setTitleSuggestions(result.suggestions);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate title suggestions",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  // Handle AI summary suggestion
  const handleGenerateSummarySuggestion = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please add some content first",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingSummary(true);
    setSummaryModalOpen(true);
    
    try {
      const result = await getAiSummarySuggestion(content);
      setSummarySuggestion(result.suggestion);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary suggestion",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    
    setTagInput("");
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload the file to a server
    // and get back a URL to use as the featured image
    // For this demo, we'll use a fake URL
    const reader = new FileReader();
    reader.onload = () => {
      setFeaturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Blog editor loading state
  if (isEditMode && isBlogLoading) {
    return (
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-8 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            
            <div className="py-6 space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-40 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Blog" : "Create New Blog"}</h1>
          <div>
            <Button 
              variant="outline"
              className="mr-2"
              onClick={() => saveBlog(false)}
              disabled={isSaving}
            >
              Save Draft
            </Button>
            <Button 
              onClick={() => saveBlog(true)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Publish"}
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <Label htmlFor="blog-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog Title
            </Label>
            <div className="relative">
              <Input 
                id="blog-title" 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-200" 
                placeholder="Enter your blog title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="sm"
                className="absolute right-2 top-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-300 transition duration-200"
                onClick={handleGenerateTitleSuggestions}
              >
                <Zap className="h-4 w-4 mr-1" />
                AI Suggest Title
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image
            </Label>
            <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${featuredImage ? 'relative' : ''}`}>
              {featuredImage ? (
                <div>
                  <img 
                    src={featuredImage} 
                    alt="Featured" 
                    className="mx-auto max-h-64 object-contain mb-4" 
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => setFeaturedImage("")}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <Label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <Input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload} 
                      />
                    </Label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-200">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </Label>
            <RichTextEditor 
              value={content} 
              onChange={setContent}
              placeholder="Write your blog content here..." 
            />
            <div className="mt-2 flex justify-end">
              <Button 
                variant="outline" 
                className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-600 dark:text-primary-300 transition duration-200" 
                onClick={handleGenerateSummarySuggestion}
              >
                <Zap className="h-4 w-4 mr-1" />
                AI Generate Summary
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="blog-summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Summary
            </Label>
            <Textarea 
              id="blog-summary" 
              rows={3} 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-200" 
              placeholder="Enter a brief summary of your blog..." 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1 rounded-full">
                  {tag}
                  <button 
                    type="button" 
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Badge>
              ))}
              <Input 
                type="text" 
                className="bg-transparent outline-none border-none text-gray-700 dark:text-gray-200 min-w-[120px]" 
                placeholder="Add tag..." 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={handleAddTag}
              />
            </div>
          </div>
          
          <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => saveBlog(true)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Publish"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* AI Title Suggestions Modal */}
      <AISuggestionModal 
        isOpen={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        title="AI-Generated Title Suggestions"
        type="title"
        suggestions={titleSuggestions}
        isLoading={isGeneratingTitles}
        onSelectSuggestion={(suggestion) => setTitle(suggestion)}
      />
      
      {/* AI Summary Suggestion Modal */}
      <AISuggestionModal 
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title="AI-Generated Summary"
        type="summary"
        suggestions={summarySuggestion}
        isLoading={isGeneratingSummary}
        onSelectSuggestion={(suggestion) => setSummary(suggestion)}
      />
    </section>
  );
};

export default BlogEditor;
