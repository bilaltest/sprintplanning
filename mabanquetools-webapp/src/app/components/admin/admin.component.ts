import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';
import { PermissionService, PermissionModule, PermissionLevel, UserPermissions } from '@services/permission.service';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  themePreference: string;
  createdAt: string;
  updatedAt: string;
  historiesCount: number;
  permissions: UserPermissions;
}

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalReleases: number;
  totalHistoryEntries: number;
}

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                  Permissions
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
                        {{ user.historiesCount }} actions
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 dark:text-white">{{ user.email }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-2">
                    <span
                      *ngFor="let module of getPermissionModules()"
                      [class]="getPermissionBadgeClass(user.permissions[module])"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      [title]="getPermissionTitle(module, user.permissions[module])"
                    >
                      {{ getModuleShortName(module) }}: {{ user.permissions[module] }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getRelativeTime(user.createdAt) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    (click)="editPermissions(user)"
                    class="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <span class="material-icons text-sm">security</span>
                    <span>Permissions</span>
                  </button>
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

    <!-- Modal de gestion des permissions -->
    <div *ngIf="editingUser" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="closePermissionsModal()">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="material-icons text-2xl text-primary-600 dark:text-primary-400">security</span>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Gestion des permissions</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ editingUser.firstName }} {{ editingUser.lastName }} ({{ editingUser.email }})</p>
              </div>
            </div>
            <button (click)="closePermissionsModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div class="space-y-6">
            <div *ngFor="let module of getPermissionModules()" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <span class="material-icons text-gray-600 dark:text-gray-400">{{ getModuleIcon(module) }}</span>
                  <span class="font-semibold text-gray-900 dark:text-white">{{ getModuleName(module) }}</span>
                </div>
                <select
                  [(ngModel)]="editedPermissions[module]"
                  class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="NONE">Aucun accès</option>
                  <option value="READ">Lecture seule</option>
                  <option value="WRITE">Lecture + Écriture</option>
                </select>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ getModuleDescription(module) }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          <button
            (click)="closePermissionsModal()"
            class="btn btn-secondary"
          >
            Annuler
          </button>
          <button
            (click)="savePermissions()"
            [disabled]="isSavingPermissions"
            class="btn btn-primary flex items-center space-x-2"
          >
            <span class="material-icons text-sm" [class.animate-spin]="isSavingPermissions">
              {{ isSavingPermissions ? 'refresh' : 'save' }}
            </span>
            <span>{{ isSavingPermissions ? 'Enregistrement...' : 'Enregistrer' }}</span>
          </button>
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
  private readonly API_URL = `${environment.apiUrl}/admin`;

  users: AdminUser[] = [];
  stats: Stats | null = null;
  isLoading = false;
  isExporting = false;
  isImporting = false;

  // Permissions editing
  editingUser: AdminUser | null = null;
  editedPermissions: Partial<UserPermissions> = {};
  isSavingPermissions = false;

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private permissionService: PermissionService
  ) { }

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

  // Permissions management
  getPermissionModules(): PermissionModule[] {
    return ['CALENDAR', 'RELEASES', 'ADMIN'];
  }

  getModuleShortName(module: PermissionModule): string {
    const names: Record<PermissionModule, string> = {
      CALENDAR: 'CAL',
      RELEASES: 'REL',
      ADMIN: 'ADM'
    };
    return names[module];
  }

  getModuleName(module: PermissionModule): string {
    const names: Record<PermissionModule, string> = {
      CALENDAR: 'Calendrier',
      RELEASES: 'Préparation des MEP',
      ADMIN: 'Administration'
    };
    return names[module];
  }

  getModuleIcon(module: PermissionModule): string {
    const icons: Record<PermissionModule, string> = {
      CALENDAR: 'event',
      RELEASES: 'rocket_launch',
      ADMIN: 'admin_panel_settings'
    };
    return icons[module];
  }

  getModuleDescription(module: PermissionModule): string {
    const descriptions: Record<PermissionModule, string> = {
      CALENDAR: 'Gestion des événements du calendrier trimestriel',
      RELEASES: 'Gestion des releases, squads, features et actions',
      ADMIN: 'Accès à l\'administration (gestion des utilisateurs, export/import)'
    };
    return descriptions[module];
  }

  getPermissionBadgeClass(level: PermissionLevel): string {
    const classes: Record<PermissionLevel, string> = {
      NONE: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      READ: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      WRITE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    };
    return classes[level];
  }

  getPermissionTitle(module: PermissionModule, level: PermissionLevel): string {
    const moduleName = this.getModuleName(module);
    const levelText = level === 'NONE' ? 'Aucun accès' : level === 'READ' ? 'Lecture seule' : 'Lecture + Écriture';
    return `${moduleName}: ${levelText}`;
  }

  editPermissions(user: AdminUser): void {
    this.editingUser = user;
    this.editedPermissions = { ...user.permissions };
  }

  closePermissionsModal(): void {
    this.editingUser = null;
    this.editedPermissions = {};
  }

  async savePermissions(): Promise<void> {
    if (!this.editingUser) return;

    this.isSavingPermissions = true;
    try {
      await this.permissionService.updateUserPermissions(
        this.editingUser.id,
        this.editedPermissions
      );

      this.toastService.success('Permissions mises à jour', 'Les permissions ont été modifiées avec succès');
      this.closePermissionsModal();
      await this.loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      this.toastService.error('Erreur', 'Impossible de mettre à jour les permissions');
    } finally {
      this.isSavingPermissions = false;
    }
  }
}
