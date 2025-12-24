import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { CanAccessDirective } from '@directives/can-access.directive';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OnboardingService } from '@services/onboarding.service';
import { TipModalComponent } from '../onboarding/tip-modal/tip-modal.component';
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


@Component({
  selector: 'app-releases-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CanAccessDirective, MatDialogModule],
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
            class="card-releases p-6 relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]"
          [class.hover:border-emerald-500]="release.type === 'release'"
          [class.hover:border-red-500]="release.type === 'hotfix'"
        >
          <!-- Type Badge -->
          <div class="absolute top-0 right-0 z-20">
            <span [class]="getReleaseTypeColors(release.type).badge"
                  class="inline-flex items-center space-x-1 px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold shadow-sm">
              <span class="material-icons text-sm">
                {{ release.type === 'hotfix' ? 'build_circle' : 'rocket_launch' }}
              </span>
              <span>{{ getReleaseTypeLabel(release.type) }}</span>
            </span>
          </div>

          <!-- Header -->
          <div class="flex items-start justify-between mb-4 pt-8">
            <div class="flex-1">
              <h3 [class]="getReleaseTypeColors(release.type).text"
                  class="text-xl font-bold mb-1">
                {{ release.name }}
              </h3>
            </div>

            <!-- Kebab menu (3 dots) -->
            <div class="relative">
              <button
                appCanAccess="RELEASES"
                accessLevel="write"
                (click)="toggleKebabMenu(release.id!, $event)"
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Plus d'options"
              >
                <span class="material-icons">more_vert</span>
              </button>

              <!-- Dropdown menu -->
              <div
                *ngIf="openKebabMenuId === release.id"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 overflow-hidden"
                (click)="$event.stopPropagation()"
              >
                <button
                  (click)="startEditingDate(release, $event); closeKebabMenu()"
                  class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                >
                  <span class="material-icons text-gray-600 dark:text-gray-400">edit</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">Modifier</span>
                </button>
                <button
                  (click)="deleteRelease($event, release); closeKebabMenu()"
                  class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                >
                  <span class="material-icons text-red-600 dark:text-red-400">delete</span>
                  <span class="text-sm font-medium text-red-600 dark:text-red-400">Supprimer</span>
                </button>
              </div>
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



          <!-- Footer - Main Actions -->
          <div class="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <!-- <button
              (click)="navigateToPreparation(release.slug, $event)"
              class="group flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30"
              title="Accéder à la préparation MEP"
            >
              <span class="material-icons text-lg group-hover:rotate-12 transition-transform">assignment_turned_in</span>
              <span>Prépa MEP</span>
            </button> -->
            <button
              (click)="navigateToReleaseNote(release.slug, $event)"
              class="group flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/30 w-full md:w-auto"
              title="Accéder à la MEP Back"
            >
              <span class="material-icons text-lg group-hover:scale-110 transition-transform">description</span>
              <span>MEP Back</span>
            </button>
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
            class="card-releases p-6 relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] opacity-60 hover:opacity-90"
            [class.hover:border-emerald-500]="release.type === 'release'"
            [class.hover:border-red-500]="release.type === 'hotfix'"
          >
            <!-- Type Badge -->
            <div class="absolute top-0 right-0 z-20">
              <span [class]="getReleaseTypeColors(release.type).badge"
                    class="inline-flex items-center space-x-1 px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold shadow-sm">
                <span class="material-icons text-sm">
                  {{ release.type === 'hotfix' ? 'build_circle' : 'rocket_launch' }}
                </span>
                <span>{{ getReleaseTypeLabel(release.type) }}</span>
              </span>
            </div>

            <!-- Header -->
            <div class="flex items-start justify-between mb-4 pt-8">
              <div class="flex-1">
                <h3 [class]="getReleaseTypeColors(release.type).text"
                    class="text-xl font-bold mb-1">
                  {{ release.name }}
                </h3>
              </div>

              <!-- Kebab menu (3 dots) -->
              <div class="relative">
                <button
                  appCanAccess="RELEASES"
                  accessLevel="write"
                  (click)="toggleKebabMenu(release.id!, $event)"
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title="Plus d'options"
                >
                  <span class="material-icons">more_vert</span>
                </button>

                <!-- Dropdown menu -->
                <div
                  *ngIf="openKebabMenuId === release.id"
                  class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-30 overflow-hidden"
                  (click)="$event.stopPropagation()"
                >
                  <button
                    (click)="startEditingDate(release, $event); closeKebabMenu()"
                    class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                  >
                    <span class="material-icons text-gray-600 dark:text-gray-400">edit</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Modifier</span>
                  </button>
                  <button
                    (click)="deleteRelease($event, release); closeKebabMenu()"
                    class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                  >
                    <span class="material-icons text-red-600 dark:text-red-400">delete</span>
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">Supprimer</span>
                  </button>
                </div>
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



            <!-- Footer - Main Actions -->
            <div class="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-600">
              <!-- <button
                (click)="navigateToPreparation(release.slug, $event)"
                class="group flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30"
                title="Accéder à la préparation MEP"
              >
                <span class="material-icons text-lg group-hover:rotate-12 transition-transform">assignment_turned_in</span>
                <span>Prépa MEP</span>
              </button> -->
              <button
                (click)="navigateToReleaseNote(release.slug, $event)"
                class="group flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/30 w-full md:w-auto"
                title="Accéder à la MEP Back"
              >
                <span class="material-icons text-lg group-hover:scale-110 transition-transform">description</span>
                <span>MEP Back</span>
              </button>
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

  showEditDateModal = false;
  isUpdatingDate = false;
  editingRelease: Release | null = null;
  newMepDate = '';
  newReleaseName = '';

  openKebabMenuId: string | null = null;

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
    private confirmationService: ConfirmationService,
    private onboardingService: OnboardingService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.releaseService.loadReleases();
    this.checkOnboarding();

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

    // Close kebab menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.closeKebabMenu();
      }
    });
  }

  private checkOnboarding(): void {
    this.onboardingService.loadSeenKeys().subscribe(() => {
      if (this.onboardingService.shouldShow('FEATURE_RELEASES')) {
        this.dialog.open(TipModalComponent, {
          width: '90%',
          maxWidth: '500px',
          panelClass: 'transparent-dialog',
          backdropClass: 'blur-backdrop',
          data: {
            title: 'Bienvenue sur les Releases',
            content: 'C\'est ici que vous gérez vos mises en production. Vous pouvez créer des releases, y associer des features de vos squads, et suivre l\'avancement des déploiements. N\'oubliez pas de consulter l\'historique pour voir les anciennes versions.',
            icon: 'rocket_launch',
            gradientClass: 'from-emerald-500 to-teal-600'
          }
        }).afterClosed().subscribe(() => {
          this.onboardingService.markAsSeen('FEATURE_RELEASES');
        });
      }
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

  navigateToPreparation(releaseId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/releases', releaseId, 'preparation']);
  }

  navigateToReleaseNote(releaseId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/releases', releaseId, 'release-note']);
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

  toggleKebabMenu(releaseId: string, event: Event): void {
    event.stopPropagation();
    this.openKebabMenuId = this.openKebabMenuId === releaseId ? null : releaseId;
  }

  closeKebabMenu(): void {
    this.openKebabMenuId = null;
  }

}
