import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import {
  BlogPost,
  BlogTag,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  CreateBlogTagRequest
} from '../models/blog.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blog/posts`;
  private tagsApiUrl = `${environment.apiUrl}/blog/tags`;

  // State management
  private postsSubject = new BehaviorSubject<BlogPost[]>([]);
  public posts$: Observable<BlogPost[]> = this.postsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPosts();
  }

  /**
   * Load all published posts
   */
  private async loadPosts(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const posts = await firstValueFrom(this.http.get<BlogPost[]>(this.apiUrl));
      this.postsSubject.next(posts);
    } catch (error: any) {
      console.error('Error loading blog posts:', error);
      const errorMessage = error.status === 0
        ? 'Serveur indisponible'
        : (error.error?.error?.message || 'Erreur lors du chargement des articles');
      this.errorSubject.next(errorMessage);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Refresh posts list
   */
  async refreshPosts(): Promise<void> {
    await this.loadPosts();
  }

  /**
   * Get all published posts (observable)
   */
  getAllPublishedPosts(): Observable<BlogPost[]> {
    return this.posts$;
  }

  /**
   * Get a single post by slug or ID
   */
  async getPostBySlugOrId(identifier: string): Promise<BlogPost> {
    return await firstValueFrom(
      this.http.get<BlogPost>(`${this.apiUrl}/${identifier}`)
    );
  }

  /**
   * Create a new blog post (DRAFT status)
   */
  async createPost(request: CreateBlogPostRequest): Promise<BlogPost> {
    const post = await firstValueFrom(
      this.http.post<BlogPost>(this.apiUrl, request)
    );
    await this.refreshPosts();
    return post;
  }

  /**
   * Update an existing post
   */
  async updatePost(postId: string, request: UpdateBlogPostRequest): Promise<BlogPost> {
    const post = await firstValueFrom(
      this.http.put<BlogPost>(`${this.apiUrl}/${postId}`, request)
    );
    await this.refreshPosts();
    return post;
  }

  /**
   * Publish a post (DRAFT → PUBLISHED)
   */
  async publishPost(postId: string): Promise<BlogPost> {
    const post = await firstValueFrom(
      this.http.put<BlogPost>(`${this.apiUrl}/${postId}/publish`, {})
    );
    await this.refreshPosts();
    return post;
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${postId}`)
    );
    await this.refreshPosts();
  }

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: string): Promise<BlogPost> {
    return await firstValueFrom(
      this.http.post<BlogPost>(`${this.apiUrl}/${postId}/like`, {})
    );
  }

  /**
   * Search posts by query string
   */
  async searchPosts(query: string): Promise<BlogPost[]> {
    return await firstValueFrom(
      this.http.get<BlogPost[]>(`${this.apiUrl}/search`, {
        params: { q: query }
      })
    );
  }

  // ==================== Tags ====================

  /**
   * Get all tags
   */
  async getAllTags(): Promise<BlogTag[]> {
    return await firstValueFrom(
      this.http.get<BlogTag[]>(this.tagsApiUrl)
    );
  }

  /**
   * Create a new tag
   */
  async createTag(request: CreateBlogTagRequest): Promise<BlogTag> {
    return await firstValueFrom(
      this.http.post<BlogTag>(this.tagsApiUrl, request)
    );
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.tagsApiUrl}/${tagId}`)
    );
  }

  /**
   * Get latest N posts (for home page)
   */
  getLatestPosts(limit: number = 3): Observable<BlogPost[]> {
    return new BehaviorSubject(
      this.postsSubject.value.slice(0, limit)
    ).asObservable();
  }
}
