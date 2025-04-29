import { pgTable, text, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define all tables first
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  profileImage: text("profile_image"),
  bio: text("bio"),
});

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  featuredImage: text("featured_image"),
  category: text("category"),
  authorId: integer("author_id").notNull().references(() => users.id),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(true),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  blogId: integer("blog_id").notNull().references(() => blogs.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").notNull().references(() => blogs.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
}, (t) => ({
  unique: unique().on(t.blogId, t.tagId),
}));

// Then define all relations
export const usersRelations = relations(users, ({ many }) => ({
  blogs: many(blogs),
  comments: many(comments)
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id]
  }),
  comments: many(comments),
  blogTags: many(blogTags)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  blog: one(blogs, {
    fields: [comments.blogId],
    references: [blogs.id]
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id]
  })
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  blogTags: many(blogTags)
}));

export const blogTagsRelations = relations(blogTags, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogTags.blogId],
    references: [blogs.id]
  }),
  tag: one(tags, {
    fields: [blogTags.tagId],
    references: [tags.id]
  })
}));

// Schemas for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  profileImage: true,
  bio: true,
});

export const insertBlogSchema = createInsertSchema(blogs)
  .pick({
    title: true,
    content: true,
    summary: true,
    featuredImage: true,
    category: true,
    authorId: true,
    isFeatured: true,
    isPublished: true,
    publishedAt: true,
  })
  .transform((data) => {
    // Handle the publishedAt field to properly format dates or null
    return {
      ...data,
      publishedAt: data.isPublished ? new Date() : null
    };
  });

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  blogId: true,
  authorId: true,
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  description: true,
});

export const insertBlogTagSchema = createInsertSchema(blogTags).pick({
  blogId: true,
  tagId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;
