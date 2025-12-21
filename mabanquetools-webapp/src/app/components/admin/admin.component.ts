import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';
import { PermissionService, PermissionModule, PermissionLevel, UserPermissions } from '@services/permission.service';
import { Sprint } from '@models/sprint.model';
import { SprintService } from '@services/sprint.service';
import { EventService } from '@services/event.service';

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
  metier?: string;
  tribu?: string;
  interne: boolean;
  squads?: string[];
}

const JOBS = ['AFN2', 'BA', 'Back', 'Fonctionnement', 'Front', 'iOS', 'LP', 'PO', 'RM', 'SM', 'Suivi des 15C', 'Suivi des 15F', 'Test', 'Ui', 'UX/UI'];
const TRIBES = ['ChDF', 'ChUX', 'Ma Banque', 'Autre'];
const SQUADS = ['Squad 1', 'Squad 2', 'Squad 3', 'Squad 4', 'Squad 5', 'Squad 6', 'ADAM', 'Transverse'];

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

      <!-- Sprint Management -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="material-icons text-2xl text-teal-600 dark:text-teal-400">rocket_launch</span>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Sprints</h2>
            </div>
            <button (click)="openCreateSprintModal()" class="btn btn-primary flex items-center space-x-2">
                <span class="material-icons text-sm">add</span>
                <span>Nouveau Sprint</span>
            </button>
        </div>

        <div *ngIf="sprints.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun sprint planifié
        </div>

        <div *ngIf="otherSprints.length === 0 && !currentSprint" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun sprint planifié
        </div>

        <div *ngIf="sprints.length > 0" class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Début</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fin</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Freeze</th>
                         <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">MEP Back</th>
                         <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">MEP Front</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <!-- Current Sprint Pinned Row -->
                <tbody *ngIf="currentSprint" class="bg-amber-50/50 dark:bg-amber-900/10 border-b-2 border-amber-100 dark:border-amber-800">
                     <tr class="hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div class="flex items-center space-x-2">
                                <span>{{ currentSprint.name }}</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    En cours
                                </span>
                                <span *ngIf="isFreezeWeek(currentSprint)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Freeze Week
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ currentSprint.startDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ currentSprint.endDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">ac_unit</span>
                                <span>{{ currentSprint.codeFreezeDate | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-gray-600 dark:text-blue-gray-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ currentSprint.releaseDateBack | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ currentSprint.releaseDateFront | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button (click)="editSprint(currentSprint)" class="text-teal-600 hover:text-teal-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                <span class="material-icons">edit</span>
                            </button>
                            <button (click)="deleteSprint(currentSprint)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <span class="material-icons">delete</span>
                            </button>
                        </td>
                    </tr>
                </tbody>

                <!-- Other Sprints -->
                <tbody class="divide-y divide-gray-200 dark:divide-gray-600 border-t border-gray-200 dark:border-gray-600">
                    <tr *ngFor="let sprint of paginatedSprints" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ sprint.name }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ sprint.startDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ sprint.endDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">ac_unit</span>
                                <span>{{ sprint.codeFreezeDate | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-gray-600 dark:text-blue-gray-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ sprint.releaseDateBack | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ sprint.releaseDateFront | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button (click)="editSprint(sprint)" class="text-teal-600 hover:text-teal-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                <span class="material-icons">edit</span>
                            </button>
                            <button (click)="deleteSprint(sprint)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <span class="material-icons">delete</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Sprint Pagination Controls -->
        <div *ngIf="totalSprintPages > 1" class="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div class="flex-1 flex justify-between sm:hidden">
                <button (click)="setSprintPage(sprintPage - 1)" [disabled]="sprintPage === 1" class="btn btn-secondary btn-sm">Précédent</button>
                <button (click)="setSprintPage(sprintPage + 1)" [disabled]="sprintPage === totalSprintPages" class="btn btn-secondary btn-sm">Suivant</button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        Affichage de <span class="font-medium">{{ (sprintPage - 1) * sprintPageSize + 1 }}</span> à <span class="font-medium">{{ Math.min(sprintPage * sprintPageSize, otherSprints.length) }}</span> sur <span class="font-medium">{{ otherSprints.length }}</span> résultats
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button (click)="setSprintPage(sprintPage - 1)" [disabled]="sprintPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="material-icons text-sm">chevron_left</span>
                        </button>
                        <button *ngFor="let p of sprintPages" (click)="setSprintPage(p)"
                            [class.bg-indigo-50]="p === sprintPage" 
                            [class.dark:bg-indigo-900]="p === sprintPage" 
                            [class.text-indigo-600]="p === sprintPage" 
                            [class.dark:text-indigo-300]="p === sprintPage"
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                            {{ p }}
                        </button>
                        <button (click)="setSprintPage(sprintPage + 1)" [disabled]="sprintPage === totalSprintPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="material-icons text-sm">chevron_right</span>
                        </button>
                    </nav>
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
                        
                        <!-- Simple pagination logic: show all if <= 7 pages, else simplistic view (can be enhanced) -->
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
        <div class="modal-content max-w-lg fade-in-scale" (click)="$event.stopPropagation()">
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

                        <!-- Dropdown removed from here, moved to root -->
                        <div *ngIf="isSquadDropdownOpen" (click)="closeSquadDropdown()" class="fixed inset-0 z-50 cursor-default bg-transparent"></div>
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
    </div>

    <!-- Sprint Modal -->
    <div *ngIf="isSprintModalOpen" class="modal-overlay" (click)="closeSprintModal()">
        <div class="modal-content max-w-lg fade-in-scale" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="modal-header-glass">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-3">
                        <span class="material-icons text-2xl text-indigo-600 dark:text-indigo-400">rocket_launch</span>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ editingSprint ? 'Modifier le sprint' : 'Nouveau sprint' }}</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Configuration des dates clés</p>
                        </div>
                    </div>
                    <button (click)="closeSprintModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Sprint</label>
                    <input type="text" [(ngModel)]="editedSprint.name" class="input" placeholder="ex: Sprint 24.01">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                        <input type="date" [(ngModel)]="editedSprint.startDate" class="input">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                        <input type="date" [(ngModel)]="editedSprint.endDate" class="input">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Code Freeze</label>
                        <input type="date" [(ngModel)]="editedSprint.codeFreezeDate" class="input border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                         <!-- Spacer or empty -->
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-blue-gray-600 dark:text-blue-gray-400 mb-1">MEP Back</label>
                        <input type="date" [(ngModel)]="editedSprint.releaseDateBack" class="input border-blue-gray-200 focus:border-blue-gray-500 focus:ring-blue-gray-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">MEP Front</label>
                        <input type="date" [(ngModel)]="editedSprint.releaseDateFront" class="input border-green-200 focus:border-green-500 focus:ring-green-500">
                    </div>
                </div>
                 <div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div class="flex items-start space-x-2">
                        <span class="material-icons text-sm text-blue-500 mt-0.5">info</span>
                        <span>Les événements "Code Freeze" et "Mise en production" seront automatiquement créés dans le calendrier.</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
             <div class="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
                <button (click)="closeSprintModal()" class="btn btn-secondary">Annuler</button>
                <button (click)="saveSprint()" [disabled]="isSavingSprint" class="btn btn-primary flex items-center space-x-2">
                    <span class="material-icons text-sm" [class.animate-spin]="isSavingSprint">
                        {{ isSavingSprint ? 'refresh' : 'save' }}
                    </span>
                    <span>{{ isSavingSprint ? 'Enregistrement...' : 'Enregistrer' }}</span>
                </button>
            </div>
        </div>
    </div>


    <!-- Global Squad Dropdown -->
    <div *ngIf="isSquadDropdownOpen" 
            class="fixed z-[9999] mt-1 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
            [style.top.px]="dropdownRect.top"
            [style.left.px]="dropdownRect.left"
            [style.width.px]="dropdownRect.width">
        <div *ngFor="let squad of SQUADS"
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

  // User details editing
  editingUserDetails: AdminUser | null = null;
  editedUserDetails: Partial<AdminUser> = {};
  isSavingUserDetails = false;

  readonly JOBS = JOBS;
  readonly TRIBES = TRIBES;
  readonly SQUADS = SQUADS;

  // Sprint management
  sprints: Sprint[] = [];
  editingSprint: Sprint | null = null;
  editedSprint: Partial<Sprint> = {};
  isSavingSprint = false;
  isSprintModalOpen = false;

  // Custom Dropdown State
  isSquadDropdownOpen = false;
  dropdownRect = { top: 0, left: 0, width: 0 };
  @ViewChild('squadButton') squadButtonRef!: ElementRef;

  // Helper for template
  Math = Math;

  // Sprint Pagination
  sprintPage = 1;
  sprintPageSize = 4;

  get currentSprint(): Sprint | undefined {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today

    return this.sprints.find(sprint => {
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      // Normalize comparison dates if strictly needed, but JS Date comparison usually works with timestamps.
      // Assuming sprint dates are YYYY-MM-DD string, new Date('YYYY-MM-DD') creates UTC midnight or local depending on parsing.
      // Usually, comparing timestamps is safer.
      return new Date(sprint.startDate) <= today && new Date(sprint.endDate) >= today;
    });
  }

  get otherSprints(): Sprint[] {
    const current = this.currentSprint;
    if (!current) return this.sprints;
    return this.sprints.filter(s => s.id !== current.id);
  }

  get paginatedSprints(): Sprint[] {
    const startIndex = (this.sprintPage - 1) * this.sprintPageSize;
    return this.otherSprints.slice(startIndex, startIndex + this.sprintPageSize);
  }

  get totalSprintPages(): number {
    return Math.ceil(this.otherSprints.length / this.sprintPageSize);
  }

  get sprintPages(): number[] {
    return Array.from({ length: this.totalSprintPages }, (_, i) => i + 1);
  }

  isFreezeWeek(sprint: Sprint): boolean {
    const today = new Date();
    const freeze = new Date(sprint.codeFreezeDate);
    // Simple check: is today >= freeze AND < release?
    // Or is "Freeze Week" specifically the week of the freeze date?
    // Let's assume Freeze Week means we are currently IN the week leading up to or following freeze,
    // usually between Freeze and Release is "Freeze Period".
    // Using Front release date as the end of the sprint/freeze period
    const release = new Date(sprint.releaseDateFront);
    return today >= freeze && today <= release;
  }

  setSprintPage(page: number): void {
    if (page >= 1 && page <= this.totalSprintPages) {
      this.sprintPage = page;
    }
  }

  // User Pagination & Search
  userPage = 1;
  userPageSize = 10;
  userSearchQuery = '';

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
    // Show limited pages if too many
    const total = this.totalUserPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Simple windowed pagination around current page
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

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private permissionService: PermissionService,
    private sprintService: SprintService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    await Promise.all([
      this.loadUsers(),
      this.loadStats(),
      this.loadSprints()
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
    return ['CALENDAR', 'RELEASES', 'ADMIN', 'ABSENCE', 'PLAYGROUND'];
  }

  getModuleShortName(module: PermissionModule): string {
    const names: Record<PermissionModule, string> = {
      CALENDAR: 'CAL',
      RELEASES: 'REL',
      ADMIN: 'ADM',
      ABSENCE: 'ABS',
      PLAYGROUND: 'PLAY'
    };
    return names[module];
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

  // User details editing methods
  editUserDetails(user: AdminUser): void {
    this.editingUserDetails = user;
    this.editedUserDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      metier: user.metier,
      tribu: user.tribu,
      squads: user.squads ? [...user.squads] : []
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

  // Sprint Management Methods
  async loadSprints(): Promise<void> {
    try {
      this.sprints = await firstValueFrom(this.sprintService.getAllSprints());
    } catch (error) {
      console.error('Erreur lors du chargement des sprints:', error);
      this.toastService.error('Erreur', 'Impossible de charger les sprints');
    }
  }

  openCreateSprintModal(): void {
    this.editingSprint = null;
    this.editedSprint = {
      name: '',
      startDate: '',
      endDate: '',
      codeFreezeDate: '',
      releaseDateBack: '',
      releaseDateFront: ''
    };
    this.isSprintModalOpen = true;
  }

  editSprint(sprint: Sprint): void {
    this.editingSprint = sprint;
    this.editedSprint = { ...sprint };
    this.isSprintModalOpen = true;
  }

  closeSprintModal(): void {
    this.isSprintModalOpen = false;
    this.editingSprint = null;
    this.editedSprint = {};
  }

  async saveSprint(): Promise<void> {
    if (!this.editedSprint.name || !this.editedSprint.startDate || !this.editedSprint.endDate || !this.editedSprint.codeFreezeDate || !this.editedSprint.releaseDateBack || !this.editedSprint.releaseDateFront) {
      this.toastService.warning('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSavingSprint = true;
    try {
      if (this.editingSprint) {
        await firstValueFrom(this.sprintService.updateSprint(this.editingSprint.id, this.editedSprint));
        this.toastService.success('Sprint modifié', 'Le sprint a été mis à jour avec succès');
      } else {
        await firstValueFrom(this.sprintService.createSprint(this.editedSprint as Sprint));
        this.toastService.success('Sprint créé', 'Le sprint a été créé avec succès');
      }
      await this.eventService.refreshEvents();
      this.closeSprintModal();
      await this.loadSprints();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du sprint:', error);
      this.toastService.error('Erreur', 'Impossible de sauvegarder le sprint');
    } finally {
      this.isSavingSprint = false;
    }
  }

  async deleteSprint(sprint: Sprint): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer ce sprint ?',
      message: `${sprint.name}\n\nAttention: Cela supprimera également les événements "Freeze" et "MEP" associés.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      await firstValueFrom(this.sprintService.deleteSprint(sprint.id));
      await this.eventService.refreshEvents();
      this.toastService.success('Sprint supprimé', 'Le sprint a été supprimé avec succès');
      await this.loadSprints();
    } catch (error) {
      console.error('Erreur lors de la suppression du sprint:', error);
      this.toastService.error('Erreur', 'Impossible de supprimer le sprint');
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
    // Don't close dropdown to allow multiple selections
  }
}
