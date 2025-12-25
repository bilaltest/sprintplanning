import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  BlogComment,
  CreateBlogCommentRequest
} from '../models/blog.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogCommentService {
  private apiUrl = `${environment.apiUrl}/blog/comments`;

  constructor(private http: HttpClient) {}

  /**
   * Get all top-level comments for a post
   */
  async getCommentsByPostId(postId: string): Promise<BlogComment[]> {
    return await firstValueFrom(
      this.http.get<BlogComment[]>(`${this.apiUrl}/post/${postId}`)
    );
  }

  /**
   * Get replies for a comment (threaded comments)
   */
  async getRepliesByParentId(parentId: string): Promise<BlogComment[]> {
    return await firstValueFrom(
      this.http.get<BlogComment[]>(`${this.apiUrl}/${parentId}/replies`)
    );
  }

  /**
   * Create a new comment on a post
   */
  async createComment(postId: string, request: CreateBlogCommentRequest): Promise<BlogComment> {
    return await firstValueFrom(
      this.http.post<BlogComment>(`${this.apiUrl}/post/${postId}`, request)
    );
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${commentId}`)
    );
  }

  /**
   * Toggle like on a comment
   */
  async toggleLike(commentId: string): Promise<BlogComment> {
    return await firstValueFrom(
      this.http.post<BlogComment>(`${this.apiUrl}/${commentId}/like`, {})
    );
  }
}
