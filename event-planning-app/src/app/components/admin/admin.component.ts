import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  themePreference: string;
  createdAt: string;
  updatedAt: string;
  historiesCount: number;
}

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalReleases: number;
  totalHistoryEntries: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
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

        <div class="card p-6" *ngIf="stats">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Releases</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ stats.totalReleases }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span class="material-icons text-purple-600 dark:text-purple-400">rocket_launch</span>
            </div>
          </div>
        </div>

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

      <!-- Users Table -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="material-icons text-2xl text-gray-700 dark:text-gray-300">people</span>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs</h2>
            </div>
            <button
              (click)="refreshUsers()"
              class="btn btn-secondary flex items-center space-x-2"
              [disabled]="isLoading"
            >
              <span class="material-icons text-sm" [class.animate-spin]="isLoading">refresh</span>
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions dans l'historique
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Inscrit
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-750 divide-y divide-gray-200 dark:divide-gray-600">
              <tr *ngIf="isLoading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center space-x-2">
                    <span class="material-icons animate-spin text-primary-600">refresh</span>
                    <span class="text-gray-500 dark:text-gray-400">Chargement...</span>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!isLoading && users.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Aucun utilisateur trouvé
                </td>
              </tr>

              <tr *ngFor="let user of users" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <span class="text-white font-semibold text-sm">
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        ID: {{ user.id.substring(0, 8) }}...
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 dark:text-white">{{ user.email }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
                    [class.bg-gray-100]="user.themePreference === 'light'"
                    [class.dark:bg-gray-700]="user.themePreference === 'light'"
                    [class.bg-gray-800]="user.themePreference === 'dark'"
                    [class.dark:bg-gray-600]="user.themePreference === 'dark'"
                    [class.text-gray-800]="user.themePreference === 'light'"
                    [class.dark:text-gray-200]="user.themePreference === 'light'"
                    [class.text-white]="user.themePreference === 'dark'"
                  >
                    <span class="material-icons" style="font-size: 12px;">
                      {{ user.themePreference === 'dark' ? 'dark_mode' : 'light_mode' }}
                    </span>
                    <span>{{ user.themePreference === 'dark' ? 'Sombre' : 'Clair' }}</span>
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ user.historiesCount }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getRelativeTime(user.createdAt) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    (click)="deleteUser(user)"
                    class="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <span class="material-icons text-sm">delete</span>
                    <span>Supprimer</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminComponent implements OnInit {
  private readonly API_URL = 'http://localhost:3000/api/admin';

  users: AdminUser[] = [];
  stats: Stats | null = null;
  isLoading = false;
  isExporting = false;
  isImporting = false;

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    await Promise.all([
      this.loadUsers(),
      this.loadStats()
    ]);
  }

  async loadUsers(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(
        this.http.get<{ users: AdminUser[] }>(`${this.API_URL}/users`)
      );
      this.users = response.users;
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      this.toastService.error('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      this.isLoading = false;
    }
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

  async refreshUsers(): Promise<void> {
    await this.loadData();
  }

  async deleteUser(user: AdminUser): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer cet utilisateur ?',
      message: `${user.firstName} ${user.lastName} (${user.email})\n\nCette action est irréversible. Les ${user.historiesCount} actions de cet utilisateur dans l'historique seront marquées comme "Deleted User".`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/users/${user.id}`)
      );

      this.toastService.success('Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès');
      await this.loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      this.toastService.error('Erreur', 'Impossible de supprimer l\'utilisateur');
    }
  }

  getRelativeTime(timestamp: string): string {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  }

  async exportDatabase(): Promise<void> {
    this.isExporting = true;
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.API_URL}/export`, { responseType: 'blob' })
      );

      // Créer un lien de téléchargement
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

    // Demander confirmation
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
      // Lire le fichier JSON
      const fileContent = await this.readFileAsText(file);
      const importData = JSON.parse(fileContent);

      // Envoyer au backend
      await firstValueFrom(
        this.http.post(`${this.API_URL}/import`, importData)
      );

      this.toastService.success('Import réussi', 'La base de données a été importée avec succès');

      // Recharger les données
      await this.loadData();
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
