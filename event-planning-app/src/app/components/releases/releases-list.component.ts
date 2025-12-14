import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { CanAccessDirective } from '@directives/can-access.directive';
import {
  Release,
  STATUS_LABELS,
  STATUS_COLORS,
  RELEASE_TYPE_LABELS,
  RELEASE_TYPE_COLORS,
  ReleaseType,
  Action,
  ActionType,
  Feature,
  FlippingType,
  FeatureFlipping,
  VersionCondition
} from '@models/release.model';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProgressRingComponent } from '../shared/progress-ring.component';

@Component({
  selector: 'app-releases-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressRingComponent, CanAccessDirective],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-end mb-2">
        <button
          appCanAccess="RELEASES"
          accessLevel="write"
          (click)="showCreateModal = true"
          class="btn btn-primary flex items-center space-x-2 px-6 py-3"
        >
          <span class="material-icons text-xl">add_circle</span>
          <span class="text-base">Nouvelle Release</span>
        </button>
      </div>

      <!-- Upcoming Releases Section -->
      <div *ngIf="upcomingReleases.length > 0">
        <div class="flex items-center space-x-3 mb-4">
          <span class="material-icons text-2xl text-primary-600 dark:text-primary-400">upcoming</span>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">MEP à venir</h2>
          <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-semibold">
            {{ upcomingReleases.length }}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            *ngFor="let release of upcomingReleases"
            class="card-releases p-6 cursor-pointer relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]"
          [class.hover:border-emerald-500]="release.type === 'release'"
          [class.hover:border-red-500]="release.type === 'hotfix'"
          (click)="viewRelease(release.id!)"
        >
          <!-- Type Badge -->
          <div class="absolute top-0 right-0 z-10">
            <span [class]="getReleaseTypeColors(release.type).badge"
                  class="inline-flex items-center space-x-1 px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold shadow-sm">
              <span class="material-icons text-sm">
                {{ release.type === 'hotfix' ? 'build_circle' : 'rocket_launch' }}
              </span>
              <span>{{ getReleaseTypeLabel(release.type) }}</span>
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="absolute top-12 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
            <button
              appCanAccess="RELEASES"
              accessLevel="write"
              (click)="startEditingDate(release, $event)"
              class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 hover:scale-110"
              title="Modifier la release"
            >
              <span class="material-icons text-lg">edit</span>
            </button>
            <button
              appCanAccess="RELEASES"
              accessLevel="write"
              (click)="deleteRelease($event, release)"
              class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
              title="Supprimer la release"
            >
              <span class="material-icons text-lg">delete</span>
            </button>
          </div>

          <!-- Header -->
          <div class="flex items-start justify-between mb-4 pt-12 pr-8">
            <div class="flex-1">
              <h3 [class]="getReleaseTypeColors(release.type).text"
                  class="text-xl font-bold mb-1">
                {{ release.name }}
              </h3>
            </div>
          </div>

          <!-- Date avec badge J-X -->
          <div class="flex items-center justify-between text-sm mb-4">
            <div class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <span class="material-icons text-sm text-gray-500 dark:text-gray-400">event</span>
              <span class="font-medium">{{ formatDate(release.releaseDate) }}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  [class.bg-amber-100]="getDaysUntilMep(release.releaseDate) <= 7 && getDaysUntilMep(release.releaseDate) >= 0"
                  [class.text-amber-800]="getDaysUntilMep(release.releaseDate) <= 7 && getDaysUntilMep(release.releaseDate) >= 0"
                  [class.dark:bg-amber-900]="getDaysUntilMep(release.releaseDate) <= 7 && getDaysUntilMep(release.releaseDate) >= 0"
                  [class.dark:text-amber-200]="getDaysUntilMep(release.releaseDate) <= 7 && getDaysUntilMep(release.releaseDate) >= 0"
                  [class.bg-primary-100]="getDaysUntilMep(release.releaseDate) > 7"
                  [class.text-primary-800]="getDaysUntilMep(release.releaseDate) > 7"
                  [class.dark:bg-primary-900]="getDaysUntilMep(release.releaseDate) > 7"
                  [class.dark:text-primary-200]="getDaysUntilMep(release.releaseDate) > 7"
                  [class.bg-gray-100]="getDaysUntilMep(release.releaseDate) < 0"
                  [class.text-gray-600]="getDaysUntilMep(release.releaseDate) < 0"
                  [class.dark:bg-gray-700]="getDaysUntilMep(release.releaseDate) < 0"
                  [class.dark:text-gray-400]="getDaysUntilMep(release.releaseDate) < 0">
              J{{ getDaysUntilMep(release.releaseDate) >= 0 ? '-' : '+' }}{{ Math.abs(getDaysUntilMep(release.releaseDate)) }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2" *ngIf="release.description">
            {{ release.description }}
          </p>

          <!-- Progress Ring & Stats -->
          <div class="flex items-center justify-between mb-4" *ngIf="release.squads.length > 0">
            <div class="flex-1">
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span class="font-medium">Progression</span>
                <span class="font-bold">{{ getCompletedSquads(release) }}/{{ release.squads.length }} squads</span>
              </div>
            </div>

            <!-- Progress Ring -->
            <div class="ml-4">
              <app-progress-ring
                [percentage]="getProgressPercentage(release)"
                [size]="72"
                [strokeWidth]="6"
                [color]="getProgressPercentage(release) === 100 ? 'success' : (getProgressPercentage(release) >= 70 ? 'primary' : 'warning')"
                [customColor]="release.type === 'hotfix' ? '#ef4444' : undefined"
                [textClass]="getReleaseTypeColors(release.type).text"
              ></app-progress-ring>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">

            <!-- Export Button -->
            <div class="relative" (click)="$event.stopPropagation()">
              <button
                appCanAccess="RELEASES"
                accessLevel="read"
                (click)="toggleExportMenu(release.id!)"
                class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Exporter la release"
              >
                <span class="material-icons text-sm">download</span>
                <span>Export</span>
              </button>

              <!-- Export Dropdown -->
              <div
                *ngIf="exportMenuOpen === release.id"
                class="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
              >
                <button
                  (click)="exportRelease(release, 'markdown')"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex items-center space-x-2"
                >
                  <span class="material-icons text-sm">description</span>
                  <span>Markdown</span>
                </button>
                <button
                  (click)="exportRelease(release, 'html')"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors flex items-center space-x-2"
                >
                  <span class="material-icons text-sm">code</span>
                  <span>HTML</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Past Releases Section -->
      <div *ngIf="pastReleases.length > 0">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <span class="material-icons text-2xl text-gray-600 dark:text-gray-400">history</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Releases passées</h2>
            <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold">
              {{ pastReleases.length }}
            </span>
          </div>
          <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span class="material-icons" style="font-size: 14px;">info</span>
            <span>Historique conservé : 20 dernières releases</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let release of pastReleases"
            class="card-releases p-6 cursor-pointer relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] opacity-60 hover:opacity-90"
            [class.hover:border-emerald-500]="release.type === 'release'"
            [class.hover:border-red-500]="release.type === 'hotfix'"
            (click)="viewRelease(release.id!)"
          >
            <!-- Type Badge -->
            <div class="absolute top-0 right-0 z-10">
              <span [class]="getReleaseTypeColors(release.type).badge"
                    class="inline-flex items-center space-x-1 px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold shadow-sm">
                <span class="material-icons text-sm">
                  {{ release.type === 'hotfix' ? 'build_circle' : 'rocket_launch' }}
                </span>
                <span>{{ getReleaseTypeLabel(release.type) }}</span>
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="absolute top-12 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
              <button
                appCanAccess="RELEASES"
                accessLevel="write"
                (click)="startEditingDate(release, $event)"
                class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                title="Modifier la release"
              >
                <span class="material-icons text-lg">edit</span>
              </button>
              <button
                appCanAccess="RELEASES"
                accessLevel="write"
                (click)="deleteRelease($event, release)"
                class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                title="Supprimer la release"
              >
                <span class="material-icons text-lg">delete</span>
              </button>
            </div>

            <!-- Header -->
            <div class="flex items-start justify-between mb-4 pt-12 pr-8">
              <div class="flex-1">
                <h3 [class]="getReleaseTypeColors(release.type).text"
                    class="text-xl font-bold mb-1">
                  {{ release.name }}
                </h3>
              </div>
            </div>

            <!-- Date avec badge J+X -->
            <div class="flex items-center justify-between text-sm mb-4">
              <div class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <span class="material-icons text-sm text-gray-500 dark:text-gray-400">event</span>
                <span class="font-medium">{{ formatDate(release.releaseDate) }}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                J+{{ Math.abs(getDaysUntilMep(release.releaseDate)) }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2" *ngIf="release.description">
              {{ release.description }}
            </p>

            <!-- Progress Ring & Stats -->
            <div class="flex items-center justify-between mb-4" *ngIf="release.squads.length > 0">
              <div class="flex-1">
                <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span class="font-medium">Progression</span>
                  <span class="font-bold">{{ getCompletedSquads(release) }}/{{ release.squads.length }} squads</span>
                </div>
              </div>

              <!-- Progress Ring -->
              <div class="ml-4">
                <app-progress-ring
                  [percentage]="getProgressPercentage(release)"
                  [size]="72"
                  [strokeWidth]="6"
                  [color]="getProgressPercentage(release) === 100 ? 'success' : (getProgressPercentage(release) >= 70 ? 'primary' : 'warning')"
                  [customColor]="release.type === 'hotfix' ? '#ef4444' : undefined"
                  [textClass]="getReleaseTypeColors(release.type).text"
                ></app-progress-ring>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <!-- Export Button -->
              <div class="relative" (click)="$event.stopPropagation()">
                <button
                  appCanAccess="RELEASES"
                  accessLevel="read"
                  (click)="toggleExportMenu(release.id!)"
                  class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Exporter la release"
                >
                  <span class="material-icons text-sm">download</span>
                  <span>Export</span>
                </button>

                <!-- Export Dropdown -->
                <div
                  *ngIf="exportMenuOpen === release.id"
                  class="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
                >
                  <button
                    (click)="exportRelease(release, 'markdown')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex items-center space-x-2"
                  >
                    <span class="material-icons text-sm">description</span>
                    <span>Markdown</span>
                  </button>
                  <button
                    (click)="exportRelease(release, 'html')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors flex items-center space-x-2"
                  >
                    <span class="material-icons text-sm">code</span>
                    <span>HTML</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="upcomingReleases.length === 0 && pastReleases.length === 0"
        class="col-span-full flex flex-col items-center justify-center py-12 text-center"
      >
        <span class="material-icons text-6xl text-gray-400 dark:text-gray-600 mb-4">rocket_launch</span>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucune release
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Commencez par créer votre première release pour organiser votre MEP
        </p>
        <button
          appCanAccess="RELEASES"
          accessLevel="write"
          (click)="showCreateModal = true"
          class="btn btn-primary"
        >
          Créer une release
        </button>
      </div>

      <!-- Create Modal -->
      <div
        *ngIf="showCreateModal"
        class="modal-overlay"
        (click)="showCreateModal = false"
      >
        <div
          class="modal-content max-w-md fade-in-scale"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header-glass">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span class="material-icons text-primary-600 dark:text-primary-400">add_circle</span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Nouvelle Release
              </h2>
            </div>
            <button
              (click)="showCreateModal = false"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
            </button>
          </div>

          <form (submit)="createRelease($event)" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la release
              </label>
              <input
                type="text"
                [(ngModel)]="newRelease.name"
                name="name"
                required
                class="input"
                placeholder="Ex: Release v40.5 - Sprint 2024.12"
              />
            </div>

            <!-- Type selector with visual feedback -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de déploiement
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="newRelease.type = 'release'"
                  [class.bg-gradient-to-br]="newRelease.type === 'release'"
                  [class.from-emerald-500]="newRelease.type === 'release'"
                  [class.to-emerald-600]="newRelease.type === 'release'"
                  [class.text-white]="newRelease.type === 'release'"
                  [class.border-emerald-600]="newRelease.type === 'release'"
                  [class.shadow-lg]="newRelease.type === 'release'"
                  [class.scale-105]="newRelease.type === 'release'"
                  [class.bg-white]="newRelease.type !== 'release'"
                  [class.dark:bg-gray-800]="newRelease.type !== 'release'"
                  [class.text-gray-700]="newRelease.type !== 'release'"
                  [class.dark:text-gray-300]="newRelease.type !== 'release'"
                  [class.border-gray-300]="newRelease.type !== 'release'"
                  [class.dark:border-gray-600]="newRelease.type !== 'release'"
                  [class.hover:border-emerald-400]="newRelease.type !== 'release'"
                  class="flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                >
                  <span class="material-icons text-3xl mb-2">rocket_launch</span>
                  <span class="font-semibold">Release</span>
                  <span class="text-xs mt-1 opacity-80">Déploiement standard</span>
                </button>

                <button
                  type="button"
                  (click)="newRelease.type = 'hotfix'"
                  [class.bg-gradient-to-br]="newRelease.type === 'hotfix'"
                  [class.from-red-500]="newRelease.type === 'hotfix'"
                  [class.to-rose-600]="newRelease.type === 'hotfix'"
                  [class.text-white]="newRelease.type === 'hotfix'"
                  [class.border-red-600]="newRelease.type === 'hotfix'"
                  [class.shadow-lg]="newRelease.type === 'hotfix'"
                  [class.scale-105]="newRelease.type === 'hotfix'"
                  [class.bg-white]="newRelease.type !== 'hotfix'"
                  [class.dark:bg-gray-800]="newRelease.type !== 'hotfix'"
                  [class.text-gray-700]="newRelease.type !== 'hotfix'"
                  [class.dark:text-gray-300]="newRelease.type !== 'hotfix'"
                  [class.border-gray-300]="newRelease.type !== 'hotfix'"
                  [class.dark:border-gray-600]="newRelease.type !== 'hotfix'"
                  [class.hover:border-red-400]="newRelease.type !== 'hotfix'"
                  class="flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                >
                  <span class="material-icons text-3xl mb-2">build_circle</span>
                  <span class="font-semibold">Hotfix</span>
                  <span class="text-xs mt-1 opacity-80">Correction urgente</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de MEP
              </label>
              <input
                type="date"
                [(ngModel)]="newRelease.releaseDate"
                name="releaseDate"
                required
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optionnel)
              </label>
              <textarea
                [(ngModel)]="newRelease.description"
                name="description"
                rows="3"
                class="input"
                placeholder="Description de la release..."
              ></textarea>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                (click)="showCreateModal = false"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                appCanAccess="RELEASES"
                accessLevel="write"
                class="btn btn-primary"
                [disabled]="isCreating"
              >
                {{ isCreating ? 'Création...' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Release Modal -->
      <div
        *ngIf="showEditDateModal"
        class="modal-overlay"
        (click)="cancelEditRelease()"
      >
        <div
          class="modal-content max-w-md fade-in-scale"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header-glass">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span class="material-icons text-primary-600 dark:text-primary-400">edit</span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Modifier la release
              </h2>
            </div>
            <button
              (click)="cancelEditRelease()"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
            </button>
          </div>

          <form (submit)="saveRelease($event)" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la release
              </label>
              <input
                type="text"
                [(ngModel)]="newReleaseName"
                name="releaseName"
                required
                class="input"
                placeholder="Nom de la release"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de MEP
              </label>
              <input
                type="date"
                [(ngModel)]="newMepDate"
                name="newDate"
                required
                class="input"
              />
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                (click)="cancelEditRelease()"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                appCanAccess="RELEASES"
                accessLevel="write"
                class="btn btn-primary"
                [disabled]="isUpdatingDate"
              >
                {{ isUpdatingDate ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </form>
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
export class ReleasesListComponent implements OnInit {
  releases$ = this.releaseService.releases$;
  upcomingReleases: Release[] = [];
  pastReleases: Release[] = [];

  showCreateModal = false;
  isCreating = false;
  exportMenuOpen: string | null = null;

  showEditDateModal = false;
  isUpdatingDate = false;
  editingRelease: Release | null = null;
  newMepDate = '';
  newReleaseName = '';

  newRelease: any = {
    name: '',
    version: '',
    releaseDate: '',
    type: 'release' as ReleaseType,
    description: ''
  };

  STATUS_LABELS = STATUS_LABELS;
  STATUS_COLORS = STATUS_COLORS;
  RELEASE_TYPE_LABELS = RELEASE_TYPE_LABELS;
  RELEASE_TYPE_COLORS = RELEASE_TYPE_COLORS;
  Math = Math;

  constructor(
    private releaseService: ReleaseService,
    private router: Router,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.releaseService.loadReleases();

    // Subscribe to releases and split them into upcoming and past
    this.releases$.subscribe(releases => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Upcoming releases: sorted by closest date first
      this.upcomingReleases = releases
        .filter(release => {
          const releaseDate = new Date(release.releaseDate);
          releaseDate.setHours(0, 0, 0, 0);
          return releaseDate >= today;
        })
        .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

      // Past releases: sorted by most recent first
      this.pastReleases = releases
        .filter(release => {
          const releaseDate = new Date(release.releaseDate);
          releaseDate.setHours(0, 0, 0, 0);
          return releaseDate < today;
        })
        .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    });
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  getTotalActions(release: Release): number {
    return release.squads.reduce((total, squad) => total + squad.actions.length, 0);
  }

  getTotalFeatures(release: Release): number {
    return release.squads.reduce((total, squad) => total + squad.features.length, 0);
  }

  getCompletedSquads(release: Release): number {
    return release.squads.filter(squad => squad.isCompleted).length;
  }

  getProgressPercentage(release: Release): number {
    const totalSquads = release.squads.length;
    if (totalSquads === 0) return 0;
    return Math.round((this.getCompletedSquads(release) / totalSquads) * 100);
  }

  getDaysUntilMep(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mepDate = new Date(dateString);
    mepDate.setHours(0, 0, 0, 0);
    return Math.ceil((mepDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  hasIncompleteSquads(release: Release): boolean {
    return release.squads.some(squad => !squad.isCompleted);
  }

  shouldShowAlert(release: Release): boolean {
    const daysUntil = this.getDaysUntilMep(release.releaseDate);
    return daysUntil >= 0 && daysUntil <= 6 && this.hasIncompleteSquads(release);
  }

  getReleaseTypeLabel(type: ReleaseType): string {
    return this.RELEASE_TYPE_LABELS[type || 'release'];
  }

  getReleaseTypeColors(type: ReleaseType): { gradient: string; badge: string; text: string } {
    return this.RELEASE_TYPE_COLORS[type || 'release'];
  }

  viewRelease(id: string): void {
    this.router.navigate(['/releases', id]);
  }

  navigateToHistory(): void {
    this.router.navigate(['/release-history']);
  }

  startEditingDate(release: Release, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.editingRelease = release;
    this.newMepDate = release.releaseDate;
    this.newReleaseName = release.name;
    this.showEditDateModal = true;
  }

  cancelEditRelease(): void {
    this.showEditDateModal = false;
    this.editingRelease = null;
    this.newMepDate = '';
    this.newReleaseName = '';
  }

  async saveRelease(event: Event): Promise<void> {
    event.preventDefault();

    if (this.isUpdatingDate || !this.editingRelease) return;

    try {
      this.isUpdatingDate = true;
      const oldName = this.editingRelease.name;
      const oldDate = this.formatDate(this.editingRelease.releaseDate);
      const newDate = this.formatDate(this.newMepDate);

      const updates: any = {};
      let changeMessages: string[] = [];

      // Check if name changed
      if (this.newReleaseName !== oldName) {
        updates.name = this.newReleaseName;
        changeMessages.push(`nom changé de "${oldName}" à "${this.newReleaseName}"`);
      }

      // Check if date changed
      if (this.newMepDate !== this.editingRelease.releaseDate) {
        updates.releaseDate = this.newMepDate;
        changeMessages.push(`date changée du ${oldDate} au ${newDate}`);
      }

      if (changeMessages.length === 0) {
        this.cancelEditRelease();
        return;
      }

      await this.releaseService.updateRelease(this.editingRelease.id!, updates);

      this.toastService.success(
        'Release mise à jour',
        changeMessages.join(' et ')
      );

      this.cancelEditRelease();
    } catch (error) {
      console.error('Error updating release:', error);
      this.toastService.error(
        'Erreur de mise à jour',
        'Impossible de mettre à jour la release. Veuillez réessayer.'
      );
    } finally {
      this.isUpdatingDate = false;
    }
  }

  async createRelease(event: Event): Promise<void> {
    event.preventDefault();

    if (this.isCreating) return;

    if (!this.newRelease.name || !this.newRelease.releaseDate) {
      this.toastService.error('Erreur', 'Le nom et la date sont obligatoires');
      return;
    }

    try {
      this.isCreating = true;
      const release = await this.releaseService.createRelease(this.newRelease);

      // Reset form
      this.newRelease = {
        name: '',
        version: '',
        releaseDate: '',
        type: 'release' as ReleaseType,
        description: ''
      };

      this.showCreateModal = false;

      // Show success toast
      this.toastService.success(
        'Release créée',
        `${release.name} a été créée avec succès`
      );

      // Navigate to the new release
      this.router.navigate(['/releases', release.id]);
    } catch (error) {
      console.error('Error creating release:', error);
      this.toastService.error(
        'Erreur de création',
        'Impossible de créer la release. Veuillez réessayer.'
      );
    } finally {
      this.isCreating = false;
    }
  }

  async deleteRelease(event: Event, release: Release): Promise<void> {
    event.stopPropagation(); // Empêcher la navigation vers le détail

    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer la release',
      message: `Êtes-vous sûr de vouloir supprimer "${release.name}" ? Cette action est irréversible et supprimera toutes les squads, features et actions associées.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      await this.releaseService.deleteRelease(release.id!);

      this.toastService.success(
        'Release supprimée',
        `${release.name} a été supprimée définitivement`
      );
    } catch (error) {
      console.error('Error deleting release:', error);
      this.toastService.error(
        'Erreur de suppression',
        'Impossible de supprimer la release. Veuillez réessayer.'
      );
    }
  }

  toggleExportMenu(releaseId: string): void {
    this.exportMenuOpen = this.exportMenuOpen === releaseId ? null : releaseId;
  }

  exportRelease(release: Release, format: 'markdown' | 'html'): void {
    this.exportMenuOpen = null;

    let content = '';
    const fileName = `${release.name.replace(/\s+/g, '_')}`;

    if (format === 'markdown') {
      content = this.generateMarkdown(release);
      this.downloadFile(content, `${fileName}.md`, 'text/markdown');
    } else {
      content = this.generateHTML(release);
      this.downloadFile(content, `${fileName}.html`, 'text/html');
    }
  }

  private generateMarkdown(release: Release): string {
    let md = `# ${release.name}\n\n`;
    md += `**Date de MEP:** ${this.formatDate(release.releaseDate)}  \n\n`;

    if (release.description) {
      md += `## Description\n\n${release.description}\n\n`;
    }

    // 1. Tontons MEP Table
    md += `## Tontons MEP\n\n`;
    const tontonHeaders = ['Squad', 'Tonton MEP', 'Statut'];
    const tontonRows = release.squads.map(s => [
      `Squad ${s.squadNumber}`,
      s.tontonMep || '-',
      s.isCompleted ? '✅ Validé' : '⏳ En cours'
    ]);
    md += this.generateMarkdownTable(tontonHeaders, tontonRows);
    md += '\n';

    // 2. Fonctionnalités Majeures
    md += `## Fonctionnalités Majeures\n\n`;
    release.squads.forEach(squad => {
      md += `### Squad ${squad.squadNumber}\n\n`;
      if (squad.features.length > 0) {
        const featureHeaders = ['Titre', 'Description'];
        const featureRows = squad.features.map(f => [f.title, f.description || '']);
        md += this.generateMarkdownTable(featureHeaders, featureRows);
        md += '\n';
      } else if (squad.featuresEmptyConfirmed) {
        md += '_Néant_\n\n';
      } else {
        md += '_Non renseigné_\n\n';
      }
    });

    // 3. Actions Pré-MEP
    md += `## Actions Pré-MEP\n\n`;
    release.squads.forEach(squad => {
      md += `### Squad ${squad.squadNumber}\n\n`;
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        md += this.generateActionsMarkdown(preMepActions);
      } else if (squad.preMepEmptyConfirmed) {
        md += '_Néant_\n\n';
      } else {
        md += '_Non renseigné_\n\n';
      }
    });

    // 4. Actions Post-MEP
    md += `## Actions Post-MEP\n\n`;
    release.squads.forEach(squad => {
      md += `### Squad ${squad.squadNumber}\n\n`;
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        md += this.generateActionsMarkdown(postMepActions);
      } else if (squad.postMepEmptyConfirmed) {
        md += '_Néant_\n\n';
      } else {
        md += '_Non renseigné_\n\n';
      }
    });

    return md;
  }

  private generateActionsMarkdown(actions: Action[]): string {
    let md = '';
    const grouped = this.groupActionsByType(actions);

    // Memory Flipping
    if (grouped.memory_flipping.length > 0) {
      md += `#### Memory Flipping\n\n`;
      const headers = ['Nom du MF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.memory_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      md += this.generateMarkdownTable(headers, rows);
      md += '\n';
    }

    // Feature Flipping
    if (grouped.feature_flipping.length > 0) {
      md += `#### Feature Flipping\n\n`;
      const headers = ['Nom du FF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.feature_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      md += this.generateMarkdownTable(headers, rows);
      md += '\n';
    }

    // Other Actions
    if (grouped.other.length > 0) {
      md += `#### Autres Actions\n\n`;
      const headers = ['Description'];
      const rows = grouped.other.map(a => [a.description]);
      md += this.generateMarkdownTable(headers, rows);
      md += '\n';
    }

    return md;
  }

  private generateMarkdownTable(headers: string[], rows: string[][]): string {
    if (rows.length === 0) return '';

    let table = `| ${headers.join(' | ')} |\n`;
    table += `| ${headers.map(() => '---').join(' | ')} |\n`;

    rows.forEach(row => {
      const escapedRow = row.map(cell => (cell || '').replace(/\|/g, '\\|').replace(/\n/g, '<br>'));
      table += `| ${escapedRow.join(' | ')} |\n`;
    });

    return table;
  }

  private generateHTML(release: Release): string {
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${release.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; color: #1f2937; }
    h1 { color: #111827; font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-top: 2rem; }
    h3 { color: #374151; margin-top: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
    h4 { color: #4b5563; margin-top: 1.25rem; font-size: 1.1rem; }
    h5 { color: #6b7280; margin-top: 1rem; font-size: 1rem; font-weight: 600; }
    .meta { color: #6b7280; margin-bottom: 2rem; }
    .squad { margin-bottom: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
    .squad.completed { background: #f0fdf4; border-color: #bbf7d0; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; }
    th { background-color: #f3f4f6; text-align: left; padding: 0.75rem; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; }
    td { padding: 0.75rem; border: 1px solid #e5e7eb; color: #4b5563; vertical-align: top; }
    tr:nth-child(even) { background-color: #f9fafb; }
    .squad.completed tr:nth-child(even) { background-color: #f0fdf4; }
    .squad.completed th { background-color: #dcfce7; }
    .empty-section { font-style: italic; color: #6b7280; margin-top: 0.5rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h1>${release.name}</h1>
  <div class="meta">
    <strong>Date de MEP:</strong> ${this.formatDate(release.releaseDate)}
  </div>`;

    if (release.description) {
      html += `<h2>Description</h2><p>${release.description}</p>`;
    }

    // 1. Tontons MEP Table
    html += `<h2>Tontons MEP</h2>`;
    const tontonHeaders = ['Squad', 'Tonton MEP', 'Statut'];
    const tontonRows = release.squads.map(s => [
      `Squad ${s.squadNumber}`,
      s.tontonMep || '-',
      s.isCompleted ? '✅ Validé' : '⏳ En cours'
    ]);
    html += this.generateHTMLTable(tontonHeaders, tontonRows);

    // 2. Fonctionnalités Majeures
    html += `<h2>Fonctionnalités Majeures</h2>`;
    release.squads.forEach(squad => {
      html += `<h3>Squad ${squad.squadNumber}</h3>`;
      if (squad.features.length > 0) {
        const featureHeaders = ['Titre', 'Description'];
        const featureRows = squad.features.map(f => [f.title, f.description || '']);
        html += this.generateHTMLTable(featureHeaders, featureRows);
      } else if (squad.featuresEmptyConfirmed) {
        html += `<p class="empty-section">Néant</p>`;
      } else {
        html += `<p class="empty-section" style="color: #ef4444;">Non renseigné</p>`;
      }
    });

    // 3. Actions Pré-MEP
    html += `<h2>Actions Pré-MEP</h2>`;
    release.squads.forEach(squad => {
      html += `<h3>Squad ${squad.squadNumber}</h3>`;
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        html += this.generateActionsHTML(preMepActions);
      } else if (squad.preMepEmptyConfirmed) {
        html += `<p class="empty-section">Néant</p>`;
      } else {
        html += `<p class="empty-section" style="color: #ef4444;">Non renseigné</p>`;
      }
    });

    // 4. Actions Post-MEP
    html += `<h2>Actions Post-MEP</h2>`;
    release.squads.forEach(squad => {
      html += `<h3>Squad ${squad.squadNumber}</h3>`;
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        html += this.generateActionsHTML(postMepActions);
      } else if (squad.postMepEmptyConfirmed) {
        html += `<p class="empty-section">Néant</p>`;
      } else {
        html += `<p class="empty-section" style="color: #ef4444;">Non renseigné</p>`;
      }
    });

    html += '</body></html>';
    return html;
  }

  private generateActionsHTML(actions: Action[]): string {
    let html = '';
    const grouped = this.groupActionsByType(actions);

    // Memory Flipping
    if (grouped.memory_flipping.length > 0) {
      html += `<h4>Memory Flipping</h4>`;
      const headers = ['Nom du MF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.memory_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      html += this.generateHTMLTable(headers, rows);
    }

    // Feature Flipping
    if (grouped.feature_flipping.length > 0) {
      html += `<h4>Feature Flipping</h4>`;
      const headers = ['Nom du FF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.feature_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      html += this.generateHTMLTable(headers, rows);
    }

    // Other Actions
    if (grouped.other.length > 0) {
      html += `<h4>Autres Actions</h4>`;
      const headers = ['Description'];
      const rows = grouped.other.map(a => [a.description]);
      html += this.generateHTMLTable(headers, rows);
    }

    return html;
  }

  private generateHTMLTable(headers: string[], rows: string[][]): string {
    if (rows.length === 0) return '';

    let html = `<table><thead><tr>`;
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += `</tr></thead><tbody>`;

    rows.forEach(row => {
      html += `<tr>`;
      row.forEach(cell => {
        html += `<td>${(cell || '').replace(/\n/g, '<br>')}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    return html;
  }

  private groupActionsByType(actions: Action[]): { memory_flipping: Action[], feature_flipping: Action[], other: Action[] } {
    const grouped = {
      memory_flipping: [] as Action[],
      feature_flipping: [] as Action[],
      other: [] as Action[]
    };

    actions.forEach(action => {
      if (action.type === 'memory_flipping') {
        grouped.memory_flipping.push(action);
      } else if (action.type === 'feature_flipping') {
        grouped.feature_flipping.push(action);
      } else {
        grouped.other.push(action);
      }
    });

    return grouped;
  }

  // Helper methods for formatting
  private getFlippingTargets(data: string | string[]): string[] {
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private getFlippingClientsDisplay(targetClients: string | string[]): string {
    const clients = this.getFlippingTargets(targetClients);
    if (clients.length === 0 || clients.includes('all')) {
      return 'ALL';
    }
    return clients.join(', ');
  }

  private getFlippingCaissesDisplay(targetCaisses?: string | null): string {
    if (!targetCaisses) {
      return 'ALL';
    }
    return targetCaisses;
  }

  private getFlippingOSDisplay(targetOS: string | string[]): string {
    const osList = this.getFlippingTargets(targetOS);
    if (osList.length === 0 || (osList.includes('ios') && osList.includes('android'))) {
      return 'ALL';
    }
    return osList.join(', ').toUpperCase();
  }

  private getFlippingVersionsDisplay(targetVersions: string | any[]): string {
    let versions: any[];
    if (Array.isArray(targetVersions)) {
      versions = targetVersions;
    } else {
      try {
        versions = JSON.parse(targetVersions);
      } catch {
        versions = [];
      }
    }

    if (versions.length === 0) {
      return 'ALL';
    }

    return versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
  }

  private getRuleActionLabel(action: string): string {
    const labels: any = {
      'create_rule': 'Créer la règle',
      'obsolete_rule': 'Rendre obsolète',
      'disable_rule': 'Désactiver',
      'enable_rule': 'Activer'
    };
    return labels[action] || action;
  }

  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
