import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReleaseNoteEntry, ChangeItem, DeploymentStatus } from '@models/release-note.model';
import { PermissionService } from '@services/permission.service';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  alwaysVisible?: boolean;
}

@Component({
  selector: 'app-microservices-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host {
      display: block;
    }
  `],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden" *ngIf="entries.length > 0">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
            <tr>
              <th *ngIf="isColumnVisible('deployOrder')" class="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[70px]">
                <button (click)="onSort('deployOrder')" class="flex items-center justify-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-full">
                  <span>Ordre</span>
                  <span class="material-icons text-sm">{{ getSortIcon('deployOrder') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('squad')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-20">
                <button (click)="onSort('squad')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>Squad</span>
                  <span class="material-icons text-sm">{{ getSortIcon('squad') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('microservice')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <button (click)="onSort('microservice')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>Microservice</span>
                  <span class="material-icons text-sm">{{ getSortIcon('microservice') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('solution')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-24">
                <button (click)="onSort('solution')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>Solution</span>
                  <span class="material-icons text-sm">{{ getSortIcon('solution') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('partEnMep')" class="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-16">
                <button (click)="onSort('partEnMep')" class="flex items-center justify-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-full">
                  <span>MEP</span>
                  <span class="material-icons text-sm">{{ getSortIcon('partEnMep') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('status')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-36">
                <button (click)="onSort('status')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>Avancement</span>
                  <span class="material-icons text-sm">{{ getSortIcon('status') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('tag')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[110px]">
                <button (click)="onSort('tag')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>Tag</span>
                  <span class="material-icons text-sm">{{ getSortIcon('tag') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('previousTag')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-20">
                <button (click)="onSort('previousTag')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>Tag N-1</span>
                  <span class="material-icons text-sm">{{ getSortIcon('previousTag') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('parentVersion')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[110px]">
                <button (click)="onSort('parentVersion')" class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span>MB Lib</span>
                  <span class="material-icons text-sm">{{ getSortIcon('parentVersion') }}</span>
                </button>
              </th>
              <th *ngIf="isColumnVisible('changes')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[300px]">Changes</th>
              <th *ngIf="isColumnVisible('comment')" class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">Commentaire</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              *ngFor="let entry of entries"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              [class.opacity-50]="!entry.partEnMep"
            >
              <!-- Deploy Order -->
              <td *ngIf="isColumnVisible('deployOrder')" class="px-3 py-2">
                <div class="flex items-center space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all w-[60px]">
                  <input
                    #deployOrderInput
                    type="text"
                    maxlength="2"
                    [value]="entry.deployOrder || ''"
                    (keyup.enter)="onFieldUpdate(entry, 'deployOrder', deployOrderInput.value)"
                    [disabled]="!entry.partEnMep || !hasWriteAccess()"
                    placeholder="-"
                    class="w-5 bg-transparent text-xs text-center font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    *ngIf="hasWriteAccess() && entry.partEnMep"
                    (click)="onFieldUpdate(entry, 'deployOrder', deployOrderInput.value)"
                    [disabled]="deployOrderInput.value === (entry.deployOrder?.toString() || '')"
                    [ngClass]="{
                      'opacity-30 cursor-not-allowed': deployOrderInput.value === (entry.deployOrder?.toString() || ''),
                      'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30': deployOrderInput.value !== (entry.deployOrder?.toString() || '')
                    }"
                    class="p-0.5 rounded transition-all flex-shrink-0"
                    title="Valider"
                  >
                    <span class="material-icons text-sm">check</span>
                  </button>
                </div>
              </td>

              <!-- Squad -->
              <td *ngIf="isColumnVisible('squad')" class="px-3 py-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" [ngClass]="{
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': entry.squad === 'Squad 1',
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': entry.squad === 'Squad 2',
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': entry.squad === 'Squad 3',
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300': entry.squad === 'Squad 4',
                  'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300': entry.squad === 'Squad 5',
                  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300': entry.squad === 'Squad 6'
                }">
                  {{ entry.squad.replace('Squad ', 'S') }}
                </span>
              </td>

              <!-- Microservice -->
              <td *ngIf="isColumnVisible('microservice')" class="px-3 py-2">
                <div class="font-medium text-gray-900 dark:text-white text-sm truncate max-w-xs" [title]="entry.microservice">
                  {{ entry.microservice }}
                </div>
              </td>

              <!-- Solution -->
              <td *ngIf="isColumnVisible('solution')" class="px-3 py-2">
                <span class="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {{ entry.solution || '-' }}
                </span>
              </td>

              <!-- Part en MEP -->
              <td *ngIf="isColumnVisible('partEnMep')" class="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  [checked]="entry.partEnMep"
                  (change)="onPartEnMepToggle(entry)"
                  [disabled]="!hasWriteAccess()"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </td>

              <!-- Status -->
              <td *ngIf="isColumnVisible('status')" class="px-3 py-2">
                <div class="flex items-center space-x-1">
                  <!-- HOM2 -->
                  <button
                    (click)="onToggleStatus(entry, 'HOM2')"
                    [disabled]="!entry.partEnMep || !hasWriteAccess()"
                    class="w-6 h-6 rounded-full flex items-center justify-center transition-all border disabled:opacity-50 disabled:cursor-not-allowed"
                    [ngClass]="{
                      'bg-gray-200 border-gray-300 text-gray-500': entry.status === 'HOM2',
                      'bg-white border-gray-200 text-gray-300 hover:border-gray-300': entry.status !== 'HOM2',
                      'ring-2 ring-offset-1 ring-gray-400': entry.status === 'HOM2'
                    }"
                    title="HOM2"
                  >
                    <div class="w-2 h-2 rounded-full bg-current"></div>
                  </button>

                  <!-- IN_PROGRESS_PROD -->
                  <button
                    (click)="onToggleStatus(entry, 'IN_PROGRESS_PROD')"
                    [disabled]="!entry.partEnMep || !hasWriteAccess()"
                    class="w-6 h-6 rounded-full flex items-center justify-center transition-all border disabled:opacity-50 disabled:cursor-not-allowed"
                    [ngClass]="{
                      'bg-amber-100 border-amber-200 text-amber-600': entry.status === 'IN_PROGRESS_PROD',
                      'bg-white border-gray-200 text-gray-300 hover:border-amber-200 hover:text-amber-300': entry.status !== 'IN_PROGRESS_PROD',
                      'ring-2 ring-offset-1 ring-amber-400': entry.status === 'IN_PROGRESS_PROD'
                    }"
                    title="En cours Prod"
                  >
                    <div class="w-2 h-2 rounded-full bg-current"></div>
                  </button>

                  <!-- DEPLOYED_PROD -->
                  <button
                    (click)="onToggleStatus(entry, 'DEPLOYED_PROD')"
                    [disabled]="!entry.partEnMep || !hasWriteAccess()"
                    class="w-6 h-6 rounded-full flex items-center justify-center transition-all border disabled:opacity-50 disabled:cursor-not-allowed"
                    [ngClass]="{
                      'bg-green-100 border-green-200 text-green-600': entry.status === 'DEPLOYED_PROD',
                      'bg-white border-gray-200 text-gray-300 hover:border-green-200 hover:text-green-300': entry.status !== 'DEPLOYED_PROD',
                      'ring-2 ring-offset-1 ring-green-400': entry.status === 'DEPLOYED_PROD'
                    }"
                    title="Prod OK"
                  >
                    <div class="w-2 h-2 rounded-full bg-current"></div>
                  </button>

                  <!-- ROLLBACK -->
                  <button
                    (click)="onToggleStatus(entry, 'ROLLBACK')"
                    [disabled]="!entry.partEnMep || !hasWriteAccess()"
                    class="w-6 h-6 rounded-full flex items-center justify-center transition-all border disabled:opacity-50 disabled:cursor-not-allowed"
                    [ngClass]="{
                      'bg-red-100 border-red-200 text-red-600': entry.status === 'ROLLBACK',
                      'bg-white border-gray-200 text-gray-300 hover:border-red-200 hover:text-red-300': entry.status !== 'ROLLBACK',
                      'ring-2 ring-offset-1 ring-red-400': entry.status === 'ROLLBACK'
                    }"
                    title="Rollback"
                  >
                    <div class="w-2 h-2 rounded-full bg-current"></div>
                  </button>
                </div>
              </td>

              <!-- Tag -->
              <td *ngIf="isColumnVisible('tag')" class="px-3 py-2">
                <div class="flex items-center space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all max-w-[110px]">
                  <input
                    #tagInput
                    type="text"
                    maxlength="8"
                    [value]="entry.tag || ''"
                    (keyup.enter)="onFieldUpdate(entry, 'tag', tagInput.value)"
                    [disabled]="!entry.partEnMep || !hasWriteAccess()"
                    placeholder="-"
                    class="w-full bg-transparent text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    *ngIf="hasWriteAccess() && entry.partEnMep"
                    (click)="onFieldUpdate(entry, 'tag', tagInput.value)"
                    [disabled]="tagInput.value === (entry.tag || '')"
                    [ngClass]="{
                      'opacity-30 cursor-not-allowed': tagInput.value === (entry.tag || ''),
                      'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30': tagInput.value !== (entry.tag || '')
                    }"
                    class="p-0.5 rounded transition-all flex-shrink-0"
                    title="Valider"
                  >
                    <span class="material-icons text-sm">check</span>
                  </button>
                </div>
              </td>

              <!-- Tag N-1 -->
              <td *ngIf="isColumnVisible('previousTag')" class="px-3 py-2">
                <div class="text-gray-600 dark:text-gray-400 font-mono text-xs w-16">
                  {{ entry.previousTag || '-' }}
                </div>
              </td>

              <!-- Parent Version -->
              <td *ngIf="isColumnVisible('parentVersion')" class="px-3 py-2">
                <div class="flex items-center space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all max-w-[110px]">
                  <input
                    #parentVersionInput
                    type="text"
                    maxlength="8"
                    [value]="entry.parentVersion || ''"
                    (keyup.enter)="onFieldUpdate(entry, 'parentVersion', parentVersionInput.value)"
                    [disabled]="!hasWriteAccess()"
                    placeholder="-"
                    class="w-full bg-transparent text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    *ngIf="hasWriteAccess()"
                    (click)="onFieldUpdate(entry, 'parentVersion', parentVersionInput.value)"
                    [disabled]="parentVersionInput.value === (entry.parentVersion || '')"
                    [ngClass]="{
                      'opacity-30 cursor-not-allowed': parentVersionInput.value === (entry.parentVersion || ''),
                      'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30': parentVersionInput.value !== (entry.parentVersion || '')
                    }"
                    class="p-0.5 rounded transition-all flex-shrink-0"
                    title="Valider"
                  >
                    <span class="material-icons text-sm">check</span>
                  </button>
                </div>
              </td>

              <!-- Changes -->
              <td *ngIf="isColumnVisible('changes')" class="px-3 py-2 min-w-[300px]">
                <div class="flex flex-col gap-1" *ngIf="entry.changes && entry.changes.length > 0">
                  <div
                    *ngFor="let change of entry.changes"
                    class="inline-flex items-start px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                    [title]="change.jiraId + ': ' + change.description"
                  >
                    <span class="font-semibold shrink-0">{{ change.jiraId }}</span>
                    <span class="ml-1 text-blue-600 dark:text-blue-400">: {{ change.description }}</span>
                  </div>
                </div>
                <button
                  (click)="onOpenChangesModal(entry)"
                  [disabled]="!hasWriteAccess()"
                  class="mt-1 flex items-center space-x-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  <span class="material-icons text-xs">{{ entry.changes && entry.changes.length > 0 ? 'edit_note' : 'add_circle' }}</span>
                  <span>{{ entry.changes && entry.changes.length > 0 ? 'Modifier (' + entry.changes.length + ')' : 'Ajouter' }}</span>
                </button>
              </td>

              <!-- Commentaire -->
              <td *ngIf="isColumnVisible('comment')" class="px-3 py-2">
                <div class="flex items-start space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all">
                  <textarea
                    #commentInput
                    [value]="entry.comment || ''"
                    (keydown)="onCommentKeyDown($event, entry, commentInput)"
                    [disabled]="!hasWriteAccess()"
                    placeholder="Commentaire..."
                    rows="1"
                    (input)="autoResize(commentInput)"
                    class="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-0 resize-none overflow-hidden leading-relaxed"
                    style="min-height: 1.5rem; max-height: 150px;"
                  ></textarea>
                  <button
                    *ngIf="hasWriteAccess()"
                    (click)="onFieldUpdate(entry, 'comment', commentInput.value)"
                    [disabled]="commentInput.value === (entry.comment || '')"
                    [ngClass]="{
                      'opacity-30 cursor-not-allowed': commentInput.value === (entry.comment || ''),
                      'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30': commentInput.value !== (entry.comment || '')
                    }"
                    class="p-0.5 rounded transition-all flex-shrink-0"
                    title="Valider (Enter avec Ctrl)"
                  >
                    <span class="material-icons text-sm">check</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MicroservicesTableComponent implements AfterViewInit {
  @Input() entries: ReleaseNoteEntry[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Input() sortColumn = 'deployOrder';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() fieldUpdate = new EventEmitter<{ entry: ReleaseNoteEntry; field: string; value: string }>();
  @Output() partEnMepToggle = new EventEmitter<ReleaseNoteEntry>();
  @Output() openChangesModal = new EventEmitter<ReleaseNoteEntry>();
  @Output() sort = new EventEmitter<string>();

  @ViewChildren('commentInput') commentInputs!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(private permissionService: PermissionService) { }

  ngAfterViewInit(): void {
    this.resizeAllCommentTextareas();
    this.commentInputs.changes.subscribe(() => {
      setTimeout(() => this.resizeAllCommentTextareas(), 0);
    });
  }

  hasWriteAccess(): boolean {
    return this.permissionService.hasWriteAccess('RELEASES');
  }

  isColumnVisible(key: string): boolean {
    const column = this.columns.find(c => c.key === key);
    return column ? column.visible : true;
  }

  onFieldUpdate(entry: ReleaseNoteEntry, field: string, value: any): void {
    this.fieldUpdate.emit({ entry, field, value });
  }

  onPartEnMepToggle(entry: ReleaseNoteEntry): void {
    this.partEnMepToggle.emit(entry);
  }

  onToggleStatus(entry: ReleaseNoteEntry, status: string): void {
    const newStatus = entry.status === status ? null : status;
    this.onFieldUpdate(entry, 'status', newStatus);
  }

  onOpenChangesModal(entry: ReleaseNoteEntry): void {
    this.openChangesModal.emit(entry);
  }

  onSort(column: string): void {
    this.sort.emit(column);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'expand_less' : 'expand_more';
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  onCommentKeyDown(event: KeyboardEvent, entry: ReleaseNoteEntry, textarea: HTMLTextAreaElement): void {
    if (event.key !== 'Enter') {
      return;
    }

    if (event.ctrlKey) {
      event.preventDefault();
      this.onFieldUpdate(entry, 'comment', textarea.value);
    }
  }

  private resizeAllCommentTextareas(): void {
    this.commentInputs.forEach(input => {
      if (input.nativeElement.value) {
        this.autoResize(input.nativeElement);
      }
    });
  }
}
