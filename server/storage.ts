import { 
  users, blogs, comments, tags, blogTags, bookmarks,
  type User, type InsertUser,
  type Blog, type InsertBlog,
  type Comment, type InsertComment,
  type Tag, type InsertTag,
  type BlogTag, type InsertBlogTag,
  type Bookmark, type InsertBookmark
} from "@shared/schema";
import { eq, desc, ilike, and, or } from "drizzle-orm";
import { db } from "./db";

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
  
  // Bookmark Operations
  getBookmarkById(id: number): Promise<Bookmark | undefined>;
  getBookmark(userId: number, blogId: number): Promise<Bookmark | undefined>;
  getUserBookmarks(userId: number): Promise<Blog[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Session Store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  sessionStore: any;
  private users: Map<number, User>;
  private blogs: Map<number, Blog>;
  private comments: Map<number, Comment>;
  private tags: Map<number, Tag>;
  private blogTags: Map<number, BlogTag>;
  private bookmarks: Map<number, Bookmark>;
  
  private userIdCounter: number;
  private blogIdCounter: number;
  private commentIdCounter: number;
  private tagIdCounter: number;
  private blogTagIdCounter: number;
  private bookmarkIdCounter: number;

  constructor() {
    this.users = new Map();
    this.blogs = new Map();
    this.comments = new Map();
    this.tags = new Map();
    this.blogTags = new Map();
    this.bookmarks = new Map();
    
    this.userIdCounter = 1;
    this.blogIdCounter = 1;
    this.commentIdCounter = 1;
    this.tagIdCounter = 1;
    this.blogTagIdCounter = 1;
    this.bookmarkIdCounter = 1;

    // Session store
    this.sessionStore = {}; // Mock session store for memory implementation
    
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
    const newUser: User = { 
      ...user, 
      id,
      name: user.name || null,
      profileImage: user.profileImage || null,
      bio: user.bio || null
    };
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
      id,
      title: blog.title,
      content: blog.content,
      authorId: blog.authorId,
      summary: blog.summary || null,
      featuredImage: blog.featuredImage || null,
      category: blog.category || null,
      isFeatured: blog.isFeatured ?? false,
      isPublished: blog.isPublished ?? true,
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
    const newTag: Tag = { 
      ...tag, 
      id,
      description: tag.description || null
    };
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

  // Bookmark Operations
  async getBookmarkById(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }

  async getBookmark(userId: number, blogId: number): Promise<Bookmark | undefined> {
    return Array.from(this.bookmarks.values())
      .find(bookmark => bookmark.userId === userId && bookmark.blogId === blogId);
  }

  async getUserBookmarks(userId: number): Promise<Blog[]> {
    const userBookmarks = Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId);
    
    const blogIds = userBookmarks.map(bookmark => bookmark.blogId);
    return Array.from(this.blogs.values())
      .filter(blog => blogIds.includes(blog.id));
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkIdCounter++;
    const timestamp = new Date();
    
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      createdAt: timestamp
    };
    
    this.bookmarks.set(id, newBookmark);
    return newBookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Blog Operations
  async getBlog(id: number): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog;
  }

  async getBlogs(limit = 10, offset = 0): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .orderBy(desc(blogs.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getBlogsByAuthor(authorId: number): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.authorId, authorId))
      .orderBy(desc(blogs.publishedAt));
  }

  async searchBlogs(query: string): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(
        or(
          ilike(blogs.title, `%${query}%`),
          ilike(blogs.content, `%${query}%`),
          ilike(blogs.summary, `%${query}%`)
        )
      )
      .orderBy(desc(blogs.publishedAt));
  }

  async getFeaturedBlogs(limit = 3): Promise<Blog[]> {
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.isFeatured, true))
      .orderBy(desc(blogs.publishedAt))
      .limit(limit);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db
      .insert(blogs)
      .values({
        ...blog,
        publishedAt: blog.publishedAt || new Date(),
      })
      .returning();
    return newBlog;
  }

  async updateBlog(id: number, blogData: Partial<InsertBlog>): Promise<Blog | undefined> {
    const [updatedBlog] = await db
      .update(blogs)
      .set({
        ...blogData,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, id))
      .returning();
    return updatedBlog;
  }

  async deleteBlog(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(blogs)
      .where(eq(blogs.id, id))
      .returning();
    return !!deleted;
  }

  // Comment Operations
  async getCommentsByBlog(blogId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.blogId, blogId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return !!deleted;
  }

  // Tag Operations
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name));
    return tag;
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }

  // BlogTag Operations
  async getBlogTags(blogId: number): Promise<Tag[]> {
    return await db
      .select({
        id: tags.id,
        name: tags.name,
        description: tags.description,
      })
      .from(tags)
      .innerJoin(blogTags, eq(tags.id, blogTags.tagId))
      .where(eq(blogTags.blogId, blogId));
  }

  async addTagToBlog(blogId: number, tagId: number): Promise<BlogTag> {
    const [newBlogTag] = await db
      .insert(blogTags)
      .values({ blogId, tagId })
      .returning();
    return newBlogTag;
  }

  async removeTagFromBlog(blogId: number, tagId: number): Promise<boolean> {
    const [deleted] = await db
      .delete(blogTags)
      .where(and(eq(blogTags.blogId, blogId), eq(blogTags.tagId, tagId)))
      .returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();
