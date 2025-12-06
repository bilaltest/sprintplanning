import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HistoryService } from '@services/history.service';
import { EventService } from '@services/event.service';
import { CategoryService } from '@services/category.service';
import { HistoryEntry } from '@models/history.model';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="material-icons text-3xl text-primary-600 dark:text-primary-400">history</span>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Historique</h1>
        </div>

        <button
          *ngIf="history.length > 0"
          (click)="clearHistory()"
          class="btn btn-secondary"
        >
          Effacer l'historique
        </button>
      </div>

      <div class="card p-6">
        <div *ngIf="history.length === 0" class="text-center py-12">
          <span class="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-4">
            history
          </span>
          <p class="text-gray-500 dark:text-gray-400">
            Aucune modification enregistrée
          </p>
        </div>

        <div *ngIf="history.length > 0">
          <!-- Pagination info -->
          <div class="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Affichage de {{ getStartIndex() + 1 }} à {{ getEndIndex() }} sur {{ getTotalDisplayed() }} entrées
              <span *ngIf="history.length > maxTotalEntries" class="text-amber-600 dark:text-amber-400">
                ({{ history.length - maxTotalEntries }} entrées plus anciennes masquées)
              </span>
            </span>
            <span>Page {{ currentPage }} sur {{ totalPages }}</span>
          </div>

          <div class="space-y-4">
          <div
            *ngFor="let entry of getPaginatedHistory()"
            class="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <!-- Icon -->
            <div
              [class.bg-green-100]="entry.action === 'create'"
              [class.dark:bg-green-900/30]="entry.action === 'create'"
              [class.bg-blue-100]="entry.action === 'update'"
              [class.dark:bg-blue-900/30]="entry.action === 'update'"
              [class.bg-red-100]="entry.action === 'delete'"
              [class.dark:bg-red-900/30]="entry.action === 'delete'"
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <span
                [class.text-green-600]="entry.action === 'create'"
                [class.dark:text-green-400]="entry.action === 'create'"
                [class.text-blue-600]="entry.action === 'update'"
                [class.dark:text-blue-400]="entry.action === 'update'"
                [class.text-red-600]="entry.action === 'delete'"
                [class.dark:text-red-400]="entry.action === 'delete'"
                class="material-icons"
              >
                {{ getActionIcon(entry.action) }}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getActionDescription(entry) }}
                  </p>

                  <div *ngIf="entry.eventData" class="mt-1 flex items-center space-x-2">
                    <span
                      [style.background-color]="entry.eventData.color"
                      class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs text-white"
                    >
                      <span class="material-icons" style="font-size: 12px;">
                        {{ entry.eventData.icon }}
                      </span>
                      <span>{{ entry.eventData.title }}</span>
                    </span>

                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ entry.eventData.date }}
                    </span>
                  </div>

                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ getRelativeTime(entry.timestamp) }}
                  </p>
                </div>

                <button
                  (click)="rollback(entry)"
                  class="btn btn-sm btn-secondary ml-4"
                  title="Annuler cette action"
                >
                  <span class="material-icons text-sm">undo</span>
                </button>
              </div>

              <!-- Show previous values for updates -->
              <div
                *ngIf="entry.action === 'update' && entry.previousData && entry.eventData"
                class="mt-3 text-xs space-y-1"
              >
                <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modifications :
                </div>

                <!-- Title change -->
                <div *ngIf="entry.previousData.title !== entry.eventData.title" class="flex items-start space-x-2">
                  <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">label</span>
                  <div class="flex-1">
                    <span class="text-gray-500 dark:text-gray-400">Titre :</span>
                    <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.title }}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                    <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.eventData.title }}</span>
                  </div>
                </div>

                <!-- Date change -->
                <div *ngIf="entry.previousData.date !== entry.eventData.date" class="flex items-start space-x-2">
                  <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">event</span>
                  <div class="flex-1">
                    <span class="text-gray-500 dark:text-gray-400">Date :</span>
                    <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.date }}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                    <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.eventData.date }}</span>
                  </div>
                </div>

                <!-- Start time change -->
                <div *ngIf="entry.previousData.startTime !== entry.eventData.startTime" class="flex items-start space-x-2">
                  <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">schedule</span>
                  <div class="flex-1">
                    <span class="text-gray-500 dark:text-gray-400">Heure de début :</span>
                    <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.startTime || 'Non définie' }}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                    <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.eventData.startTime || 'Non définie' }}</span>
                  </div>
                </div>

                <!-- End time change -->
                <div *ngIf="entry.previousData.endTime !== entry.eventData.endTime" class="flex items-start space-x-2">
                  <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">schedule</span>
                  <div class="flex-1">
                    <span class="text-gray-500 dark:text-gray-400">Heure de fin :</span>
                    <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.endTime || 'Non définie' }}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                    <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.eventData.endTime || 'Non définie' }}</span>
                  </div>
                </div>

                <!-- Category change -->
                <div *ngIf="entry.previousData.category !== entry.eventData.category" class="flex items-start space-x-2">
                  <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">category</span>
                  <div class="flex-1">
                    <span class="text-gray-500 dark:text-gray-400">Catégorie :</span>
                    <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ getCategoryLabel(entry.previousData.category) }}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                    <span class="text-green-600 dark:text-green-400 ml-1">{{ getCategoryLabel(entry.eventData.category) }}</span>
                  </div>
                </div>

                <!-- Description change -->
                <div *ngIf="entry.previousData.description !== entry.eventData.description" class="flex items-start space-x-2">
                  <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">description</span>
                  <div class="flex-1">
                    <span class="text-gray-500 dark:text-gray-400">Description :</span>
                    <div class="mt-1">
                      <div class="line-through text-red-600 dark:text-red-400">{{ entry.previousData.description || 'Aucune' }}</div>
                      <div class="material-icons text-xs inline-block">arrow_downward</div>
                      <div class="text-green-600 dark:text-green-400">{{ entry.eventData.description || 'Aucune' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span class="material-icons text-sm">chevron_left</span>
              <span>Précédent</span>
            </button>

            <div class="flex items-center space-x-1">
              <button
                *ngFor="let page of getPageNumbers()"
                (click)="goToPage(page)"
                [class.bg-primary-500]="page === currentPage"
                [class.text-white]="page === currentPage"
                [class.dark:bg-primary-600]="page === currentPage"
                [class.hover:bg-gray-100]="page !== currentPage"
                [class.dark:hover:bg-gray-700]="page !== currentPage"
                class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
              >
                {{ page }}
              </button>
            </div>

            <button
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Suivant</span>
              <span class="material-icons text-sm">chevron_right</span>
            </button>
          </div>
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
export class HistoryComponent implements OnInit {
  history: HistoryEntry[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  maxPages = 3;
  maxTotalEntries = 30; // 10 items × 3 pages

  private destroyRef = inject(DestroyRef);

  constructor(
    private historyService: HistoryService,
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Subscription avec cleanup automatique
    this.historyService.history$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(entries => {
        this.history = entries;
      });
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'create':
        return 'add_circle';
      case 'update':
        return 'edit';
      case 'delete':
        return 'delete';
      default:
        return 'history';
    }
  }

  getActionDescription(entry: HistoryEntry): string {
    const eventTitle = entry.eventData?.title || entry.previousData?.title || 'Événement';

    switch (entry.action) {
      case 'create':
        return `Événement créé: ${eventTitle}`;
      case 'update':
        return `Événement modifié: ${eventTitle}`;
      case 'delete':
        return `Événement supprimé: ${eventTitle}`;
      default:
        return `Action: ${entry.action}`;
    }
  }

  getRelativeTime(timestamp: Date | string): string {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  }

  getCategoryLabel(categoryId: string): string {
    return this.categoryService.getCategoryLabel(categoryId);
  }

  get totalPages(): number {
    return Math.min(
      this.maxPages,
      Math.ceil(this.history.length / this.itemsPerPage)
    );
  }

  getPaginatedHistory(): HistoryEntry[] {
    // Limiter l'historique aux maxTotalEntries (30) entrées les plus récentes
    const limitedHistory = this.history.slice(0, this.maxTotalEntries);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return limitedHistory.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    const limitedTotal = Math.min(this.history.length, this.maxTotalEntries);
    return Math.min(this.currentPage * this.itemsPerPage, limitedTotal);
  }

  getTotalDisplayed(): number {
    return Math.min(this.history.length, this.maxTotalEntries);
  }

  async rollback(entry: HistoryEntry): Promise<void> {
    if (!entry.id) return;

    const confirmed = confirm(
      `Voulez-vous vraiment annuler cette action ?\n\n${this.getActionDescription(entry)}`
    );

    if (!confirmed) return;

    try {
      await this.historyService.rollback(entry.id);
      // Rafraîchir l'historique et les événements
      await this.historyService.refresh();
      alert('Action annulée avec succès');
    } catch (error) {
      alert('Erreur lors de l\'annulation');
    }
  }

  async clearHistory(): Promise<void> {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir effacer tout l\'historique ?\nCette action est irréversible.'
    );

    if (!confirmed) return;

    try {
      await this.historyService.clearHistory();
    } catch (error) {
      alert('Erreur lors de l\'effacement de l\'historique');
    }
  }
}
