import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Release, Squad } from '@models/release.model';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { CanAccessDirective } from '@directives/can-access.directive';


@Component({
  selector: 'app-release-tontons',
  standalone: true,
  imports: [CommonModule, FormsModule, CanAccessDirective],
  template: `
    <div class="card overflow-hidden">
      <!-- Header -->
      <div 
        class="p-4 border-b bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent flex justify-between items-center cursor-pointer hover:from-indigo-100 dark:hover:from-indigo-900/30 transition-all duration-200" 
        (click)="toggleExpanded()"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
            <span class="material-icons text-xl text-indigo-600 dark:text-indigo-400">group</span>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Tontons MEP</h2>
        </div>
        <span class="material-icons text-gray-500">
          {{ isExpanded ? 'expand_less' : 'expand_more' }}
        </span>
      </div>

      <!-- Body -->
      <div *ngIf="isExpanded" class="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div *ngFor="let squad of release?.squads" class="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-300">
            <!-- Gradient top border -->
            <div class="h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>

            <div class="p-4 space-y-4">
              <!-- Header with squad number -->
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-white font-bold text-sm">{{ squad.squadNumber }}</span>
                  </div>
                  <span class="font-bold text-gray-900 dark:text-white">Squad {{ squad.squadNumber }}</span>
                </div>
              </div>

              <!-- Tonton MEP input -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Responsable MEP</label>
                <div class="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:focus-within:ring-indigo-800/50 transition-all">
                  <span class="material-icons text-lg text-indigo-500 dark:text-indigo-400">person</span>
                  <input
                    #tontonInput
                    type="text"
                    [value]="squad.tontonMep || ''"
                    (input)="true"
                    (keyup.enter)="updateTontonMep(squad.id!, tontonInput.value)"
                    placeholder="Non assigné"
                    class="flex-1 bg-transparent px-1 py-1 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    appCanAccess="RELEASES"
                    accessLevel="write"
                    (click)="updateTontonMep(squad.id!, tontonInput.value)"
                    [disabled]="tontonInput.value.trim() === (squad.tontonMep || '')"
                    [ngClass]="{
                      'opacity-40 cursor-not-allowed': tontonInput.value.trim() === (squad.tontonMep || ''),
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 shadow-sm': tontonInput.value.trim() !== (squad.tontonMep || '')
                    }"
                    class="p-1.5 rounded-lg transition-all duration-200"
                    title="Valider"
                  >
                    <span class="material-icons text-base">check</span>
                  </button>
                </div>
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
export class ReleaseTontonsComponent {
  @Input() release: Release | null = null;
  @Input() isExpanded = true;
  @Output() toggleExpand = new EventEmitter<void>();
  @Output() releaseUpdated = new EventEmitter<void>();

  constructor(
    private releaseService: ReleaseService,
    private toastService: ToastService
  ) { }

  toggleExpanded(): void {
    this.toggleExpand.emit();
  }

  async updateTontonMep(squadId: string, tontonMepValue: string): Promise<void> {
    const tontonMep = tontonMepValue.trim();
    const squad = this.release?.squads.find(s => s.id === squadId);

    if (!squad) return;

    // Check if value hasn't changed
    const currentTonton = squad.tontonMep || '';
    if (currentTonton === tontonMep) {
      return;
    }

    try {
      await this.releaseService.updateSquad(squadId, { tontonMep });

      // Update local state
      squad.tontonMep = tontonMep;

      // Notify parent to refresh if needed or just handled locally
      this.releaseUpdated.emit();

      // Note: checkAndUpdateCompletion logic was also calling updateSquad(isCompleted).
      // We should probably rely on the backend or parent for full re-calculation if needed,
      // but the original code had it client-side.
      // For now, I'll omit deep logic here to simplify, assuming tonton name doesn't affect completion status directly 
      // (Wait, actually tonton assignment might be required for completion? The original code didn't check tonton for completion, only actions).
      // Original checkAndUpdateCompletion:
      // const progress = this.getSquadProgress(squad);
      // const isCompleted = progress === 100;
      // Changing tonton doesn't change progress (based on pre/post mep actions).
      // So I don't need checkAndUpdateCompletion here unless Tonton presence is part of progress.
      // In getSquadProgress: it only checks actions.
      // So we are good.

    } catch (error) {
      console.error('Error updating Tonton MEP:', error);
      this.toastService.error(
        'Erreur de mise à jour',
        'Impossible de mettre à jour le Tonton MEP. Veuillez réessayer.'
      );
    }
  }
}
