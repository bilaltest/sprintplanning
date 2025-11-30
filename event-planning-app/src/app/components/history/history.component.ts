import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HistoryService } from '@services/history.service';
import { EventService } from '@services/event.service';
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

        <div *ngIf="history.length > 0" class="space-y-4">
          <div
            *ngFor="let entry of history"
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
                *ngIf="entry.action === 'update' && entry.previousData"
                class="mt-2 text-xs text-gray-500 dark:text-gray-400 pl-4 border-l-2 border-gray-300 dark:border-gray-600"
              >
                <p>Ancienne valeur: {{ entry.previousData.title }}</p>
              </div>
            </div>
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

  private destroyRef = inject(DestroyRef);

  constructor(
    private historyService: HistoryService,
    private eventService: EventService
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
