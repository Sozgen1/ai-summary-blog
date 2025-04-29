import { 
  users, blogs, comments, tags, blogTags,
  type User, type InsertUser,
  type Blog, type InsertBlog,
  type Comment, type InsertComment,
  type Tag, type InsertTag,
  type BlogTag, type InsertBlogTag
} from "@shared/schema";

export interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Blog Operations
  getBlog(id: number): Promise<Blog | undefined>;
  getBlogs(limit?: number, offset?: number): Promise<Blog[]>;
  getBlogsByAuthor(authorId: number): Promise<Blog[]>;
  searchBlogs(query: string): Promise<Blog[]>;
  getFeaturedBlogs(limit?: number): Promise<Blog[]>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: number, blogData: Partial<InsertBlog>): Promise<Blog | undefined>;
  deleteBlog(id: number): Promise<boolean>;
  
  // Comment Operations
  getCommentsByBlog(blogId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Tag Operations
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  
  // BlogTag Operations
  getBlogTags(blogId: number): Promise<Tag[]>;
  addTagToBlog(blogId: number, tagId: number): Promise<BlogTag>;
  removeTagFromBlog(blogId: number, tagId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogs: Map<number, Blog>;
  private comments: Map<number, Comment>;
  private tags: Map<number, Tag>;
  private blogTags: Map<number, BlogTag>;
  
  private userIdCounter: number;
  private blogIdCounter: number;
  private commentIdCounter: number;
  private tagIdCounter: number;
  private blogTagIdCounter: number;

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
    this.comments = new Map();
    this.tags = new Map();
    this.blogTags = new Map();
    
    this.userIdCounter = 1;
    this.blogIdCounter = 1;
    this.commentIdCounter = 1;
    this.tagIdCounter = 1;
    this.blogTagIdCounter = 1;
    
    // Add some initial data for demo purposes
    this.initializeData();
  }

  private initializeData(): void {
    // Create demo user
    const demoUser: InsertUser = {
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      email: "john.doe@example.com",
      name: "John Doe",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "Tech blogger and AI enthusiast"
    };
    this.createUser(demoUser);
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Blog Operations
  async getBlog(id: number): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async getBlogs(limit = 10, offset = 0): Promise<Blog[]> {
    return Array.from(this.blogs.values())
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(offset, offset + limit);
  }

  async getBlogsByAuthor(authorId: number): Promise<Blog[]> {
    return Array.from(this.blogs.values())
      .filter(blog => blog.authorId === authorId)
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }

  async searchBlogs(query: string): Promise<Blog[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.blogs.values())
      .filter(blog => 
        blog.title.toLowerCase().includes(lowerQuery) || 
        blog.content.toLowerCase().includes(lowerQuery) ||
        (blog.summary && blog.summary.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }

  async getFeaturedBlogs(limit = 3): Promise<Blog[]> {
    // In a real app, you might have a "featured" flag or use metrics to determine featured blogs
    // For this demo, we'll just return the latest blogs
    return this.getBlogs(limit);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const id = this.blogIdCounter++;
    const timestamp = new Date();
    
    const newBlog: Blog = {
      ...blog,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: blog.publishedAt || timestamp
    };
    
    this.blogs.set(id, newBlog);
    return newBlog;
  }

  async updateBlog(id: number, blogData: Partial<InsertBlog>): Promise<Blog | undefined> {
    const existingBlog = await this.getBlog(id);
    if (!existingBlog) return undefined;
    
    const updatedBlog: Blog = {
      ...existingBlog,
      ...blogData,
      updatedAt: new Date()
    };
    
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  async deleteBlog(id: number): Promise<boolean> {
    return this.blogs.delete(id);
  }

  // Comment Operations
  async getCommentsByBlog(blogId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.blogId === blogId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const timestamp = new Date();
    
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: timestamp
    };
    
    this.comments.set(id, newComment);
    return newComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Tag Operations
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(tag => tag.name.toLowerCase() === name.toLowerCase());
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.tagIdCounter++;
    const newTag: Tag = { ...tag, id };
    this.tags.set(id, newTag);
    return newTag;
  }

  // BlogTag Operations
  async getBlogTags(blogId: number): Promise<Tag[]> {
    const blogTagEntries = Array.from(this.blogTags.values())
      .filter(blogTag => blogTag.blogId === blogId);
    
    const tagIds = blogTagEntries.map(entry => entry.tagId);
    return Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
  }

  async addTagToBlog(blogId: number, tagId: number): Promise<BlogTag> {
    const id = this.blogTagIdCounter++;
    const newBlogTag: BlogTag = { id, blogId, tagId };
    this.blogTags.set(id, newBlogTag);
    return newBlogTag;
  }

  async removeTagFromBlog(blogId: number, tagId: number): Promise<boolean> {
    const blogTagToRemove = Array.from(this.blogTags.values())
      .find(blogTag => blogTag.blogId === blogId && blogTag.tagId === tagId);
    
    if (!blogTagToRemove) return false;
    return this.blogTags.delete(blogTagToRemove.id);
  }
}

export const storage = new MemStorage();
