import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-blog-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-8">
      <div class="flex items-center space-x-4 mb-8">
        <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-900/5 dark:via-white/10 to-transparent"></div>
        <h2 class="text-xl font-light tracking-[0.2em] text-emerald-900/60 dark:text-emerald-100/60 uppercase">Blog</h2>
        <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-900/5 dark:via-white/10 to-transparent"></div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3]" class="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>

      <!-- Latest Posts -->
      <div
        *ngIf="!(loading$ | async) && (latestPosts$ | async) as posts"
        class="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let post of posts"
          (click)="viewPost(post.slug)"
          class="group relative cursor-pointer bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden"
        >
          <!-- Gradient overlay on hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

          <div class="relative z-10">
            <!-- Tags -->
            <div *ngIf="post.tags && post.tags.length > 0" class="flex gap-2 mb-3">
              <span
                *ngFor="let tag of post.tags | slice:0:2"
                class="inline-block px-2 py-1 rounded-full text-xs font-medium"
                [style.background-color]="tag.color + '20'"
                [style.color]="tag.color"
              >
                {{ tag.name }}
              </span>
            </div>

            <!-- Title -->
            <h3
              class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2 line-clamp-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors"
            >
              {{ post.title }}
            </h3>

            <!-- Excerpt -->
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
              {{ post.excerpt || 'Aucun extrait disponible' }}
            </p>

            <!-- Meta -->
            <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{{ post.author.firstName }} {{ post.author.lastName[0] }}.</span>
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <span class="material-icons text-sm">favorite</span>
                  {{ post.likeCount || 0 }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-icons text-sm">comment</span>
                  {{ post.commentCount || 0 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom accent bar -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!(loading$ | async) && (latestPosts$ | async)?.length === 0"
        class="text-center py-12 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl"
      >
        <span class="material-icons text-slate-300 dark:text-slate-600 text-6xl mb-3">article</span>
        <p class="text-slate-500 dark:text-slate-400">
          Aucun article publié pour le moment
        </p>
      </div>

      <!-- View All Button -->
      <div *ngIf="(latestPosts$ | async)?.length! > 0" class="text-center">
        <button
          (click)="viewAllPosts()"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span>Voir tous les articles</span>
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </section>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class BlogSectionComponent implements OnInit {
  latestPosts$!: Observable<BlogPost[]>;
  loading$: Observable<boolean>;

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {
    this.loading$ = this.blogService.loading$;
  }

  ngOnInit(): void {
    // Get latest 3 posts
    this.latestPosts$ = this.blogService.posts$.pipe(
      map(posts => posts.slice(0, 3))
    );
  }

  viewPost(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }

  viewAllPosts(): void {
    this.router.navigate(['/blog']);
  }
}
