/**
 * Blog models for Ma Banque Tools
 * Matches backend DTOs (BlogPostDto, BlogCommentDto, BlogTagDto)
 */

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: BlogPostStatus;
  author: BlogAuthor;
  publishedAt?: string; // ISO date
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  tags?: BlogTag[];
  isLikedByCurrentUser?: boolean;
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BlogComment {
  id?: string;
  postId: string;
  author: BlogAuthor;
  content: string;
  parentId?: string; // For threaded comments
  replies?: BlogComment[];
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}

export interface BlogTag {
  id?: string;
  name: string;
  slug: string;
  color: string;
  postCount?: number;
  createdAt?: string; // ISO date
}

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// DTOs for API requests

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  coverImage?: string;
  tagIds?: string[];
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  coverImage?: string;
  tagIds?: string[];
}

export interface CreateBlogCommentRequest {
  content: string;
  parentId?: string; // For replies
}

export interface CreateBlogTagRequest {
  name: string;
}
