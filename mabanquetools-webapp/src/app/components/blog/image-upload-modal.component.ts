import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogImage } from '../../models/blog.model';
import { BlogImageService } from '../../services/blog-image.service';
import { ToastService } from '../../services/toast.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-image-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content-blog max-w-4xl" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header-glass">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Ajouter une image</h2>
          <button
            (click)="close.emit()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            [class.active]="activeTab === 'upload'"
            (click)="activeTab = 'upload'"
            class="px-4 py-3 font-medium transition-colors"
            [class.text-green-600]="activeTab === 'upload'"
            [class.border-b-2]="activeTab === 'upload'"
            [class.border-green-600]="activeTab === 'upload'"
            [class.text-gray-600]="activeTab !== 'upload'"
            [class.dark:text-gray-400]="activeTab !== 'upload'"
          >
            <span class="material-icons text-sm mr-2 align-middle">cloud_upload</span>
            Upload
          </button>
          <button
            [class.active]="activeTab === 'gallery'"
            (click)="activeTab = 'gallery'"
            class="px-4 py-3 font-medium transition-colors"
            [class.text-green-600]="activeTab === 'gallery'"
            [class.border-b-2]="activeTab === 'gallery'"
            [class.border-green-600]="activeTab === 'gallery'"
            [class.text-gray-600]="activeTab !== 'gallery'"
            [class.dark:text-gray-400]="activeTab !== 'gallery'"
          >
            <span class="material-icons text-sm mr-2 align-middle">photo_library</span>
            Galerie ({{ (images$ | async)?.length || 0 }})
          </button>
        </div>

        <!-- Tab Upload -->
        <div *ngIf="activeTab === 'upload'" class="p-6 space-y-4">
          <!-- Drag & Drop Zone -->
          <div
            class="dropzone border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            [class.border-green-500]="isDragging"
            [class.bg-green-50]="isDragging"
            [class.dark:bg-green-900/10]="isDragging"
            [class.border-gray-300]="!isDragging"
            [class.dark:border-gray-600]="!isDragging"
            (drop)="onDrop($event)"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave()"
          >
            <span class="material-icons text-5xl text-gray-400 mb-4">cloud_upload</span>
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Glissez une image ici ou cliquez pour sélectionner
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              JPG, PNG, WEBP - Max 5MB
            </p>
            <input
              type="file"
              #fileInput
              accept="image/jpeg,image/png,image/webp"
              (change)="onFileSelected($event)"
              hidden
            >
            <button
              type="button"
              (click)="fileInput.click()"
              class="btn-secondary"
            >
              Choisir un fichier
            </button>
          </div>

          <!-- Preview -->
          <div *ngIf="selectedFile" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-start gap-4">
              <img
                [src]="previewUrl"
                alt="Preview"
                class="w-32 h-32 object-cover rounded"
              >
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button
                (click)="clearSelection()"
                class="text-red-600 hover:text-red-700"
              >
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div *ngIf="uploading" class="relative pt-1">
            <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div
                [style.width.%]="uploadProgress"
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"
              ></div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Upload en cours... {{ uploadProgress }}%
            </p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              (click)="close.emit()"
              class="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              (click)="upload()"
              [disabled]="!selectedFile || uploading"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!uploading" class="material-icons text-sm mr-2">cloud_upload</span>
              <span *ngIf="uploading" class="material-icons text-sm mr-2 animate-spin">refresh</span>
              {{ uploading ? 'Upload...' : 'Upload' }}
            </button>
          </div>
        </div>

        <!-- Tab Gallery -->
        <div *ngIf="activeTab === 'gallery'" class="p-6 space-y-4">
          <!-- Search -->
          <input
            type="search"
            [(ngModel)]="searchQuery"
            placeholder="Rechercher une image..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >

          <!-- Loading -->
          <div *ngIf="loading$ | async" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 animate-spin">refresh</span>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Chargement...</p>
          </div>

          <!-- Grid -->
          <div
            *ngIf="!(loading$ | async)"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto"
          >
            <div
              *ngFor="let image of filteredImages$ | async"
              class="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-green-500 transition-all"
              (click)="selectImage(image)"
            >
              <img
                [src]="image.thumbnailUrl"
                [alt]="image.originalFileName"
                class="w-full h-32 object-cover"
              >
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <span class="material-icons text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                  check_circle
                </span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p class="text-white text-xs truncate">{{ image.originalFileName }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="!(loading$ | async) && (filteredImages$ | async)?.length === 0"
            class="text-center py-12"
          >
            <span class="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-4">image</span>
            <p class="text-gray-600 dark:text-gray-400">Aucune image trouvée</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-content-blog {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col;
    }

    .dropzone:hover {
      @apply border-green-400 bg-green-50/50 dark:bg-green-900/5;
    }
  `]
})
export class ImageUploadModalComponent {
  @Output() imageSelected = new EventEmitter<BlogImage>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab: 'upload' | 'gallery' = 'upload';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  isDragging = false;
  searchQuery = '';

  images$ = this.blogImageService.images$;
  loading$ = this.blogImageService.loading$;

  get filteredImages$() {
    return this.images$.pipe(
      map(images => images.filter(img =>
        img.originalFileName.toLowerCase().includes(this.searchQuery.toLowerCase())
      ))
    );
  }

  constructor(
    private blogImageService: BlogImageService,
    private toastService: ToastService
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    if (!this.isValidFile(file)) {
      return;
    }

    this.selectedFile = file;

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  isValidFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.toastService.error('Format non supporté', 'Seuls les formats JPG, PNG et WEBP sont acceptés');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.toastService.error('Fichier trop volumineux', 'La taille maximale est de 5MB');
      return false;
    }

    return true;
  }

  async upload() {
    if (!this.selectedFile) return;

    try {
      this.uploading = true;
      this.uploadProgress = 0;

      // Simulate progress
      const progressInterval = setInterval(() => {
        this.uploadProgress = Math.min(this.uploadProgress + 10, 90);
      }, 100);

      const image = await this.blogImageService.uploadImage(this.selectedFile);

      clearInterval(progressInterval);
      this.uploadProgress = 100;

      this.toastService.success('Succès', 'Image uploadée avec succès');
      this.imageSelected.emit(image);
      this.close.emit();
    } catch (error: any) {
      console.error('Upload error:', error);
      this.toastService.error('Erreur', error.error?.message || 'Erreur lors de l\'upload');
    } finally {
      this.uploading = false;
    }
  }

  selectImage(image: BlogImage) {
    this.imageSelected.emit(image);
    this.close.emit();
  }

  clearSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
