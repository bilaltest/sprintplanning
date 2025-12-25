import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Quill from 'quill';
import { BlogService } from '../../services/blog.service';
import { BlogPost, BlogPostStatus } from '../../models/blog.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-blog-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold dark:text-white mb-2">
            {{ isEditMode ? 'Modifier l\'article' : 'Nouvel article' }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Partagez vos connaissances avec votre équipe
          </p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="savePost()" class="space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              required
              maxlength="200"
              placeholder="Titre de votre article..."
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ formData.title.length }}/200 caractères
            </p>
          </div>

          <!-- Cover Image URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image de couverture (URL)
            </label>
            <input
              type="url"
              [(ngModel)]="formData.coverImage"
              name="coverImage"
              placeholder="https://example.com/image.jpg"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Optionnel - URL d'une image pour illustrer votre article
            </p>
          </div>

          <!-- Content Editor (Quill) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu <span class="text-red-500">*</span>
            </label>
            <div
              #editor
              class="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
              style="min-height: 400px;"
            ></div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Utilisez la barre d'outils pour mettre en forme votre texte
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              (click)="cancel()"
              class="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>

            <div class="flex gap-3">
              <button
                type="submit"
                [disabled]="!isFormValid() || saving"
                class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-icons" *ngIf="saving">refresh</span>
                <span>{{ saving ? 'Enregistrement...' : 'Enregistrer brouillon' }}</span>
              </button>

              <button
                type="button"
                (click)="publishPost()"
                [disabled]="!isFormValid() || saving"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-icons">publish</span>
                <span>Publier</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Quill editor custom styles */
    ::ng-deep .ql-toolbar {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      background: white;
    }

    ::ng-deep .dark .ql-toolbar {
      background: rgb(55 65 81);
      border-color: rgb(75 85 99);
    }

    ::ng-deep .ql-container {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      min-height: 300px;
      font-size: 16px;
    }

    ::ng-deep .dark .ql-container {
      background: rgb(55 65 81);
      border-color: rgb(75 85 99);
      color: white;
    }

    ::ng-deep .dark .ql-editor.ql-blank::before {
      color: rgb(156 163 175);
    }

    ::ng-deep .dark .ql-stroke {
      stroke: rgb(209 213 219);
    }

    ::ng-deep .dark .ql-fill {
      fill: rgb(209 213 219);
    }

    ::ng-deep .dark .ql-picker-label {
      color: rgb(209 213 219);
    }
  `]
})
export class BlogPostFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editor') editorElement!: ElementRef;

  formData = {
    title: '',
    content: '',
    coverImage: ''
  };

  isEditMode = false;
  postId: string | null = null;
  saving = false;
  quillEditor!: Quill;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.postId = params.get('id');
      this.isEditMode = !!this.postId;
      if (this.isEditMode && this.postId) {
        this.loadPost(this.postId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeQuill();
  }

  ngOnDestroy(): void {
    if (this.quillEditor) {
      this.quillEditor = null as any;
    }
  }

  initializeQuill(): void {
    const toolbarOptions = [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'code-block'],
      ['clean']
    ];

    this.quillEditor = new Quill(this.editorElement.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Écrivez votre article ici...'
    });

    // Sync Quill content with formData
    this.quillEditor.on('text-change', () => {
      this.formData.content = this.quillEditor.root.innerHTML;
    });

    // Load existing content if in edit mode
    if (this.formData.content) {
      this.quillEditor.root.innerHTML = this.formData.content;
    }
  }

  async loadPost(postId: string): Promise<void> {
    try {
      const post = await this.blogService.getPostBySlugOrId(postId);
      this.formData.title = post.title;
      this.formData.content = post.content;
      this.formData.coverImage = post.coverImage || '';

      // Update Quill content if already initialized
      if (this.quillEditor) {
        this.quillEditor.root.innerHTML = this.formData.content;
      }
    } catch (error) {
      console.error('Error loading post:', error);
      this.toastService.error('Erreur', 'Impossible de charger l\'article');
      this.router.navigate(['/blog']);
    }
  }

  isFormValid(): boolean {
    return this.formData.title.trim().length > 0 &&
           this.formData.content.trim().length > 10;
  }

  async savePost(): Promise<void> {
    if (!this.isFormValid()) return;

    try {
      this.saving = true;
      const request = {
        title: this.formData.title.trim(),
        content: this.formData.content,
        coverImage: this.formData.coverImage || undefined
      };

      if (this.isEditMode && this.postId) {
        await this.blogService.updatePost(this.postId, request);
        this.toastService.success('Succès', 'Article mis à jour');
      } else {
        const post = await this.blogService.createPost(request);
        this.toastService.success('Succès', 'Brouillon enregistré');
        this.router.navigate(['/blog', post.id, 'edit']);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      this.toastService.error('Erreur', 'Impossible d\'enregistrer l\'article');
    } finally {
      this.saving = false;
    }
  }

  async publishPost(): Promise<void> {
    if (!this.isFormValid()) return;

    try {
      this.saving = true;

      // Save first if new post
      if (!this.isEditMode) {
        const request = {
          title: this.formData.title.trim(),
          content: this.formData.content,
          coverImage: this.formData.coverImage || undefined
        };
        const post = await this.blogService.createPost(request);
        this.postId = post.id || null;
      }

      // Then publish
      if (this.postId) {
        await this.blogService.publishPost(this.postId);
        this.toastService.success('Succès', 'Article publié');
        this.router.navigate(['/blog']);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      this.toastService.error('Erreur', 'Impossible de publier l\'article');
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    if (this.isEditMode && this.postId) {
      this.router.navigate(['/blog', this.postId]);
    } else {
      this.router.navigate(['/blog']);
    }
  }
}
