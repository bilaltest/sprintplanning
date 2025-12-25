import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { PermissionService } from '../../services/permission.service';
import { BlogPost } from '../../models/blog.model';
import { Observable } from 'rxjs';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold dark:text-white mb-2">Blog</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Partagez vos réussites, éditos et actualités de la DSI
          </p>
        </div>
        <button
          *hasPermission="'BLOG'; level: 'WRITE'"
          (click)="createPost()"
          class="btn-primary flex items-center gap-2"
        >
          <span class="material-icons text-xl">add</span>
          Nouvel Article
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3]" class="card animate-pulse">
          <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
          <div class="p-6 space-y-3">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        *ngIf="error$ | async as error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
          <span class="material-icons">error</span>
          <p>{{ error }}</p>
        </div>
        <button
          (click)="retry()"
          class="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Réessayer
        </button>
      </div>

      <!-- Posts Grid -->
      <div
        *ngIf="!(loading$ | async) && !(error$ | async)"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let post of posts$ | async"
          (click)="viewPost(post.slug)"
          class="card hover:shadow-xl transition-all cursor-pointer group"
        >
          <!-- Cover Image -->
          <div
            *ngIf="post.coverImage"
            class="h-48 bg-cover bg-center rounded-t-lg overflow-hidden"
            [style.background-image]="'url(' + post.coverImage + ')'"
          >
            <div class="h-full w-full bg-gradient-to-b from-transparent to-black/50"></div>
          </div>
          <div
            *ngIf="!post.coverImage"
            class="h-48 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-lg flex items-center justify-center"
          >
            <span class="material-icons text-white text-6xl">article</span>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Tags -->
            <div *ngIf="post.tags && post.tags.length > 0" class="flex gap-2 mb-3">
              <span
                *ngFor="let tag of post.tags"
                class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                [style.background-color]="tag.color + '20'"
                [style.color]="tag.color"
              >
                {{ tag.name }}
              </span>
            </div>

            <!-- Title -->
            <h2
              class="text-xl font-semibold mb-2 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
            >
              {{ post.title }}
            </h2>

            <!-- Excerpt -->
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {{ post.excerpt || 'Aucun extrait disponible' }}
            </p>

            <!-- Meta -->
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <span class="material-icons text-lg">person</span>
                <span>{{ post.author.firstName }} {{ post.author.lastName }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <span class="material-icons text-lg">visibility</span>
                  <span>{{ post.viewCount || 0 }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-icons text-lg">favorite</span>
                  <span>{{ post.likeCount || 0 }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-icons text-lg">comment</span>
                  <span>{{ post.commentCount || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Date -->
            <div class="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {{ formatDate(post.publishedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!(loading$ | async) && !(error$ | async) && (posts$ | async)?.length === 0"
        class="text-center py-16"
      >
        <span class="material-icons text-gray-300 dark:text-gray-600 text-8xl mb-4">article</span>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Aucun article publié
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Soyez le premier à partager un article avec votre équipe!
        </p>
        <button
          *hasPermission="'BLOG'; level: 'WRITE'"
          (click)="createPost()"
          class="btn-primary"
        >
          Créer le premier article
        </button>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class BlogListComponent implements OnInit {
  posts$: Observable<BlogPost[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private blogService: BlogService,
    private permissionService: PermissionService,
    private router: Router
  ) {
    this.posts$ = this.blogService.posts$;
    this.loading$ = this.blogService.loading$;
    this.error$ = this.blogService.error$;
  }

  ngOnInit(): void {
    // Posts are loaded automatically in BlogService constructor
  }

  createPost(): void {
    this.router.navigate(['/blog/new']);
  }

  viewPost(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }

  async retry(): Promise<void> {
    await this.blogService.refreshPosts();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  }
}
