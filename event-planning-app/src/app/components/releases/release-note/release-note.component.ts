import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReleaseService } from '@services/release.service';
import { ReleaseNoteService } from '@services/release-note.service';
import { MicroserviceService } from '@services/microservice.service';
import { ToastService } from '@services/toast.service';
import { PermissionService } from '@services/permission.service';
import { ConfirmationService } from '@services/confirmation.service';
import { Release } from '@models/release.model';
import { ReleaseNoteEntry, ChangeItem, CreateReleaseNoteEntryRequest, SQUAD_OPTIONS } from '@models/release-note.model';
import { Microservice } from '@models/microservice.model';
import { ReleaseNoteEntryModalComponent } from './release-note-entry-modal.component';
import { MicroserviceManagementModalComponent } from './microservice-management-modal.component';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GroupedEntry {
  squad: string;
  entries: ReleaseNoteEntry[];
  isExpanded: boolean;
}

@Component({
  selector: 'app-release-note',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatDialogModule, ReleaseNoteEntryModalComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6" *ngIf="release">

      <!-- Header avec gradient -->
      <div class="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 rounded-2xl shadow-xl p-8">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
        </div>

        <div class="relative z-10">
          <button
            (click)="goBack()"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30 hover:shadow-lg mb-6"
          >
            <span class="material-icons">arrow_back</span>
            <span class="font-medium">Retour</span>
          </button>

          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-3">
                <span class="material-icons text-4xl text-white">description</span>
                <h1 class="text-4xl font-bold text-white tracking-tight">Release Note</h1>
              </div>
              <h2 class="text-2xl font-semibold text-white/90 mb-3">{{ release.name }}</h2>
              <div class="flex items-center space-x-4 text-white/90">
                <div class="flex items-center space-x-2">
                  <span class="material-icons text-xl">event</span>
                  <span class="text-lg font-medium">{{ formatDate(release.releaseDate) }}</span>
                </div>
                <div class="w-px h-6 bg-white/30"></div>
                <div class="flex items-center space-x-2">
                  <span class="material-icons text-xl">apps</span>
                  <span class="text-lg">{{ getTotalEntriesCount() }} microservice{{ getTotalEntriesCount() > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>

            <!-- Link to Prépa MEP -->
            <a
              [routerLink]="['/releases', release.id, 'preparation']"
              class="hidden lg:flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:shadow-lg"
            >
              <span class="material-icons">assignment</span>
              <span class="font-medium">Voir Prépa MEP</span>
            </a>
          </div>

          <p class="text-white/90 mt-4 text-lg leading-relaxed max-w-3xl" *ngIf="release.description">
            {{ release.description }}
          </p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Filter by squad -->
          <div class="flex items-center space-x-2">
            <span class="material-icons text-gray-500 dark:text-gray-400">filter_list</span>
            <select
              [(ngModel)]="selectedSquad"
              (ngModelChange)="onFilterChange()"
              class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="">Toutes les squads</option>
              <option *ngFor="let squad of squadOptions" [value]="squad">{{ squad }}</option>
            </select>
          </div>

          <!-- Filter by Part En MEP -->
          <div class="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              id="showOnlyPartEnMep"
              [(ngModel)]="showOnlyPartEnMep"
              (change)="onFilterChange()"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="showOnlyPartEnMep" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Concernés par la MEP
            </label>
          </div>

          <!-- Search -->
          <div class="relative">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              placeholder="Rechercher un microservice..."
              class="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-80"
            />
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Add microservice button -->
          <button
            *ngIf="hasWriteAccess()"
            (click)="openAddMicroserviceModal()"
            class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span class="material-icons">add</span>
            <span class="font-medium">Ajouter un microservice</span>
          </button>

          <!-- Export dropdown -->
          <div class="relative">
            <button
              (click)="toggleExportDropdown()"
              class="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 border border-gray-300 dark:border-gray-600"
            >
              <span class="material-icons">download</span>
              <span class="font-medium">Exporter</span>
              <span class="material-icons text-lg">{{ isExportDropdownOpen ? 'expand_less' : 'expand_more' }}</span>
            </button>

            <!-- Dropdown menu -->
            <div
              *ngIf="isExportDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              <button
                (click)="exportMarkdown()"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
              >
                <span class="material-icons text-gray-600 dark:text-gray-400">article</span>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">Markdown</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Format .md</div>
                </div>
              </button>

              <button
                (click)="exportHtml()"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
              >
                <span class="material-icons text-gray-600 dark:text-gray-400">code</span>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">HTML</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Email & web</div>
                </div>
              </button>

              <button
                (click)="exportPng()"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
              >
                <span class="material-icons text-gray-600 dark:text-gray-400">image</span>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">PNG</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Image</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Single table with all microservices -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden" *ngIf="filteredEntries.length > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[70px]">Ordre</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-20">Squad</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Microservice</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-24">Solution</th>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-16">MEP</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[110px]">Tag</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-20">Tag N-1</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[110px]">MB Lib</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Changes</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-40">Commentaire</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                *ngFor="let entry of filteredEntries"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                [class.opacity-50]="!entry.partEnMep"
              >
                <!-- Deploy Order (editable inline) -->
                <td class="px-3 py-2">
                  <div class="flex items-center justify-center space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all max-w-[70px]">
                    <input
                      #deployOrderInput
                      type="number"
                      maxlength="2"
                      max="99"
                      [value]="entry.deployOrder || ''"
                      (keyup.enter)="updateField(entry, 'deployOrder', deployOrderInput.value)"
                      [disabled]="!entry.partEnMep || !hasWriteAccess()"
                      placeholder="-"
                      class="w-7 bg-transparent text-xs text-center font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      *ngIf="hasWriteAccess() && entry.partEnMep"
                      (click)="updateField(entry, 'deployOrder', deployOrderInput.value)"
                      [disabled]="deployOrderInput.value === (entry.deployOrder?.toString() || '')"
                      [ngClass]="{
                        'opacity-30 cursor-not-allowed': deployOrderInput.value === (entry.deployOrder?.toString() || ''),
                        'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30': deployOrderInput.value !== (entry.deployOrder?.toString() || '')
                      }"
                      class="p-0.5 rounded transition-all"
                      title="Valider"
                    >
                      <span class="material-icons text-sm">check</span>
                    </button>
                  </div>
                </td>

                <!-- Squad (read-only badge) -->
                <td class="px-3 py-2">
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

                <!-- Microservice (read-only) -->
                <td class="px-3 py-2">
                  <div class="font-medium text-gray-900 dark:text-white text-sm truncate max-w-xs" [title]="entry.microservice">
                    {{ entry.microservice }}
                  </div>
                </td>

                <!-- Solution (read-only) -->
                <td class="px-3 py-2">
                  <span class="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {{ entry.solution || '-' }}
                  </span>
                </td>

                <!-- Part en MEP (checkbox) -->
                <td class="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="entry.partEnMep"
                    (change)="togglePartEnMep(entry)"
                    [disabled]="!hasWriteAccess()"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </td>

                <!-- Tag (editable inline) -->
                <td class="px-3 py-2">
                  <div class="flex items-center space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all max-w-[110px]">
                    <input
                      #tagInput
                      type="text"
                      maxlength="8"
                      [value]="entry.tag || ''"
                      (keyup.enter)="updateField(entry, 'tag', tagInput.value)"
                      [disabled]="!entry.partEnMep || !hasWriteAccess()"
                      placeholder="-"
                      class="w-16 bg-transparent text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      *ngIf="hasWriteAccess() && entry.partEnMep"
                      (click)="updateField(entry, 'tag', tagInput.value)"
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

                <!-- Tag N-1 (read-only display) -->
                <td class="px-3 py-2">
                  <div class="text-gray-600 dark:text-gray-400 font-mono text-xs w-16">
                    {{ entry.previousTag || '-' }}
                  </div>
                </td>

                <!-- Parent Version (editable inline) -->
                <td class="px-3 py-2">
                  <div class="flex items-center space-x-1 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-200 transition-all max-w-[110px]">
                    <input
                      #parentVersionInput
                      type="text"
                      maxlength="8"
                      [value]="entry.parentVersion || ''"
                      (keyup.enter)="updateField(entry, 'parentVersion', parentVersionInput.value)"
                      [disabled]="!hasWriteAccess()"
                      placeholder="-"
                      class="w-16 bg-transparent text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      *ngIf="hasWriteAccess()"
                      (click)="updateField(entry, 'parentVersion', parentVersionInput.value)"
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

                <!-- Changes (quick view with badges) -->
                <td class="px-3 py-2">
                  <div class="flex flex-wrap gap-1" *ngIf="entry.changes && entry.changes.length > 0">
                    <div
                      *ngFor="let change of entry.changes"
                      class="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium"
                      [title]="change.jiraId + ': ' + change.description"
                    >
                      <span class="font-semibold">{{ change.jiraId }}</span>
                      <span class="ml-1 text-blue-600 dark:text-blue-400 truncate max-w-[100px]">: {{ change.description }}</span>
                    </div>
                  </div>
                  <!-- Button to edit -->
                  <button
                    (click)="openChangesModal(entry)"
                    [disabled]="!hasWriteAccess()"
                    class="mt-1 flex items-center space-x-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    <span class="material-icons text-xs">{{ entry.changes && entry.changes.length > 0 ? 'edit_note' : 'add_circle' }}</span>
                    <span>{{ entry.changes && entry.changes.length > 0 ? 'Modifier (' + entry.changes.length + ')' : 'Ajouter' }}</span>
                  </button>
                </td>
                <!-- Commentaire (editable inline avec auto-height) -->
                <td class="px-3 py-2">
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
                      (click)="updateField(entry, 'comment', commentInput.value)"
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

      <!-- Empty state -->
      <div *ngIf="groupedEntries.length === 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <span class="material-icons text-4xl text-gray-400 dark:text-gray-500">description</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun microservice</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ searchQuery || selectedSquad ? 'Aucun résultat ne correspond aux filtres' : 'Commencez par ajouter des microservices à cette release note' }}
        </p>
        <button
          *ngIf="hasWriteAccess() && !searchQuery && !selectedSquad"
          (click)="openAddMicroserviceModal()"
          class="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span class="material-icons">add</span>
          <span class="font-medium">Ajouter un microservice</span>
        </button>
      </div>

    </div>

    <!-- Modal for adding/editing entry -->
    <app-release-note-entry-modal
      [isOpen]="isChangesModalOpen"
      [microservice]="currentEditingMicroservice"
      [initialChanges]="currentEditingChanges"
      (save)="onChangesSave($event)"
      (cancel)="onChangesCancel()"
    ></app-release-note-entry-modal>

  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReleaseNoteComponent implements OnInit, AfterViewInit {
  release: Release | null = null;
  entries: ReleaseNoteEntry[] = [];
  groupedEntries: GroupedEntry[] = [];
  filteredEntries: ReleaseNoteEntry[] = [];
  squadOptions = SQUAD_OPTIONS;

  @ViewChildren('commentInput') commentInputs!: QueryList<ElementRef<HTMLTextAreaElement>>;

  // Microservices
  microservices: Microservice[] = [];
  microservicesBySquad: Map<string, Microservice[]> = new Map();

  // Filters
  selectedSquad = '';
  searchQuery = '';
  showOnlyPartEnMep = false;

  // Export dropdown
  isExportDropdownOpen = false;

  // Inline editing
  editingEntryId: string | null = null;
  editingEntry: any = {};
  editingField = '';

  // Changes modal
  isChangesModalOpen = false;
  currentEditingMicroservice = '';
  currentEditingChanges: ChangeItem[] = [];
  currentEditingEntry: ReleaseNoteEntry | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private releaseService: ReleaseService,
    private releaseNoteService: ReleaseNoteService,
    private microserviceService: MicroserviceService,
    private toastService: ToastService,
    private permissionService: PermissionService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    console.log('🚀 ReleaseNoteComponent ngOnInit() called');
    const releaseId = this.route.snapshot.paramMap.get('id');
    console.log('   Release ID from route:', releaseId);

    if (releaseId) {
      console.log('   ✅ Loading release, entries, and microservices...');
      this.loadRelease(releaseId);
      this.loadEntries(releaseId);
      this.loadMicroservices(releaseId);
    } else {
      console.error('   ❌ No releaseId found in route!');
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.isExportDropdownOpen = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Auto-resize tous les textareas commentaire au chargement
    this.resizeAllCommentTextareas();

    // Re-resize après chaque changement de la liste
    this.commentInputs.changes.subscribe(() => {
      setTimeout(() => this.resizeAllCommentTextareas(), 0);
    });
  }

  private resizeAllCommentTextareas(): void {
    this.commentInputs.forEach(input => {
      if (input.nativeElement.value) {
        this.autoResize(input.nativeElement);
      }
    });
  }

  loadMicroservices(releaseId?: string): void {
    // Charger microservices avec previousTag pré-rempli en passant releaseId
    this.microserviceService.getAllActive(releaseId).subscribe({
      next: (microservices) => {
        console.log('📦 Microservices loaded:', microservices.length);
        this.microservices = microservices;
        this.groupMicroservicesBySquad();
        // ⚠️ N'appeler applyFilters() QUE si les entries sont déjà chargées
        if (this.entries.length > 0) {
          console.log('✅ Entries already loaded, applying filters');
          this.applyFilters();
        } else {
          console.log('⏳ Waiting for entries to load...');
        }
      },
      error: (error) => {
        console.error('Error loading microservices:', error);
        this.toastService.error('Erreur lors du chargement des microservices');
      }
    });
  }

  groupMicroservicesBySquad(): void {
    this.microservicesBySquad.clear();
    SQUAD_OPTIONS.forEach(squad => {
      this.microservicesBySquad.set(squad,
        this.microservices.filter(ms => ms.squad === squad)
      );
    });
  }

  openAddMicroserviceModal(): void {
    const dialogRef = this.dialog.open(MicroserviceManagementModalComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: Microservice | undefined) => {
      if (result && this.release) {
        // ⚠️ Vérifier si une entrée existe déjà pour ce microservice dans cette release
        const existingEntry = this.entries.find(e =>
          e.microserviceId === result.id ||
          (e.microservice && e.microservice === result.name)
        );

        if (existingEntry) {
          // Entrée existe déjà → juste recharger pour afficher le nouveau microservice
          console.log('✅ Entry already exists for microservice', result.name, '- skipping creation');
          this.loadMicroservices(this.release!.id);
          this.applyFilters();
          this.toastService.success('Microservice créé (déjà présent dans le tableau)');
          return;
        }

        // Créer automatiquement une entrée de release note pour ce nouveau microservice
        const newEntryRequest: CreateReleaseNoteEntryRequest = {
          microserviceId: result.id,
          microservice: result.name,
          squad: result.squad,
          partEnMep: false, // Par défaut, pas concerné par la MEP
          changes: []
        };

        this.releaseNoteService.createEntry(this.release.id!, newEntryRequest).subscribe({
          next: (created) => {
            this.entries.push(created);
            this.loadMicroservices(this.release!.id); // Recharger avec tags N-1
            this.applyFilters();
            this.toastService.success('Microservice créé et ajouté au tableau');
          },
          error: (error) => {
            console.error('Error creating release note entry:', error);
            // Le microservice est créé mais pas l'entrée → juste recharger
            this.loadMicroservices(this.release!.id);
            this.toastService.warning('Microservice créé, mais erreur lors de l\'ajout au tableau');
          }
        });
      }
    });
  }

  openEditMicroserviceModal(microservice: Microservice): void {
    const dialogRef = this.dialog.open(MicroserviceManagementModalComponent, {
      width: '600px',
      data: { mode: 'edit', microservice }
    });

    dialogRef.afterClosed().subscribe((result: Microservice | undefined) => {
      if (result) {
        this.loadMicroservices();
        this.toastService.success('Microservice modifié avec succès');
      }
    });
  }

  async deleteMicroservice(microservice: Microservice): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer le microservice',
      message: `Êtes-vous sûr de vouloir désactiver "${microservice.name}" ? Il ne sera plus visible dans la liste.`,
      confirmButtonClass: 'danger'
    });

    if (confirmed) {
      this.microserviceService.delete(microservice.id!).subscribe({
        next: () => {
          this.loadMicroservices();
          this.toastService.success('Microservice désactivé avec succès');
        },
        error: (error) => {
          console.error('Error deleting microservice:', error);
          this.toastService.error('Erreur lors de la suppression du microservice');
        }
      });
    }
  }

  async loadRelease(releaseId: string): Promise<void> {
    try {
      this.release = await this.releaseService.getRelease(releaseId);
      this.applyFilters();
    } catch (error) {
      console.error('Error loading release:', error);
      this.toastService.error('Erreur lors du chargement de la release');
      this.router.navigate(['/releases']);
    }
  }

  loadEntries(releaseId: string): void {
    console.log('🔄 loadEntries() called with releaseId:', releaseId);
    this.releaseNoteService.getAllEntries(releaseId).subscribe({
      next: (entries) => {
        console.log('📥 RAW Entries from service (BEFORE assignment):', JSON.parse(JSON.stringify(entries)));

        this.entries = entries;

        console.log('📥 this.entries (AFTER assignment):', JSON.parse(JSON.stringify(this.entries)));
        console.log('📥 Detailed check:');
        entries.forEach(e => {
          console.log(`   - ID: ${e.id}, MS: ${e.microservice}, Changes: ${e.changes?.length || 0}`, e.changes);
        });

        // ⚠️ Toujours appeler applyFilters() après le chargement des entries
        // Même si les microservices ne sont pas encore chargés (ils seront ajoutés après)
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        this.toastService.error('Erreur lors du chargement des entrées');
      }
    });
  }

  applyFilters(): void {
    if (!this.release) return;

    console.log('🔍 applyFilters() called');
    console.log(`   - this.entries (${this.entries.length}):`, this.entries);
    console.log(`   - this.microservices (${this.microservices.length}):`, this.microservices);

    // Start with all active microservices
    const allEntries: ReleaseNoteEntry[] = this.microservices.map(ms => {
      // Find existing entry for this microservice
      // We check both microserviceId match AND name match (legacy support)
      const existing = this.entries.find(e =>
        e.microserviceId === ms.id ||
        (e.microservice && e.microservice === ms.name)
      );

      if (existing) {
        // Enforce solution and previousTag from microservice entity
        const merged = {
          ...existing,
          solution: ms.solution,
          previousTag: existing.previousTag || ms.previousTag
        };
        console.log(`🔄 Merging entry for ${ms.name}:`, {
          microserviceId: ms.id,
          existingEntryId: existing.id,
          existingMicroserviceId: existing.microserviceId,
          existingMicroservice: existing.microservice,
          changesCount: existing.changes?.length || 0,
          changes: existing.changes,
          mergedChanges: merged.changes
        });
        return merged;
      } else {
        console.log(`⚠️ No existing entry found for microservice ${ms.name} (ID: ${ms.id})`);
      }

      // Create placeholder entry
      return {
        releaseId: this.release!.id!,
        microserviceId: ms.id,
        microservice: ms.name,
        solution: ms.solution,
        squad: ms.squad,
        partEnMep: false,
        previousTag: ms.previousTag,
        changes: []
      } as ReleaseNoteEntry;
    });

    // Also include entries that might not match any active microservice (e.g. deleted microservices or legacy text-only entries)
    const mappedIds = new Set(allEntries.map(e => e.id).filter(id => !!id));
    const orphans = this.entries.filter(e => e.id && !mappedIds.has(e.id));

    // For orphans, we might not have the solution if the microservice is deleted, but we keep them as is.

    let filtered = [...allEntries, ...orphans];

    // Filter by squad
    if (this.selectedSquad) {
      filtered = filtered.filter(e => e.squad === this.selectedSquad);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.microservice || '').toLowerCase().includes(query) ||
        (e.solution || '').toLowerCase().includes(query)
      );
    }

    // Filter by Part En MEP
    if (this.showOnlyPartEnMep) {
      filtered = filtered.filter(e => e.partEnMep);
    }

    // Group by squad
    const grouped = new Map<string, ReleaseNoteEntry[]>();
    filtered.forEach(entry => {
      if (!grouped.has(entry.squad)) {
        grouped.set(entry.squad, []);
      }
      grouped.get(entry.squad)!.push(entry);
    });

    // Convert to array and sort
    this.groupedEntries = Array.from(grouped.entries()).map(([squad, entries]) => ({
      squad,
      entries: entries.sort((a, b) => {
        // Sort by deployOrder (nulls last), then by microservice name
        if (a.deployOrder != null && b.deployOrder != null) {
          return a.deployOrder - b.deployOrder;
        }
        if (a.deployOrder != null) return -1;
        if (b.deployOrder != null) return 1;
        return (a.microservice || '').localeCompare(b.microservice || '');
      }),
      isExpanded: true // All expanded by default
    }));

    // Sort squads
    this.groupedEntries.sort((a, b) => a.squad.localeCompare(b.squad));

    // New: Create flat filtered list sorted by deployOrder
    this.filteredEntries = [...filtered].sort((a, b) => {
      // Prioritize entries with deployOrder
      if (a.deployOrder != null && b.deployOrder != null) {
        return a.deployOrder - b.deployOrder;
      }
      if (a.deployOrder != null) return -1;
      if (b.deployOrder != null) return 1;
      // Then by squad
      const squadCompare = (a.squad || '').localeCompare(b.squad || '');
      if (squadCompare !== 0) return squadCompare;
      // Finally by microservice name
      return (a.microservice || '').localeCompare(b.microservice || '');
    });

    // TEMP: Override groupedEntries with a single group containing all entries
    this.groupedEntries = [{
      squad: 'Tous les microservices',
      entries: this.filteredEntries,
      isExpanded: true
    }];
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleSquad(squad: string): void {
    const group = this.groupedEntries.find(g => g.squad === squad);
    if (group) {
      group.isExpanded = !group.isExpanded;
    }
  }

  getTotalEntriesCount(): number {
    return this.entries.length;
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'd MMMM yyyy', { locale: fr });
  }

  hasWriteAccess(): boolean {
    return this.permissionService.hasWriteAccess('RELEASES');
  }

  goBack(): void {
    this.router.navigate(['/releases']);
  }

  // Auto-resize textarea pour afficher tout le commentaire
  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  // Gestion du Ctrl+Enter pour le textarea commentaire (Enter seul pour nouvelle ligne)
  onCommentKeyDown(event: KeyboardEvent, entry: ReleaseNoteEntry, textarea: HTMLTextAreaElement): void {
    // Vérifier d'abord que c'est bien la touche Enter
    if (event.key !== 'Enter') {
      return;
    }

    // Si Ctrl+Enter, sauvegarder
    if (event.ctrlKey) {
      event.preventDefault();
      this.updateField(entry, 'comment', textarea.value);
    }
    // Enter seul = nouvelle ligne (comportement par défaut du textarea)
  }

  // Inline editing (nouvelle méthode simplifiée)
  updateField(entry: ReleaseNoteEntry, field: string, value: string): void {
    if (!this.hasWriteAccess() || !this.release) return;

    // Ne rien faire si la valeur n'a pas changé
    const currentValue = field === 'deployOrder'
      ? (entry.deployOrder?.toString() || '')
      : ((entry as any)[field] || '');

    if (value === currentValue) {
      return;
    }

    // Préparer la requête
    const request: CreateReleaseNoteEntryRequest = {
      microserviceId: entry.microserviceId,
      microservice: entry.microservice,
      squad: entry.squad,
      partEnMep: entry.partEnMep,
      deployOrder: field === 'deployOrder' ? (value ? parseInt(value, 10) : undefined) : entry.deployOrder,
      tag: field === 'tag' ? value : entry.tag,
      previousTag: entry.previousTag,
      parentVersion: field === 'parentVersion' ? value : entry.parentVersion,
      comment: field === 'comment' ? value : entry.comment,
      changes: entry.changes || []
    };

    // Si l'entrée n'a pas d'ID, c'est une nouvelle entrée (placeholder) → CREATE
    if (!entry.id) {
      this.releaseNoteService.createEntry(this.release.id!, request).subscribe({
        next: (created) => {
          this.updateLocalEntry(created);
          this.toastService.success('Entrée créée avec succès');
        },
        error: (error) => {
          console.error('Error creating entry:', error);
          this.toastService.error('Erreur lors de la création');
        }
      });
    } else {
      // UPDATE
      this.releaseNoteService.updateEntry(this.release.id!, entry.id, request).subscribe({
        next: (updated) => {
          this.updateLocalEntry(updated);
          this.toastService.success('Mise à jour effectuée');
        },
        error: (error) => {
          console.error('Error updating entry:', error);
          this.toastService.error('Erreur lors de la mise à jour');
        }
      });
    }
  }

  // Ancienne méthode (conservée pour compatibilité, mais non utilisée)
  startEdit(entry: ReleaseNoteEntry, field: string): void {
    if (!this.hasWriteAccess()) return;
    this.editingEntryId = entry.id || 'NEW_' + entry.microserviceId;
    this.editingEntry = { ...entry };
    this.editingField = field;
  }

  saveEntry(): void {
    if (!this.release) return;

    const request: CreateReleaseNoteEntryRequest = {
      microserviceId: this.editingEntry.microserviceId,
      microservice: this.editingEntry.microservice, // Fallback name
      squad: this.editingEntry.squad,
      partEnMep: this.editingEntry.partEnMep,
      deployOrder: this.editingEntry.deployOrder,
      tag: this.editingEntry.tag,
      previousTag: this.editingEntry.previousTag,
      parentVersion: this.editingEntry.parentVersion,
      changes: this.editingEntry.changes || [],
      comment: this.editingEntry.comment
    };

    if (this.editingEntryId && !this.editingEntryId.startsWith('NEW_')) {
      // Update existing
      this.releaseNoteService.updateEntry(this.release.id!, this.editingEntryId, request).subscribe({
        next: (updated) => {
          this.updateLocalEntry(updated);
          this.toastService.success('Mise à jour effectuée');
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error updating entry:', error);
          this.toastService.error('Erreur lors de la mise à jour');
        }
      });
    } else {
      // Create new
      this.releaseNoteService.createEntry(this.release.id!, request).subscribe({
        next: (created) => {
          this.updateLocalEntry(created);
          this.toastService.success('Entrée créée');
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error creating entry:', error);
          this.toastService.error('Erreur lors de la création');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingEntryId = null;
    this.editingEntry = {};
    this.editingField = '';
  }

  togglePartEnMep(entry: ReleaseNoteEntry): void {
    if (!this.hasWriteAccess() || !this.release) return;

    // If unchecked, clear deployOrder and tag
    if (!entry.partEnMep) {
      entry.deployOrder = undefined;
      entry.tag = undefined;
    }

    const request: CreateReleaseNoteEntryRequest = {
      microserviceId: entry.microserviceId,
      microservice: entry.microservice, // Fallback name
      squad: entry.squad,
      partEnMep: entry.partEnMep,
      deployOrder: entry.deployOrder,
      tag: entry.tag,
      previousTag: entry.previousTag,
      parentVersion: entry.parentVersion,
      changes: entry.changes || [],
      comment: entry.comment // ⚠️ Preserve comment field
    };

    if (entry.id) {
      this.releaseNoteService.updateEntry(this.release.id!, entry.id, request).subscribe({
        next: (updated) => {
          this.updateLocalEntry(updated);
        },
        error: (error) => {
          console.error('Error updating entry:', error);
          this.toastService.error('Erreur lors de la mise à jour');
          // Revert change locally if failed
          entry.partEnMep = !entry.partEnMep;
        }
      });
    } else {
      // Create new entry
      this.releaseNoteService.createEntry(this.release.id!, request).subscribe({
        next: (created) => {
          this.updateLocalEntry(created);
        },
        error: (error) => {
          console.error('Error creating entry:', error);
          this.toastService.error('Erreur lors de la création');
          // Revert
          entry.partEnMep = !entry.partEnMep;
        }
      });
    }
  }

  private updateLocalEntry(updated: ReleaseNoteEntry): void {
    const index = this.entries.findIndex(e => e.id === updated.id);
    if (index !== -1) {
      this.entries[index] = updated;
    } else {
      this.entries.push(updated);
    }
    this.applyFilters();
  }

  async deleteEntry(entry: ReleaseNoteEntry): Promise<void> {
    if (!this.hasWriteAccess() || !this.release) return;

    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer ce microservice ?',
      message: `Voulez-vous vraiment supprimer ${entry.microservice} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed && this.release) {
      this.releaseNoteService.deleteEntry(this.release.id!, entry.id!).subscribe({
        next: () => {
          this.entries = this.entries.filter(e => e.id !== entry.id);
          this.applyFilters();
          this.toastService.success('Microservice supprimé');
        },
        error: (error) => {
          console.error('Error deleting entry:', error);
          this.toastService.error('Erreur lors de la suppression');
        }
      });
    }
  }

  // Changes modal
  openChangesModal(entry: ReleaseNoteEntry): void {
    if (!this.hasWriteAccess()) return;

    this.currentEditingEntry = entry;
    this.currentEditingMicroservice = entry.microservice || '';
    this.currentEditingChanges = entry.changes || [];
    this.isChangesModalOpen = true;
  }

  onChangesSave(changes: ChangeItem[]): void {
    if (!this.currentEditingEntry || !this.release) return;

    const request: CreateReleaseNoteEntryRequest = {
      microserviceId: this.currentEditingEntry.microserviceId,
      microservice: this.currentEditingEntry.microservice,
      squad: this.currentEditingEntry.squad,
      partEnMep: this.currentEditingEntry.partEnMep,
      deployOrder: this.currentEditingEntry.deployOrder,
      tag: this.currentEditingEntry.tag,
      previousTag: this.currentEditingEntry.previousTag,
      parentVersion: this.currentEditingEntry.parentVersion,
      changes,
      comment: this.currentEditingEntry.comment // ⚠️ Preserve comment field
    };

    // Si l'entrée n'a pas d'ID, c'est une nouvelle entrée (placeholder) → CREATE
    if (!this.currentEditingEntry.id) {
      this.releaseNoteService.createEntry(this.release.id!, request).subscribe({
        next: (created) => {
          this.updateLocalEntry(created);
          this.toastService.success('Entrée créée avec succès');
          this.onChangesCancel();
        },
        error: (error) => {
          console.error('Error creating entry:', error);
          this.toastService.error('Erreur lors de la création');
        }
      });
    } else {
      // Sinon, UPDATE
      this.releaseNoteService.updateEntry(this.release.id!, this.currentEditingEntry.id, request).subscribe({
        next: (updated) => {
          this.updateLocalEntry(updated);
          this.toastService.success('Changes mis à jour');
          this.onChangesCancel();
        },
        error: (error) => {
          console.error('Error updating changes:', error);
          this.toastService.error('Erreur lors de la mise à jour des changes');
        }
      });
    }
  }

  onChangesCancel(): void {
    this.isChangesModalOpen = false;
    this.currentEditingEntry = null;
    this.currentEditingMicroservice = '';
    this.currentEditingChanges = [];
  }

  // Export
  toggleExportDropdown(): void {
    this.isExportDropdownOpen = !this.isExportDropdownOpen;
  }

  exportMarkdown(): void {
    if (!this.release) return;

    this.releaseNoteService.exportMarkdown(this.release.id!).subscribe({
      next: (blob) => {
        this.releaseNoteService.downloadFile(blob, `release-note-${this.release!.name}.md`);
        this.toastService.success('Export Markdown réussi');
        this.isExportDropdownOpen = false;
      },
      error: (error) => {
        console.error('Error exporting markdown:', error);
        this.toastService.error('Erreur lors de l\'export Markdown');
      }
    });
  }

  exportHtml(): void {
    if (!this.release) return;

    this.releaseNoteService.exportHtml(this.release.id!).subscribe({
      next: (blob) => {
        this.releaseNoteService.downloadFile(blob, `release-note-${this.release!.name}.html`);
        this.toastService.success('Export HTML réussi');
        this.isExportDropdownOpen = false;
      },
      error: (error) => {
        console.error('Error exporting HTML:', error);
        this.toastService.error('Erreur lors de l\'export HTML');
      }
    });
  }

  exportPng(): void {
    // TODO: Implement PNG export using html2canvas
    this.toastService.info('Export PNG à venir (utiliser html2canvas)');
    this.isExportDropdownOpen = false;
  }
}
