import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertBlogSchema, 
  insertCommentSchema,
  insertTagSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Middleware to handle async errors
  const asyncHandler = (fn: Function) => (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch(err => {
      res.status(500).json({ 
        error: true, 
        message: err.message || "Internal server error"
      });
    });
  };

  // Authentication middleware (placeholder - would use JWT in real app)
  const authMiddleware = async (req: Request, res: Response, next: Function) => {
    // For demo purposes, simulate user authentication
    // In a real app, you would verify a JWT token
    const userId = req.headers["x-user-id"];
    
    if (!userId) {
      return res.status(401).json({ error: true, message: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(401).json({ error: true, message: "Invalid user" });
      }
      
      req.body.currentUser = user;
      next();
    } catch (error) {
      res.status(401).json({ error: true, message: "Authentication error" });
    }
  };

  // User routes
  app.post(`${apiPrefix}/auth/register`, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                           await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ 
          error: true, 
          message: "Username or email already exists"
        });
      }
      
      // In a real app, we would hash the password here
      const newUser = await storage.createUser(userData);
      
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: true, 
          message: "Invalid data", 
          details: error.errors 
        });
      }
      throw error;
    }
  }));

  app.post(`${apiPrefix}/auth/login`, asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: true, message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: true, message: "Invalid username or password" });
    }
    
    // In a real app, we would generate and return a JWT token here
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword,
      token: "demo-token" // Placeholder for actual JWT token
    });
  }));

  app.get(`${apiPrefix}/users/:id`, asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: true, message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    
    // Don't return the password in the response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  }));

  // Blog routes
  app.get(`${apiPrefix}/blogs`, asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const blogs = await storage.getBlogs(limit, offset);
    res.json(blogs);
  }));

  app.get(`${apiPrefix}/blogs/featured`, asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    
    const featuredBlogs = await storage.getFeaturedBlogs(limit);
    res.json(featuredBlogs);
  }));

  app.get(`${apiPrefix}/blogs/search`, asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: true, message: "Search query is required" });
    }
    
    const blogs = await storage.searchBlogs(query);
    res.json(blogs);
  }));

  app.get(`${apiPrefix}/blogs/:id`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID" });
    }
    
    const blog = await storage.getBlog(blogId);
    
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }
    
    res.json(blog);
  }));

  app.post(`${apiPrefix}/blogs`, asyncHandler(async (req: Request, res: Response) => {
    try {
      const blogData = insertBlogSchema.parse(req.body);
      
      const newBlog = await storage.createBlog(blogData);
      res.status(201).json(newBlog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: true, 
          message: "Invalid data", 
          details: error.errors 
        });
      }
      throw error;
    }
  }));

  app.put(`${apiPrefix}/blogs/:id`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID" });
    }
    
    try {
      // Validate partial blog data
      const blogData = insertBlogSchema.partial().parse(req.body);
      
      const updatedBlog = await storage.updateBlog(blogId, blogData);
      
      if (!updatedBlog) {
        return res.status(404).json({ error: true, message: "Blog not found" });
      }
      
      res.json(updatedBlog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: true, 
          message: "Invalid data", 
          details: error.errors 
        });
      }
      throw error;
    }
  }));

  app.delete(`${apiPrefix}/blogs/:id`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID" });
    }
    
    const success = await storage.deleteBlog(blogId);
    
    if (!success) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }
    
    res.status(204).end();
  }));

  app.get(`${apiPrefix}/users/:id/blogs`, asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: true, message: "Invalid user ID" });
    }
    
    const blogs = await storage.getBlogsByAuthor(userId);
    res.json(blogs);
  }));

  // Comment routes
  app.get(`${apiPrefix}/blogs/:id/comments`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID" });
    }
    
    const comments = await storage.getCommentsByBlog(blogId);
    res.json(comments);
  }));

  app.post(`${apiPrefix}/blogs/:id/comments`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID" });
    }
    
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        blogId
      });
      
      const newComment = await storage.createComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: true, 
          message: "Invalid data", 
          details: error.errors 
        });
      }
      throw error;
    }
  }));

  // Tag routes
  app.get(`${apiPrefix}/blogs/:id/tags`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.id);
    
    if (isNaN(blogId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID" });
    }
    
    const tags = await storage.getBlogTags(blogId);
    res.json(tags);
  }));

  app.post(`${apiPrefix}/blogs/:blogId/tags/:tagId`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.blogId);
    const tagId = parseInt(req.params.tagId);
    
    if (isNaN(blogId) || isNaN(tagId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID or tag ID" });
    }
    
    const blog = await storage.getBlog(blogId);
    const tag = await storage.getTag(tagId);
    
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }
    
    if (!tag) {
      return res.status(404).json({ error: true, message: "Tag not found" });
    }
    
    const blogTag = await storage.addTagToBlog(blogId, tagId);
    res.status(201).json(blogTag);
  }));

  app.delete(`${apiPrefix}/blogs/:blogId/tags/:tagId`, asyncHandler(async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.blogId);
    const tagId = parseInt(req.params.tagId);
    
    if (isNaN(blogId) || isNaN(tagId)) {
      return res.status(400).json({ error: true, message: "Invalid blog ID or tag ID" });
    }
    
    const success = await storage.removeTagFromBlog(blogId, tagId);
    
    if (!success) {
      return res.status(404).json({ error: true, message: "Blog tag not found" });
    }
    
    res.status(204).end();
  }));

  // AI suggestion endpoint
  app.post(`${apiPrefix}/ai/suggestions`, asyncHandler(async (req: Request, res: Response) => {
    const { content, type } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: true, message: "Content is required" });
    }
    
    if (type !== 'title' && type !== 'summary') {
      return res.status(400).json({ error: true, message: "Type must be 'title' or 'summary'" });
    }

    try {
      // Import the OpenAI service methods
      const { generateTitleSuggestions, generateSummarySuggestion } = await import('./openai');
      
      if (type === 'title') {
        // Generate title suggestions using OpenAI
        const suggestions = await generateTitleSuggestions(content);
        res.json({ suggestions });
      } else {
        // Generate summary suggestion using OpenAI
        const suggestion = await generateSummarySuggestion(content);
        res.json({ suggestion });
      }
    } catch (error) {
      console.error("Error in AI suggestions endpoint:", error);
      res.status(500).json({ 
        error: true, 
        message: error instanceof Error ? error.message : "Failed to generate AI suggestions" 
      });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
