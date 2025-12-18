import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReleaseHistoryService } from '@services/release-history.service';
import { ReleaseService } from '@services/release.service';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';
import { ReleaseHistoryEntry } from '@models/release-history.model';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-release-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center space-x-3">
        <button
          (click)="goBack()"
          class="btn btn-secondary p-2"
          title="Retour aux releases"
        >
          <span class="material-icons">arrow_back</span>
        </button>
        <span class="material-icons text-3xl text-releases-600 dark:text-releases-400">history</span>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Historique des Releases</h1>
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
              class="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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

                    <div *ngIf="entry.releaseData" class="mt-1 flex items-center space-x-2">
                      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs bg-releases-100 dark:bg-releases-900 text-releases-800 dark:text-releases-200">
                        <span class="material-icons" style="font-size: 12px;">rocket_launch</span>
                        <span>{{ entry.releaseData.name }}</span>
                      </span>

                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatDate(entry.releaseData.releaseDate) }}
                      </span>
                    </div>

                    <div class="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{{ getRelativeTime(entry.timestamp) }}</span>
                      <span *ngIf="entry.userDisplayName" class="flex items-center space-x-1">
                        <span>•</span>
                        <span class="material-icons" style="font-size: 12px;">person</span>
                        <span class="font-medium text-releases-600 dark:text-releases-400">{{ entry.userDisplayName }}</span>
                      </span>
                    </div>
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
                  *ngIf="entry.action === 'update' && entry.previousData && entry.releaseData"
                  class="mt-3 text-xs space-y-1"
                >
                  <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modifications :
                  </div>

                  <!-- Name change -->
                  <div *ngIf="entry.previousData.name !== entry.releaseData.name" class="flex items-start space-x-2">
                    <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">label</span>
                    <div class="flex-1">
                      <span class="text-gray-500 dark:text-gray-400">Nom :</span>
                      <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.name }}</span>
                      <span class="material-icons text-xs">arrow_forward</span>
                      <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.releaseData.name }}</span>
                    </div>
                  </div>

                  <!-- Version change -->
                  <div *ngIf="entry.previousData.version !== entry.releaseData.version" class="flex items-start space-x-2">
                    <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">tag</span>
                    <div class="flex-1">
                      <span class="text-gray-500 dark:text-gray-400">Version :</span>
                      <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.version }}</span>
                      <span class="material-icons text-xs">arrow_forward</span>
                      <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.releaseData.version }}</span>
                    </div>
                  </div>

                  <!-- Date change -->
                  <div *ngIf="entry.previousData.releaseDate !== entry.releaseData.releaseDate" class="flex items-start space-x-2">
                    <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">event</span>
                    <div class="flex-1">
                      <span class="text-gray-500 dark:text-gray-400">Date MEP :</span>
                      <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ formatDate(entry.previousData.releaseDate) }}</span>
                      <span class="material-icons text-xs">arrow_forward</span>
                      <span class="text-green-600 dark:text-green-400 ml-1">{{ formatDate(entry.releaseData.releaseDate) }}</span>
                    </div>
                  </div>

                  <!-- Type change -->
                  <div *ngIf="entry.previousData.type !== entry.releaseData.type" class="flex items-start space-x-2">
                    <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">category</span>
                    <div class="flex-1">
                      <span class="text-gray-500 dark:text-gray-400">Type :</span>
                      <span class="line-through text-red-600 dark:text-red-400 mx-1">{{ entry.previousData.type }}</span>
                      <span class="material-icons text-xs">arrow_forward</span>
                      <span class="text-green-600 dark:text-green-400 ml-1">{{ entry.releaseData.type }}</span>
                    </div>
                  </div>

                  <!-- Description change -->
                  <div *ngIf="entry.previousData.description !== entry.releaseData.description" class="flex items-start space-x-2">
                    <span class="material-icons text-amber-600 dark:text-amber-400" style="font-size: 14px;">description</span>
                    <div class="flex-1">
                      <span class="text-gray-500 dark:text-gray-400">Description :</span>
                      <div class="mt-1">
                        <div class="line-through text-red-600 dark:text-red-400">{{ entry.previousData.description || 'Aucune' }}</div>
                        <div class="material-icons text-xs inline-block">arrow_downward</div>
                        <div class="text-green-600 dark:text-green-400">{{ entry.releaseData.description || 'Aucune' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination controls -->
          <div class="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
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
                [class.bg-releases-500]="page === currentPage"
                [class.text-white]="page === currentPage"
                [class.dark:bg-releases-600]="page === currentPage"
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
export class ReleaseHistoryComponent implements OnInit {
  history: ReleaseHistoryEntry[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  maxPages = 3;
  maxTotalEntries = 30; // 10 items × 3 pages

  private destroyRef = inject(DestroyRef);

  constructor(
    private releaseHistoryService: ReleaseHistoryService,
    private releaseService: ReleaseService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscription avec cleanup automatique
    this.releaseHistoryService.history$
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

  getActionDescription(entry: ReleaseHistoryEntry): string {
    const releaseName = entry.releaseData?.name || entry.previousData?.name || 'Release';

    switch (entry.action) {
      case 'create':
        return `Release créée: ${releaseName}`;
      case 'update':
        return `Release modifiée: ${releaseName}`;
      case 'delete':
        return `Release supprimée: ${releaseName}`;
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

  formatDate(date: string | Date): string {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  }

  get totalPages(): number {
    return Math.min(
      this.maxPages,
      Math.ceil(this.history.length / this.itemsPerPage)
    );
  }

  getPaginatedHistory(): ReleaseHistoryEntry[] {
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

  async rollback(entry: ReleaseHistoryEntry): Promise<void> {
    if (!entry.id) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Annuler cette action ?',
      message: `Voulez-vous vraiment annuler cette action ?\n\n${this.getActionDescription(entry)}`,
      confirmText: 'Annuler l\'action',
      cancelText: 'Conserver',
      confirmButtonClass: 'warning'
    });

    if (!confirmed) return;

    try {
      await this.releaseHistoryService.rollback(entry.id);
      // Rafraîchir l'historique
      await this.releaseHistoryService.refresh();
      // Forcer le rechargement des releases depuis le backend
      await this.releaseService.refreshReleases();
      this.toastService.success('Action annulée', 'L\'action a été annulée avec succès');
    } catch (error) {
      this.toastService.error('Erreur', 'Erreur lors de l\'annulation');
    }
  }


  goBack(): void {
    this.router.navigate(['/releases']);
  }
}
