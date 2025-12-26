import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { BlogService } from '../../services/blog.service';
import { BlogPost, BlogPostStatus, BlogImage } from '../../models/blog.model';
import { ToastService } from '../../services/toast.service';
import { ImageUploadModalComponent } from './image-upload-modal.component';

@Component({
  selector: 'app-blog-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorComponent, ImageUploadModalComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold dark:text-white mb-2">
            {{ isEditMode ? "Modifier l'article" : "Nouvel article" }}
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

          <!-- Cover Image Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image de couverture
            </label>

            <!-- Preview si déjà uploadée -->
            <div *ngIf="formData.coverImage" class="mb-4 relative">
              <img
                [src]="formData.coverImage"
                alt="Cover"
                class="w-full h-48 object-cover rounded-lg"
              >
              <button
                type="button"
                (click)="removeCoverImage()"
                class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
              >
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>

            <!-- Upload button -->
            <button
              type="button"
              (click)="showCoverImageUpload = true"
              class="btn-secondary flex items-center gap-2"
            >
              <span class="material-icons">add_photo_alternate</span>
              {{ formData.coverImage ? 'Changer' : 'Ajouter' }} l'image de couverture
            </button>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Optionnel - Image illustrant votre article
            </p>
          </div>

          <!-- Content Editor (TinyMCE) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu <span class="text-red-500">*</span>
            </label>
            <editor
              [(ngModel)]="formData.content"
              name="content"
              [init]="editorConfig"
              (onInit)="onEditorInit($event)"
            ></editor>
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
                <span class="material-icons">{{ postStatus === 'published' ? 'save' : 'publish' }}</span>
                <span>{{ postStatus === 'published' ? 'Enregistrer et fermer' : 'Publier' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Image Upload Modals -->
      <app-image-upload-modal
        *ngIf="showImageUploadModal"
        (imageSelected)="onImageSelected($event)"
        (close)="showImageUploadModal = false"
      ></app-image-upload-modal>

      <app-image-upload-modal
        *ngIf="showCoverImageUpload"
        (imageSelected)="onCoverImageSelected($event)"
        (close)="showCoverImageUpload = false"
      ></app-image-upload-modal>
    </div>
  `,
  styles: [`
    /* TinyMCE custom styles */
    ::ng-deep .tox-tinymce {
      border-radius: 0.5rem;
      border-color: rgb(209 213 219);
    }

    ::ng-deep .dark .tox-tinymce {
      border-color: rgb(75 85 99);
    }

    ::ng-deep .tox .tox-edit-area__iframe {
      background: white;
    }

    ::ng-deep .dark .tox .tox-edit-area__iframe {
      background: rgb(55 65 81);
    }
  `]
})
export class BlogPostFormComponent implements OnInit, AfterViewInit, OnDestroy {
  formData = {
    title: '',
    content: '',
    coverImage: ''
  };

  isEditMode = false;
  postId: string | null = null;
  postStatus: string = 'draft'; // Track current post status
  saving = false;
  editorInstance: any; // TinyMCE editor instance

  // Image upload modals
  showImageUploadModal = false;
  showCoverImageUpload = false;

  // TinyMCE configuration
  editorConfig: any = {
    height: 500,
    menubar: false,
    promotion: false, // Masquer les promotions TinyMCE
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
      'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image | removeformat | code',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; font-size: 16px; }',
    skin: 'oxide',
    content_css: 'default',
    image_advtab: true,
    images_upload_handler: this.handleImageUpload.bind(this),
    file_picker_callback: this.filePickerCallback.bind(this),
    automatic_uploads: false,
    paste_data_images: false,
    resize: 'both' as const
  };

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
    // TinyMCE initialization handled by the component
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.destroy();
      this.editorInstance = null;
    }
  }

  /**
   * Callback when TinyMCE is initialized
   */
  onEditorInit(event: any) {
    this.editorInstance = event.editor;
  }

  /**
   * Handle image upload from custom modal
   */
  handleImageUpload(blobInfo: any, progress: any): Promise<string> {
    return new Promise((resolve, reject) => {
      reject('Use the custom image upload modal instead');
    });
  }

  /**
   * Custom file picker callback - opens our modal
   */
  filePickerCallback(callback: any, value: any, meta: any) {
    if (meta.filetype === 'image') {
      this.showImageUploadModal = true;
      // Store callback for later use
      (window as any).tinyMCEImageCallback = callback;
    }
  }

  /**
   * Callback when an image is selected from the modal
   */
  onImageSelected(image: BlogImage) {
    if (!this.editorInstance) {
      console.error('TinyMCE editor not initialized');
      this.toastService.error('Erreur', 'L\'éditeur n\'est pas encore initialisé');
      return;
    }

    // Insert image at cursor position
    this.editorInstance.insertContent(`<img src="${image.url}" alt="${image.originalFileName}" />`);

    // If there's a callback waiting (from file_picker_callback)
    if ((window as any).tinyMCEImageCallback) {
      (window as any).tinyMCEImageCallback(image.url);
      delete (window as any).tinyMCEImageCallback;
    }

    this.showImageUploadModal = false;
  }

  /**
   * Callback quand une cover image est sélectionnée
   */
  onCoverImageSelected(image: BlogImage) {
    this.formData.coverImage = image.url || '';
    this.showCoverImageUpload = false;
  }

  /**
   * Supprimer la cover image
   */
  removeCoverImage() {
    this.formData.coverImage = '';
  }

  async loadPost(postId: string): Promise<void> {
    try {
      const post = await this.blogService.getPostBySlugOrId(postId);
      this.formData.title = post.title;
      this.formData.content = post.content;
      this.formData.coverImage = post.coverImage || '';
      this.postStatus = post.status || 'draft'; // Store current status

      // TinyMCE will automatically sync with formData.content via ngModel
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

      const request = {
        title: this.formData.title.trim(),
        content: this.formData.content,
        coverImage: this.formData.coverImage || undefined
      };

      // If new post, create it first
      if (!this.isEditMode) {
        const post = await this.blogService.createPost(request);
        this.postId = post.id || null;
      } else {
        // If editing, save modifications first
        await this.blogService.updatePost(this.postId!, request);
      }

      // Only publish if post is in DRAFT status
      if (this.postId && this.postStatus === 'draft') {
        await this.blogService.publishPost(this.postId);
        this.toastService.success('Succès', 'Article publié');
      } else if (this.postStatus === 'published') {
        // Already published, just show success message for the update
        this.toastService.success('Succès', 'Article mis à jour');
      }

      this.router.navigate(['/blog']);
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
