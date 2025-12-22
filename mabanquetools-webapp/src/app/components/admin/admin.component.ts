import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { environment } from '../../../environments/environment';

// Sub-components
import { UserManagementComponent } from './user-management/user-management.component';
import { SprintManagementComponent } from './sprint-management/sprint-management.component';
import { ClosedDayManagementComponent } from './closed-days/closed-day-management.component';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalReleases: number;
  totalHistoryEntries: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserManagementComponent,
    SprintManagementComponent,
    ClosedDayManagementComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="material-icons text-4xl text-amber-600 dark:text-amber-400">admin_panel_settings</span>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Administration</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Gestion des utilisateurs et statistiques</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards & Export/Import -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Stats Card -->
        <div class="card p-6" *ngIf="stats">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stats.totalUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <span class="material-icons text-primary-600 dark:text-primary-400">people</span>
            </div>
          </div>
        </div>

        <!-- Closed Days Management (Sub-component) -->
        <app-closed-day-management></app-closed-day-management>


        <!-- Export/Import Card -->
        <div class="card p-6">
          <div class="flex flex-col space-y-3">
            <div class="flex items-center space-x-2 mb-2">
              <span class="material-icons text-amber-600 dark:text-amber-400">backup</span>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Sauvegarde</h3>
            </div>

            <button
              (click)="exportDatabase()"
              [disabled]="isExporting"
              class="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <span class="material-icons text-sm" [class.animate-spin]="isExporting">
                {{ isExporting ? 'refresh' : 'download' }}
              </span>
              <span>{{ isExporting ? 'Export en cours...' : 'Exporter la BDD' }}</span>
            </button>

            <div class="relative">
              <input
                #fileInput
                type="file"
                accept=".json"
                (change)="onFileSelected($event)"
                class="hidden"
              />
              <button
                (click)="fileInput.click()"
                [disabled]="isImporting"
                class="btn btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <span class="material-icons text-sm" [class.animate-spin]="isImporting">
                  {{ isImporting ? 'refresh' : 'upload' }}
                </span>
                <span>{{ isImporting ? 'Import en cours...' : 'Importer la BDD' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sprint Management (Sub-component) -->
      <app-sprint-management></app-sprint-management>

      <!-- Users Table (Sub-component) -->
      <app-user-management></app-user-management>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminComponent implements OnInit {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  stats: Stats | null = null;
  isExporting = false;
  isImporting = false;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ stats: Stats }>(`${this.API_URL}/stats`)
      );
      this.stats = response.stats;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }

  async exportDatabase(): Promise<void> {
    this.isExporting = true;
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.API_URL}/export`, { responseType: 'blob' })
      );

      const blob = new Blob([response], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ma-banque-tools-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      window.URL.revokeObjectURL(url);

      this.toastService.success('Export réussi', 'La base de données a été exportée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.toastService.error('Erreur', 'Impossible d\'exporter la base de données');
    } finally {
      this.isExporting = false;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Importer la base de données ?',
      message: `ATTENTION: Cette action va ÉCRASER toutes les données existantes.\n\nFichier: ${file.name}\nTaille: ${(file.size / 1024).toFixed(2)} KB\n\nCette action est irréversible. Voulez-vous continuer ?`,
      confirmText: 'Importer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) {
      input.value = '';
      return;
    }

    this.isImporting = true;
    try {
      const fileContent = await this.readFileAsText(file);
      const importData = JSON.parse(fileContent);

      await firstValueFrom(
        this.http.post(`${this.API_URL}/import`, importData)
      );

      this.toastService.success('Import réussi', 'La base de données a été importée avec succès');
      // We might want to trigger a refresh of child components here?
      // Since they load their own data on Init, a full page reload or signal might be needed if the DB changes completely.
      // Ideally we would have a shared state or event bus, but for now simple page reload or let the user navigate is OK.
      // Or we can query the children via ViewChild and call refresh.
      // But keeping it simple: just load stats.
      await this.loadStats();

      // Reload page to reflect all changes everywhere
      window.location.reload();

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      this.toastService.error('Erreur', 'Impossible d\'importer la base de données. Vérifiez le format du fichier.');
    } finally {
      this.isImporting = false;
      input.value = '';
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}
