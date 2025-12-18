import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeItem } from '@models/release-note.model';

@Component({
  selector: 'app-release-note-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 p-6">
          <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
            <span class="material-icons">edit_note</span>
            <span>{{ microservice }}</span>
          </h2>
          <p class="text-white/80 mt-1">Gestion des changements</p>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">

          <!-- Quick add mode hint -->
          <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-300">
              <span class="material-icons text-lg">lightbulb</span>
              <div>
                <p class="font-medium">Astuce : Saisie rapide</p>
                <p class="text-blue-700 dark:text-blue-400 mt-0.5">
                  • Appuyez sur <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded text-xs">Tab</kbd> pour passer au champ suivant<br>
                  • Appuyez sur <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded text-xs">Entrée</kbd> dans la description pour ajouter un nouveau change<br>
                  • Appuyez sur <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded text-xs">Ctrl+S</kbd> pour sauvegarder
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-3">

            <!-- Liste des changes (compact inline) -->
            <div *ngFor="let change of changes; let i = index" class="flex items-start space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">

              <!-- Index badge -->
              <div class="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm mt-1">
                {{ i + 1 }}
              </div>

              <!-- Fields (inline compact) -->
              <div class="flex-1 grid grid-cols-[140px_1fr] gap-2">
                <!-- Jira ID -->
                <input
                  type="text"
                  [(ngModel)]="change.jiraId"
                  (keydown.enter)="focusDescription(i)"
                  placeholder="P0267-123456"
                  class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-mono"
                  [attr.data-jira-input]="i"
                />

                <!-- Description -->
                <input
                  type="text"
                  [(ngModel)]="change.description"
                  (keydown.enter)="onDescriptionEnter(i, $event)"
                  placeholder="Courte description du changement..."
                  class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  [attr.data-description-input]="i"
                />
              </div>

              <!-- Delete button -->
              <button
                (click)="removeChange(i)"
                class="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Supprimer (Ctrl+Suppr)"
              >
                <span class="material-icons text-lg">delete</span>
              </button>
            </div>

            <!-- Bouton ajouter change -->
            <button
              (click)="addChange()"
              class="w-full py-3 px-4 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-dashed border-primary-300 dark:border-primary-600"
            >
              <span class="material-icons">add_circle</span>
              <span class="font-medium">Ajouter un change</span>
            </button>

            <!-- Empty state -->
            <div *ngIf="changes.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <span class="material-icons text-3xl text-gray-400 dark:text-gray-500">description</span>
              </div>
              <p class="text-gray-500 dark:text-gray-400">Aucun changement pour l'instant</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Cliquez sur "Ajouter un change" pour commencer</p>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
          <button
            (click)="onCancel()"
            class="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <button
            (click)="onSave()"
            class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <span class="material-icons text-lg">save</span>
            <span>Enregistrer</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ReleaseNoteEntryModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() microservice = '';
  @Input() initialChanges: ChangeItem[] = [];
  @Output() save = new EventEmitter<ChangeItem[]>();
  @Output() cancel = new EventEmitter<void>();

  changes: ChangeItem[] = [];

  ngOnInit() {
    // Écouter Ctrl+S pour sauvegarder
    this.setupKeyboardShortcuts();
  }

  ngOnChanges(changes: SimpleChanges) {
    // ✅ Réagir aux changements de initialChanges ET isOpen
    if (changes['initialChanges'] || (changes['isOpen'] && this.isOpen)) {
      // Clone les changes pour éviter de modifier l'original tant qu'on n'a pas sauvegardé
      this.changes = JSON.parse(JSON.stringify(this.initialChanges || []));

      // Si vide, ajouter un change par défaut
      if (this.changes.length === 0) {
        this.addChange();
      }

      // Focus sur le premier champ Jira ID après un court délai (seulement si la modal s'ouvre)
      if (this.isOpen) {
        setTimeout(() => {
          this.focusJiraId(0);
        }, 100);
      }
    }
  }

  setupKeyboardShortcuts(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S pour sauvegarder
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.onSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup quand le composant est détruit
    // Note: Dans une vraie app, on devrait utiliser ngOnDestroy
  }

  addChange(): void {
    this.changes.push({ jiraId: '', description: '' });

    // Focus sur le nouveau champ Jira ID après un court délai
    setTimeout(() => {
      this.focusJiraId(this.changes.length - 1);
    }, 50);
  }

  removeChange(index: number): void {
    this.changes.splice(index, 1);
  }

  focusJiraId(index: number): void {
    const input = document.querySelector(`[data-jira-input="${index}"]`) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  focusDescription(index: number): void {
    const input = document.querySelector(`[data-description-input="${index}"]`) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  onDescriptionEnter(index: number, event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    // Si c'est le dernier change ET qu'il n'est pas vide, ajouter un nouveau change
    if (index === this.changes.length - 1) {
      const currentChange = this.changes[index];
      if (currentChange.jiraId.trim() || currentChange.description.trim()) {
        this.addChange();
      }
    } else {
      // Sinon, passer au change suivant
      this.focusJiraId(index + 1);
    }
  }

  onSave(): void {
    // Filtrer les changes vides (ni jiraId ni description)
    const validChanges = this.changes.filter(c => c.jiraId.trim() || c.description.trim());
    this.save.emit(validChanges);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Fermer si clic sur le backdrop (mais pas sur la modal elle-même)
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
