import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';
import { PermissionService, PermissionModule, PermissionLevel, UserPermissions } from '@services/permission.service';
import { AdminUser } from '@models/admin-user.model';
import { environment } from '../../../../environments/environment';

const JOBS = ['AFN2', 'BA', 'Back', 'Fonctionnement', 'Front', 'iOS', 'LP', 'PO', 'RM', 'SM', 'Suivi des 15C', 'Suivi des 15F', 'Test', 'Ui', 'UX/UI'];
const TRIBES = ['ChDF', 'ChUX', 'Ma Banque', 'Autre'];
const SQUADS = ['Squad 1', 'Squad 2', 'Squad 3', 'Squad 4', 'Squad 5', 'Squad 6', 'ADAM', 'Transverse'];

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Users Table -->
    <div class="card">
      <div class="p-6 border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="material-icons text-2xl text-gray-700 dark:text-gray-300">people</span>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs</h2>
          </div>
          
          <!-- Search Input -->
          <div class="flex-1 max-w-sm mx-4">
              <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="material-icons text-gray-400 dark:text-gray-500">search</span>
                  </div>
                  <input 
                      type="text" 
                      [(ngModel)]="userSearchQuery" 
                      (ngModelChange)="onUserSearch()" 
                      class="input pl-10 py-1.5 text-sm w-full" 
                      placeholder="Rechercher un utilisateur (nom, prénom...)"
                  >
                  <button *ngIf="userSearchQuery" (click)="userSearchQuery = ''; onUserSearch()" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                       <span class="material-icons text-gray-400 text-sm hover:text-gray-600">close</span>
                  </button>
              </div>
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
                Inscrit
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-750 divide-y divide-gray-200 dark:divide-gray-600">
            <tr *ngIf="isLoading">
              <td colspan="4" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <span class="material-icons animate-spin text-primary-600">refresh</span>
                  <span class="text-gray-500 dark:text-gray-400">Chargement...</span>
                </div>
              </td>
            </tr>

            <tr *ngIf="!isLoading && users.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>


            <tr *ngFor="let user of paginatedUsers" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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

                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900 dark:text-white">{{ user.email }}</span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ getRelativeTime(user.createdAt) }}
                </span>
                <div *ngIf="user.metier || (user.squads && user.squads.length > 0)" class="text-xs text-gray-400 mt-1">
                  <span *ngIf="user.metier">{{ user.metier }}</span>
                  <span *ngIf="user.metier && user.squads && user.squads.length > 0" class="mx-1">•</span>
                  <span *ngIf="user.squads && user.squads.length > 0">{{ user.squads.join(', ') }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                <button
                  (click)="editUserDetails(user)"
                  class="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                >
                  <span class="material-icons text-sm">edit</span>
                  <span>Éditer</span>
                </button>
                <button
                  (click)="editPermissions(user)"
                  class="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <span class="material-icons text-sm">security</span>
                  <span>Permissions</span>
                </button>
                <button
                  (click)="resetUserPassword(user)"
                  class="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                  title="Réinitialiser à 'password'"
                >
                  <span class="material-icons text-sm">lock_reset</span>
                  <span>Reset</span>
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
      
      <!-- User Pagination Controls -->
      <div *ngIf="totalUserPages > 1 || userSearchQuery" class="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
          <div class="flex-1 flex justify-between sm:hidden">
              <button (click)="setUserPage(userPage - 1)" [disabled]="userPage === 1" class="btn btn-secondary btn-sm">Précédent</button>
              <button (click)="setUserPage(userPage + 1)" [disabled]="userPage === totalUserPages" class="btn btn-secondary btn-sm">Suivant</button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                      Affichage de <span class="font-medium">{{ filteredUsers.length > 0 ? (userPage - 1) * userPageSize + 1 : 0 }}</span> à <span class="font-medium">{{ Math.min(userPage * userPageSize, filteredUsers.length) }}</span> sur <span class="font-medium">{{ filteredUsers.length }}</span> utilisateurs
                      <span *ngIf="userSearchQuery" class="text-gray-500 ml-1">(filtré depuis {{ users.length }})</span>
                  </p>
              </div>
              <div *ngIf="totalUserPages > 1">
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button (click)="setUserPage(userPage - 1)" [disabled]="userPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                          <span class="material-icons text-sm">chevron_left</span>
                      </button>
                      
                      <!-- Simple pagination logic -->
                      <ng-container *ngFor="let p of userPages">
                          <button (click)="setUserPage(p)"
                              [class.bg-primary-50]="p === userPage" 
                              [class.dark:bg-primary-900]="p === userPage" 
                              [class.text-primary-600]="p === userPage" 
                              [class.dark:text-primary-300]="p === userPage"
                              class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                              {{ p }}
                          </button>
                      </ng-container>

                      <button (click)="setUserPage(userPage + 1)" [disabled]="userPage === totalUserPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                          <span class="material-icons text-sm">chevron_right</span>
                      </button>
                  </nav>
              </div>
          </div>
      </div>
    </div>

    <!-- Modal de gestion des permissions -->
    <div *ngIf="editingUser" class="modal-overlay" (click)="closePermissionsModal()">
      <div class="modal-content max-w-2xl fade-in-scale" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header-glass">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center space-x-3">
              <span class="material-icons text-2xl text-primary-600 dark:text-primary-400">security</span>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Gestion des permissions</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ editingUser.firstName }} {{ editingUser.lastName }} ({{ editingUser.email }})</p>
              </div>
            </div>
            <button (click)="closePermissionsModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
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

    <!-- Modal d'édition des détails utilisateur -->
    <div *ngIf="editingUserDetails" class="modal-overlay" (click)="closeUserDetailsModal()">
        <div class="modal-content max-w-lg fade-in" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="modal-header-glass">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-3">
                        <span class="material-icons text-2xl text-amber-600 dark:text-amber-400">edit</span>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Modifier l'utilisateur</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ editingUserDetails.email }}</p>
                        </div>
                    </div>
                    <button (click)="closeUserDetailsModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                        <input
                            type="text"
                            [(ngModel)]="editedUserDetails.firstName"
                            class="input"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                        <input
                            type="text"
                            [(ngModel)]="editedUserDetails.lastName"
                            class="input"
                        >
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Métier</label>
                    <select
                        [(ngModel)]="editedUserDetails.metier"
                        class="input"
                    >
                        <option [ngValue]="null">-- Sélectionner --</option>
                        <option *ngFor="let job of JOBS" [value]="job">{{ job }}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tribu / Chapitre</label>
                    <select
                        [(ngModel)]="editedUserDetails.tribu"
                        class="input"
                    >
                        <option [ngValue]="null">-- Sélectionner --</option>
                        <option *ngFor="let tribe of TRIBES" [value]="tribe">{{ tribe }}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Squads</label>
                    <div class="relative">
                        <button
                            #squadButton
                            type="button"
                            (click)="toggleSquadDropdown($event)"
                            class="input bg-white dark:bg-gray-750 text-left flex items-center justify-between"
                            [class.ring-2]="isSquadDropdownOpen"
                            [class.ring-primary-500]="isSquadDropdownOpen"
                        >
                            <span *ngIf="!editedUserDetails.squads || editedUserDetails.squads.length === 0" class="text-gray-500">-- Sélectionner --</span>
                            <span *ngIf="editedUserDetails.squads && editedUserDetails.squads.length > 0" class="truncate">
                                {{ editedUserDetails.squads.join(', ') }}
                            </span>
                            <span class="material-icons text-gray-400 text-sm">expand_more</span>
                        </button>

                    </div>
                </div>

                <div>
                    <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="editedUserDetails.interne" class="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 transition duration-150 ease-in-out">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Est un collaborateur interne</span>
                    </label>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
                <button (click)="closeUserDetailsModal()" class="btn btn-secondary">Annuler</button>
                <button (click)="saveUserDetails()" [disabled]="isSavingUserDetails" class="btn btn-primary flex items-center space-x-2">
                    <span class="material-icons text-sm" [class.animate-spin]="isSavingUserDetails">
                        {{ isSavingUserDetails ? 'refresh' : 'save' }}
                    </span>
                    <span>{{ isSavingUserDetails ? 'Enregistrement...' : 'Enregistrer' }}</span>
                </button>
            </div>
        </div>
        
        <!-- Global Squad Dropdown (Moved here to escape modal-content overflow/stacking context) -->
        <div *ngIf="isSquadDropdownOpen" 
                class="fixed z-[9999] mt-1 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                [style.top.px]="dropdownRect.top"
                [style.left.px]="dropdownRect.left"
                [style.width.px]="dropdownRect.width"
                (click)="$event.stopPropagation()">
            <div *ngFor="let squad of squadsList"
                    class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3 transition-colors"
                    (click)="toggleSquad(squad, $event)">
                <div class="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center transition-colors"
                        [class.bg-primary-600]="editedUserDetails.squads?.includes(squad)"
                        [class.border-primary-600]="editedUserDetails.squads?.includes(squad)">
                    <span *ngIf="editedUserDetails.squads?.includes(squad)" class="material-icons text-white text-[10px] font-bold">check</span>
                </div>
                <span class="text-sm text-gray-900 dark:text-white">{{ squad }}</span>
            </div>
        </div>
        <div *ngIf="isSquadDropdownOpen" (click)="closeSquadDropdown(); $event.stopPropagation()" class="fixed inset-0 z-[9998] cursor-default bg-transparent"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  users: AdminUser[] = [];
  isLoading = false;

  // Permissions editing
  editingUser: AdminUser | null = null;
  editedPermissions: Partial<UserPermissions> = {};
  isSavingPermissions = false;

  // User details editing
  editingUserDetails: AdminUser | null = null;
  editedUserDetails: Partial<AdminUser> = {};
  isSavingUserDetails = false;

  readonly JOBS = JOBS;
  readonly TRIBES = TRIBES;
  squadsList: string[] = [];

  // Custom Dropdown State
  isSquadDropdownOpen = false;
  dropdownRect = { top: 0, left: 0, width: 0 };
  @ViewChild('squadButton') squadButtonRef!: ElementRef;

  // Helper for template
  Math = Math;

  // User Pagination & Search
  userPage = 1;
  userPageSize = 10;
  userSearchQuery = '';

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadSquads();
  }

  async loadSquads(): Promise<void> {
    try {
      this.squadsList = await firstValueFrom(
        this.http.get<string[]>(`${this.API_URL}/squads`)
      );
    } catch (error) {
      console.error('Erreur lors du chargement des squads:', error);
      // Fallback static list in case of error
      this.squadsList = SQUADS;
    }
  }

  get filteredUsers(): AdminUser[] {
    if (!this.userSearchQuery) {
      return this.users;
    }
    const query = this.userSearchQuery.toLowerCase();
    return this.users.filter(user =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  get paginatedUsers(): AdminUser[] {
    const startIndex = (this.userPage - 1) * this.userPageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.userPageSize);
  }

  get totalUserPages(): number {
    return Math.ceil(this.filteredUsers.length / this.userPageSize);
  }

  get userPages(): number[] {
    const total = this.totalUserPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const current = this.userPage;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    if (start <= 2) end = Math.min(total, 5);
    if (end >= total - 1) start = Math.max(1, total - 4);
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  setUserPage(page: number): void {
    if (page >= 1 && page <= this.totalUserPages) {
      this.userPage = page;
    }
  }

  onUserSearch(): void {
    this.userPage = 1;
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

  async refreshUsers(): Promise<void> {
    await this.loadUsers();
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
      await this.loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      this.toastService.error('Erreur', 'Impossible de supprimer l\'utilisateur');
    }
  }

  async resetUserPassword(user: AdminUser): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Réinitialiser le mot de passe ?',
      message: `Voulez-vous vraiment réinitialiser le mot de passe de ${user.firstName} ${user.lastName} ?\n\nLe mot de passe sera défini sur "password".`,
      confirmText: 'Réinitialiser',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/users/${user.id}/reset-password`, {})
      );
      this.toastService.success('Succès', 'Mot de passe réinitialisé à "password"');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      this.toastService.error('Erreur', 'Impossible de réinitialiser le mot de passe');
    }
  }

  getRelativeTime(timestamp: string): string {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  }

  // Permissions management
  getPermissionModules(): PermissionModule[] {
    return ['CALENDAR', 'RELEASES', 'ADMIN', 'ABSENCE', 'PLAYGROUND'];
  }

  getModuleName(module: PermissionModule): string {
    const names: Record<PermissionModule, string> = {
      CALENDAR: 'Calendrier',
      RELEASES: 'Préparation des MEP',
      ADMIN: 'Administration',
      ABSENCE: 'Absence',
      PLAYGROUND: 'Playground'
    };
    return names[module];
  }

  getModuleIcon(module: PermissionModule): string {
    const icons: Record<PermissionModule, string> = {
      CALENDAR: 'event',
      RELEASES: 'rocket_launch',
      ADMIN: 'admin_panel_settings',
      ABSENCE: 'beach_access',
      PLAYGROUND: 'science'
    };
    return icons[module];
  }

  getModuleDescription(module: PermissionModule): string {
    const descriptions: Record<PermissionModule, string> = {
      CALENDAR: 'Gestion des événements du calendrier trimestriel',
      RELEASES: 'Gestion des releases, squads, features et actions',
      ADMIN: 'Accès à l\'administration (gestion des utilisateurs, export/import)',
      ABSENCE: 'Gestion des congés, formations et télétravail',
      PLAYGROUND: 'Accès au Playground'
    };
    return descriptions[module];
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

  // User details editing methods
  editUserDetails(user: AdminUser): void {
    this.editingUserDetails = user;
    this.editedUserDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      metier: user.metier,
      tribu: user.tribu,
      squads: user.squads ? [...user.squads] : [],
      interne: user.interne ?? false
    };
  }

  closeUserDetailsModal(): void {
    this.editingUserDetails = null;
    this.editedUserDetails = {};
    this.isSquadDropdownOpen = false;
  }

  async saveUserDetails(): Promise<void> {
    if (!this.editingUserDetails) return;

    this.isSavingUserDetails = true;
    try {
      await firstValueFrom(
        this.http.put<AdminUser>(`${this.API_URL}/users/${this.editingUserDetails.id}`, this.editedUserDetails)
      );

      this.toastService.success('Utilisateur mis à jour', 'Les informations ont été modifiées avec succès');
      this.closeUserDetailsModal();
      await this.loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      this.toastService.error('Erreur', 'Impossible de mettre à jour l\'utilisateur');
    } finally {
      this.isSavingUserDetails = false;
    }
  }

  // Custom Squad Dropdown Methods
  toggleSquadDropdown(event: Event): void {
    event.stopPropagation();
    if (this.isSquadDropdownOpen) {
      this.closeSquadDropdown();
    } else {
      this.openSquadDropdown();
    }
  }

  openSquadDropdown(): void {
    const rect = this.squadButtonRef.nativeElement.getBoundingClientRect();
    this.dropdownRect = {
      top: rect.bottom,
      left: rect.left,
      width: rect.width
    };
    this.isSquadDropdownOpen = true;
  }

  closeSquadDropdown(): void {
    this.isSquadDropdownOpen = false;
  }

  toggleSquad(squad: string, event: Event): void {
    event.stopPropagation();
    if (!this.editedUserDetails.squads) {
      this.editedUserDetails.squads = [];
    }

    const index = this.editedUserDetails.squads.indexOf(squad);
    if (index > -1) {
      this.editedUserDetails.squads.splice(index, 1);
    } else {
      this.editedUserDetails.squads.push(squad);
    }
  }
}
