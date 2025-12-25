import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import { BlogCommentService } from '../../services/blog-comment.service';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { BlogPost, BlogComment } from '../../models/blog.model';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-blog-post-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Loading State -->
      <div *ngIf="loading" class="animate-pulse">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>

      <!-- Post Content -->
      <div *ngIf="!loading && post" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <!-- Cover Image -->
        <div
          *ngIf="post.coverImage"
          class="h-96 bg-cover bg-center"
          [style.background-image]="'url(' + post.coverImage + ')'"
        ></div>

        <!-- Article Content -->
        <div class="p-8">
          <!-- Header -->
          <div class="mb-6">
            <!-- Tags -->
            <div *ngIf="post.tags && post.tags.length > 0" class="flex gap-2 mb-4">
              <span
                *ngFor="let tag of post.tags"
                class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                [style.background-color]="tag.color + '20'"
                [style.color]="tag.color"
              >
                {{ tag.name }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-4xl font-bold dark:text-white mb-4">{{ post.title }}</h1>

            <!-- Meta -->
            <div class="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <span class="material-icons text-lg">person</span>
                <span>{{ post.author.firstName }} {{ post.author.lastName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-lg">calendar_today</span>
                <span>{{ formatDate(post.publishedAt) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-lg">visibility</span>
                <span>{{ post.viewCount }} vues</span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div
            class="prose dark:prose-invert max-w-none mb-8"
            [innerHTML]="post.content"
          ></div>

          <!-- Actions -->
          <div class="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              (click)="toggleLike()"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              [class.text-red-600]="post.isLikedByCurrentUser"
              [class.bg-red-50]="post.isLikedByCurrentUser"
              [class.dark:bg-red-900/20]="post.isLikedByCurrentUser"
              [class.text-gray-600]="!post.isLikedByCurrentUser"
              [class.dark:text-gray-400]="!post.isLikedByCurrentUser"
              [class.hover:bg-gray-100]="!post.isLikedByCurrentUser"
              [class.dark:hover:bg-gray-700]="!post.isLikedByCurrentUser"
            >
              <span class="material-icons">
                {{ post.isLikedByCurrentUser ? 'favorite' : 'favorite_border' }}
              </span>
              <span>{{ post.likeCount || 0 }}</span>
            </button>

            <button
              (click)="scrollToComments()"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span class="material-icons">comment</span>
              <span>{{ comments.length }} commentaires</span>
            </button>

            <div class="flex-1"></div>

            <ng-container *hasPermission="'BLOG'; level: 'WRITE'">
              <button
                *ngIf="canEdit()"
                (click)="editPost()"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span class="material-icons">edit</span>
                <span>Modifier</span>
              </button>

              <button
                *ngIf="canEdit()"
                (click)="deletePost()"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span class="material-icons">delete</span>
                <span>Supprimer</span>
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div #commentsSection class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold dark:text-white mb-6">
          Commentaires ({{ comments.length }})
        </h2>

        <!-- New Comment Form -->
        <div class="mb-8">
          <textarea
            [(ngModel)]="newCommentContent"
            placeholder="Ajouter un commentaire..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              (click)="submitComment()"
              [disabled]="!newCommentContent.trim()"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publier
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div class="space-y-6">
          <div
            *ngFor="let comment of comments"
            class="border-l-2 border-gray-200 dark:border-gray-700 pl-4"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span class="material-icons text-green-600 dark:text-green-400">person</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold dark:text-white">
                    {{ comment.author.firstName }} {{ comment.author.lastName }}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-2">{{ comment.content }}</p>
                <div class="flex items-center gap-4 text-sm">
                  <button
                    (click)="toggleCommentLike(comment)"
                    class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    [class.text-red-600]="comment.isLikedByCurrentUser"
                    [class.dark:text-red-400]="comment.isLikedByCurrentUser"
                  >
                    <span class="material-icons text-sm">
                      {{ comment.isLikedByCurrentUser ? 'favorite' : 'favorite_border' }}
                    </span>
                    <span>{{ comment.likeCount || 0 }}</span>
                  </button>
                  <ng-container *hasPermission="'BLOG'; level: 'WRITE'">
                    <button
                      *ngIf="canDeleteComment(comment)"
                      (click)="deleteComment(comment.id!)"
                      class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <span class="material-icons text-sm">delete</span>
                      <span>Supprimer</span>
                    </button>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="comments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <span class="material-icons text-6xl mb-2">chat_bubble_outline</span>
          <p>Aucun commentaire pour le moment. Soyez le premier à réagir!</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BlogPostViewComponent implements OnInit {
  post: BlogPost | null = null;
  comments: BlogComment[] = [];
  loading = true;
  newCommentContent = '';
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private commentService: BlogCommentService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      await this.loadPost(slug);
      await this.loadComments();
    }
  }

  async loadPost(slug: string): Promise<void> {
    try {
      this.loading = true;
      this.post = await this.blogService.getPostBySlugOrId(slug);
    } catch (error: any) {
      console.error('Error loading post:', error);
      this.toastService.error('Erreur', 'Impossible de charger l\'article');
      this.router.navigate(['/blog']);
    } finally {
      this.loading = false;
    }
  }

  async loadComments(): Promise<void> {
    if (!this.post?.id) return;
    try {
      this.comments = await this.commentService.getCommentsByPostId(this.post.id);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  async toggleLike(): Promise<void> {
    if (!this.post?.id) return;
    try {
      this.post = await this.blogService.toggleLike(this.post.id);
    } catch (error) {
      this.toastService.error('Erreur', 'Impossible de liker l\'article');
    }
  }

  async toggleCommentLike(comment: BlogComment): Promise<void> {
    if (!comment.id) return;
    try {
      const updated = await this.commentService.toggleLike(comment.id);
      comment.isLikedByCurrentUser = updated.isLikedByCurrentUser;
      comment.likeCount = updated.likeCount;
    } catch (error) {
      this.toastService.error('Erreur', 'Impossible de liker le commentaire');
    }
  }

  async submitComment(): Promise<void> {
    if (!this.post?.id || !this.newCommentContent.trim()) return;
    try {
      await this.commentService.createComment(this.post.id, {
        content: this.newCommentContent.trim()
      });
      this.newCommentContent = '';
      await this.loadComments();
      this.toastService.success('Succès', 'Commentaire publié');
    } catch (error) {
      this.toastService.error('Erreur', 'Impossible de publier le commentaire');
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;
    try {
      await this.commentService.deleteComment(commentId);
      await this.loadComments();
      this.toastService.success('Succès', 'Commentaire supprimé');
    } catch (error) {
      this.toastService.error('Erreur', 'Impossible de supprimer le commentaire');
    }
  }

  canEdit(): boolean {
    return this.post?.author.id === this.currentUserId;
  }

  canDeleteComment(comment: BlogComment): boolean {
    return comment.author.id === this.currentUserId;
  }

  editPost(): void {
    if (this.post?.id) {
      this.router.navigate(['/blog', this.post.id, 'edit']);
    }
  }

  async deletePost(): Promise<void> {
    if (!this.post?.id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) return;
    try {
      await this.blogService.deletePost(this.post.id);
      this.toastService.success('Succès', 'Article supprimé');
      this.router.navigate(['/blog']);
    } catch (error) {
      this.toastService.error('Erreur', 'Impossible de supprimer l\'article');
    }
  }

  scrollToComments(): void {
    const element = document.querySelector('[ng-reflect-name="commentsSection"]');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
