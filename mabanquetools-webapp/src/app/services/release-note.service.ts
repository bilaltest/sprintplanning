import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReleaseNoteEntry, CreateReleaseNoteEntryRequest } from '@models/release-note.model';

@Injectable({
  providedIn: 'root'
})
export class ReleaseNoteService {
  private apiUrl = `${environment.apiUrl}/releases`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les entrées de release note pour une release
   */
  getAllEntries(releaseId: string): Observable<ReleaseNoteEntry[]> {
    const url = `${this.apiUrl}/${releaseId}/release-notes`;
    console.log('🌐 Calling API:', url);
    return this.http.get<ReleaseNoteEntry[]>(url).pipe(
      map(entries => {
        console.log('🔍 Raw response from HTTP:', entries);
        return entries.map(entry => ({
          ...entry,
          changes: entry.changes || [] // Garantir que changes est toujours un tableau
        }));
      })
    );
  }

  /**
   * Crée une nouvelle entrée de release note
   */
  createEntry(releaseId: string, request: CreateReleaseNoteEntryRequest): Observable<ReleaseNoteEntry> {
    return this.http.post<ReleaseNoteEntry>(`${this.apiUrl}/${releaseId}/release-notes`, request);
  }

  /**
   * Met à jour une entrée de release note
   */
  updateEntry(releaseId: string, entryId: string, request: CreateReleaseNoteEntryRequest): Observable<ReleaseNoteEntry> {
    return this.http.put<ReleaseNoteEntry>(`${this.apiUrl}/${releaseId}/release-notes/${entryId}`, request);
  }

  /**
   * Supprime une entrée de release note
   */
  deleteEntry(releaseId: string, entryId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${releaseId}/release-notes/${entryId}`);
  }

  /**
   * Exporte la release note en Markdown
   */
  exportMarkdown(releaseId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${releaseId}/release-notes/export/markdown`, {
      responseType: 'blob'
    });
  }

  /**
   * Exporte la release note en HTML
   */
  exportHtml(releaseId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${releaseId}/release-notes/export/html`, {
      responseType: 'blob'
    });
  }

  /**
   * Télécharge un fichier
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
