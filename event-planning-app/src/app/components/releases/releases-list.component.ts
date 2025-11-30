import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReleaseService } from '@services/release.service';
import { Release, STATUS_LABELS, STATUS_COLORS } from '@models/release.model';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-releases-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="material-icons text-3xl text-primary-600 dark:text-primary-400">rocket_launch</span>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Préparation de MEP</h1>
        </div>
        <button
          (click)="showCreateModal = true"
          class="btn btn-primary flex items-center space-x-2"
        >
          <span class="material-icons">add</span>
          <span>Nouvelle Release</span>
        </button>
      </div>

      <!-- Releases Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="(releases$ | async) as releases">
        <div
          *ngFor="let release of releases"
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
          (click)="viewRelease(release.id!, release.version)"
        >
          <!-- Delete Button -->
          <button
            (click)="deleteRelease($event, release)"
            class="absolute top-4 right-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer la release"
          >
            <span class="material-icons text-sm">delete</span>
          </button>

          <!-- Header -->
          <div class="flex items-start justify-between mb-4 pr-8">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {{ release.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Version {{ release.version }}
              </p>
            </div>
            <span
              class="px-2 py-1 text-xs font-semibold text-white rounded"
              [ngClass]="STATUS_COLORS[release.status]"
            >
              {{ STATUS_LABELS[release.status] }}
            </span>
          </div>

          <!-- Date -->
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span class="material-icons text-sm">calendar_today</span>
            <span>{{ formatDate(release.releaseDate) }}</span>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2" *ngIf="release.description">
            {{ release.description }}
          </p>

          <!-- Squads Summary -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-1">
                <span class="material-icons text-sm text-gray-500">groups</span>
                <span class="text-gray-600 dark:text-gray-300">{{ release.squads.length }} squads</span>
              </div>
              <div class="flex items-center space-x-1">
                <span class="material-icons text-sm text-gray-500">task</span>
                <span class="text-gray-600 dark:text-gray-300">{{ getTotalActions(release) }} actions</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          *ngIf="releases.length === 0"
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
            (click)="showCreateModal = true"
            class="btn btn-primary"
          >
            Créer une release
          </button>
        </div>
      </div>

      <!-- Create Modal -->
      <div
        *ngIf="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="showCreateModal = false"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Nouvelle Release
          </h2>

          <form (submit)="createRelease($event)" class="space-y-4">
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

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Version
              </label>
              <input
                type="text"
                [(ngModel)]="newRelease.version"
                name="version"
                required
                class="input"
                placeholder="Ex: 40.5"
              />
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

            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="btn btn-primary flex-1"
                [disabled]="isCreating"
              >
                {{ isCreating ? 'Création...' : 'Créer' }}
              </button>
              <button
                type="button"
                (click)="showCreateModal = false"
                class="btn btn-secondary flex-1"
              >
                Annuler
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

  showCreateModal = false;
  isCreating = false;

  newRelease = {
    name: '',
    version: '',
    releaseDate: '',
    description: ''
  };

  STATUS_LABELS = STATUS_LABELS;
  STATUS_COLORS = STATUS_COLORS;

  constructor(
    private releaseService: ReleaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.releaseService.loadReleases();
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  getTotalActions(release: Release): number {
    return release.squads.reduce((total, squad) => total + squad.actions.length, 0);
  }

  viewRelease(id: string, version?: string): void {
    // Utiliser la version pour l'URL si disponible, sinon utiliser l'ID
    const routeParam = version || id;
    this.router.navigate(['/releases', routeParam]);
  }

  async createRelease(event: Event): Promise<void> {
    event.preventDefault();

    if (this.isCreating) return;

    try {
      this.isCreating = true;
      const release = await this.releaseService.createRelease(this.newRelease);

      // Reset form
      this.newRelease = {
        name: '',
        version: '',
        releaseDate: '',
        description: ''
      };

      this.showCreateModal = false;

      // Navigate to the new release
      this.router.navigate(['/releases', release.id]);
    } catch (error) {
      console.error('Error creating release:', error);
      alert('Erreur lors de la création de la release');
    } finally {
      this.isCreating = false;
    }
  }

  async deleteRelease(event: Event, release: Release): Promise<void> {
    event.stopPropagation(); // Empêcher la navigation vers le détail

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la release "${release.name}" ?\n\nCette action est irréversible et supprimera toutes les squads, features et actions associées.`);

    if (!confirmed) return;

    try {
      await this.releaseService.deleteRelease(release.id!);
    } catch (error) {
      console.error('Error deleting release:', error);
      alert('Erreur lors de la suppression de la release');
    }
  }
}
