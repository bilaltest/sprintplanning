import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { BlogImage } from '../models/blog.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogImageService {
  private apiUrl = `${environment.apiUrl}/blog/images`;

  // State management
  private imagesSubject = new BehaviorSubject<BlogImage[]>([]);
  public images$: Observable<BlogImage[]> = this.imagesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadImages();
  }

  /**
   * Load all images (thumbnails only)
   */
  private async loadImages(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const images = await firstValueFrom(this.http.get<BlogImage[]>(this.apiUrl));
      this.imagesSubject.next(images);
    } catch (error: any) {
      console.error('Error loading images:', error);
      const errorMessage = error.status === 0
        ? 'Serveur indisponible'
        : (error.error?.error?.message || 'Erreur lors du chargement des images');
      this.errorSubject.next(errorMessage);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Refresh images list
   */
  async refreshImages(): Promise<void> {
    await this.loadImages();
  }

  /**
   * Get all images (observable)
   */
  getAllImages(): Observable<BlogImage[]> {
    return this.images$;
  }

  /**
   * Upload an image
   */
  async uploadImage(file: File): Promise<BlogImage> {
    const formData = new FormData();
    formData.append('file', file);

    const image = await firstValueFrom(
      this.http.post<BlogImage>(`${this.apiUrl}/upload`, formData)
    );

    // Refresh list
    await this.refreshImages();

    return image;
  }

  /**
   * Get image by ID (with full image data)
   */
  async getImageById(imageId: string): Promise<BlogImage> {
    return await firstValueFrom(
      this.http.get<BlogImage>(`${this.apiUrl}/${imageId}`)
    );
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${imageId}`)
    );

    // Refresh list
    await this.refreshImages();
  }
}
