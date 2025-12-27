import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReleaseService } from '@services/release.service';
import { ReleaseNoteService } from '@services/release-note.service';
import { MicroserviceService } from '@services/microservice.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { Release, Feature, Squad } from '@models/release.model';
import { ReleaseNoteEntry, ChangeItem, CreateReleaseNoteEntryRequest } from '@models/release-note.model';
import { Microservice } from '@models/microservice.model';
import { ReleaseNoteEntryModalComponent } from './release-note-entry-modal.component';
import { MicroserviceManagementModalComponent } from './microservice-management-modal.component';
import { MicroserviceDeleteModalComponent } from './microservice-delete-modal.component';
import { MajorFeaturesComponent } from './major-features.component';
import { FilterToolbarComponent, ColumnConfig } from './filter-toolbar.component';
import { MicroservicesTableComponent } from './microservices-table.component';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-release-note',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink,
    MatDialogModule,
    MajorFeaturesComponent,
    FilterToolbarComponent,
    MicroservicesTableComponent,
    ReleaseNoteEntryModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto space-y-6" *ngIf="release">

      <!-- Header avec gradient -->
      <div class="relative overflow-visible bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-900 rounded-2xl shadow-xl p-8">
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
                <h1 class="text-4xl font-bold text-white tracking-tight">MEP Back</h1>
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

            <!-- Actions buttons -->
            <div class="hidden lg:flex items-center space-x-3">
              <!-- Export dropdown -->
              <div class="relative">
                <button
                  (click)="toggleExportDropdown($event)"
                  class="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:shadow-lg"
                >
                  <span class="material-icons">download</span>
                  <span class="font-medium">Exporter</span>
                  <span class="material-icons text-lg">{{ isExportDropdownOpen ? 'expand_less' : 'expand_more' }}</span>
                </button>

                <!-- Dropdown menu -->
                <div
                  *ngIf="isExportDropdownOpen"
                  class="fixed mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] overflow-hidden"
                  [style.top.px]="exportDropdownTop"
                  [style.right.px]="exportDropdownRight"
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

              <!-- Link to Prépa MEP -->
              <!-- <a
                [routerLink]="['/releases', release.id, 'preparation']"
                class="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:shadow-lg"
              >
                <span class="material-icons">assignment</span>
                <span class="font-medium">Voir Prépa MEP</span>
              </a> -->
            </div>
          </div>

          <p class="text-white/90 mt-4 text-lg leading-relaxed max-w-3xl" *ngIf="release.description">
            {{ release.description }}
          </p>
        </div>
      </div>

      <!-- Section 1: Fonctionnalités Majeures (composant séparé) -->
      <app-major-features
        [squads]="sortedSquads"
        [(isExpanded)]="isFeaturesSectionExpanded"
        (saveFeature)="onSaveFeature($event)"
        (deleteFeature)="onDeleteFeature($event)"
      ></app-major-features>

      <!-- Section 2: Microservices & Changes -->
      <!-- Toolbar de filtres (composant séparé) -->
      <app-filter-toolbar
        [selectedSquad]="selectedSquad"
        [showOnlyPartEnMep]="showOnlyPartEnMep"
        [searchQuery]="searchQuery"
        [columns]="columns"
        (squadChange)="onSquadChange($event)"
        (partEnMepChange)="onPartEnMepChange($event)"
        (searchChange)="onSearchChange($event)"
        (columnToggle)="onColumnToggle($event)"
        (addMicroservice)="openAddMicroserviceModal()"
        (deleteMicroservice)="openDeleteMicroserviceModal()"
      ></app-filter-toolbar>

      <!-- Table des microservices (composant séparé) -->
      <app-microservices-table
        [entries]="filteredEntries"
        [columns]="columns"
        [sortColumn]="sortColumn"
        [sortDirection]="sortDirection"
        (fieldUpdate)="onFieldUpdate($event)"
        (partEnMepToggle)="onPartEnMepToggle($event)"
        (openChangesModal)="openChangesModal($event)"
        (sort)="toggleSort($event)"
      ></app-microservices-table>

      <!-- Empty state -->
      <div *ngIf="filteredEntries.length === 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <span class="material-icons text-4xl text-gray-400 dark:text-gray-500">description</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun microservice</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ searchQuery || selectedSquad ? 'Aucun résultat ne correspond aux filtres' : 'Commencez par ajouter des microservices à cette release note' }}
        </p>
      </div>

    </div>

    <!-- Modal for adding/editing changes -->
    <app-release-note-entry-modal
      [isOpen]="isChangesModalOpen"
      [microservice]="currentEditingMicroservice"
      [initialChanges]="currentEditingChanges"
      (save)="onChangesSave($event)"
      (cancel)="onChangesCancel()"
    ></app-release-note-entry-modal>
  `
})
export class ReleaseNoteComponent implements OnInit, OnDestroy {
  release: Release | null = null;
  entries: ReleaseNoteEntry[] = [];
  filteredEntries: ReleaseNoteEntry[] = [];
  microservices: Microservice[] = [];

  // Computed properties for optimization
  sortedSquads: Squad[] = [];

  // Filters
  selectedSquad = '';
  searchQuery = '';
  showOnlyPartEnMep = false;

  // Sorting
  sortColumn = 'deployOrder';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Export dropdown
  isExportDropdownOpen = false;
  exportDropdownTop = 0;
  exportDropdownRight = 0;

  // Column visibility
  columns: ColumnConfig[] = [
    { key: 'deployOrder', label: 'Ordre', visible: true, alwaysVisible: true },
    { key: 'squad', label: 'Squad', visible: true, alwaysVisible: true },
    { key: 'microservice', label: 'Microservice', visible: true, alwaysVisible: true },
    { key: 'solution', label: 'Solution', visible: true },
    { key: 'partEnMep', label: 'MEP', visible: true },
    { key: 'status', label: 'Avancement', visible: true },
    { key: 'tag', label: 'Tag', visible: true },
    { key: 'previousTag', label: 'Tag N-1', visible: true },
    { key: 'parentVersion', label: 'MB Lib', visible: true },
    { key: 'changes', label: 'Changes', visible: true },
    { key: 'comment', label: 'Commentaire', visible: true }
  ];

  // Changes modal
  isChangesModalOpen = false;
  currentEditingMicroservice = '';
  currentEditingChanges: ChangeItem[] = [];
  currentEditingEntry: ReleaseNoteEntry | null = null;

  // Features section
  isFeaturesSectionExpanded = false;

  private cleanupListener: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private releaseService: ReleaseService,
    private releaseNoteService: ReleaseNoteService,
    private microserviceService: MicroserviceService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    const releaseId = this.route.snapshot.paramMap.get('id');

    if (releaseId) {
      this.loadRelease(releaseId);
      this.loadEntries(releaseId);
      this.loadMicroservices(releaseId);
    }

    this.loadColumnPreferences();

    // Clean listener for dropdowns
    this.cleanupListener = this.renderer.listen('document', 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.isExportDropdownOpen = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cleanupListener) {
      this.cleanupListener();
    }
  }

  async loadRelease(releaseId: string): Promise<void> {
    try {
      this.release = await this.releaseService.getRelease(releaseId);
      this.computeSortedSquads();
      this.applyFilters();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading release:', error);
      this.toastService.error('Erreur lors du chargement de la release');
      this.router.navigate(['/releases']);
    }
  }

  loadEntries(releaseId: string): void {
    this.releaseNoteService.getAllEntries(releaseId).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        this.toastService.error('Erreur lors du chargement des entrées');
        this.cdr.markForCheck();
      }
    });
  }

  loadMicroservices(releaseId?: string): void {
    this.microserviceService.getAllActive(releaseId).subscribe({
      next: (microservices) => {
        this.microservices = microservices;
        if (this.entries.length > 0) {
          this.applyFilters();
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading microservices:', error);
        this.toastService.error('Erreur lors du chargement des microservices');
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    if (!this.release) return;

    // Merge active microservices with existing entries
    const allEntries: ReleaseNoteEntry[] = this.microservices.map(ms => {
      const existing = this.entries.find(e =>
        e.microserviceId === ms.id ||
        (e.microservice && e.microservice === ms.name)
      );

      if (existing) {
        return {
          ...existing,
          solution: ms.solution,
          previousTag: existing.previousTag || ms.previousTag,
          changes: existing.changes || []
        };
      }

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

    // Include orphan entries
    const mappedIds = new Set(allEntries.map(e => e.id).filter(id => !!id));
    const orphans = this.entries.filter(e => {
      // Must not be already mapped
      if (e.id && mappedIds.has(e.id)) return false;

      // If it has a microserviceId, it means it's linked to a microservice.
      // Since it wasn't mapped above, that microservice is inactive/deleted.
      // We should hide it.
      if (e.microserviceId) return false;

      return true;
    });
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

    // Sort entries
    this.filteredEntries = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (this.sortColumn) {
        case 'deployOrder':
          const aOrder = a.deployOrder ?? Infinity;
          const bOrder = b.deployOrder ?? Infinity;
          comparison = aOrder - bOrder;
          break;
        case 'squad':
          comparison = (a.squad || '').localeCompare(b.squad || '');
          break;
        case 'microservice':
          comparison = (a.microservice || '').localeCompare(b.microservice || '');
          break;
        case 'solution':
          comparison = (a.solution || '').localeCompare(b.solution || '');
          break;
        case 'tag':
          comparison = (a.tag || '').localeCompare(b.tag || '');
          break;
        case 'previousTag':
          comparison = (a.previousTag || '').localeCompare(b.previousTag || '');
          break;
        case 'parentVersion':
          comparison = (a.parentVersion || '').localeCompare(b.parentVersion || '');
          break;
        case 'partEnMep':
          comparison = (a.partEnMep === b.partEnMep) ? 0 : (a.partEnMep ? -1 : 1);
          break;
        default:
          const aDefaultOrder = a.deployOrder ?? Infinity;
          const bDefaultOrder = b.deployOrder ?? Infinity;
          comparison = aDefaultOrder - bDefaultOrder;
          if (comparison === 0) {
            comparison = (a.squad || '').localeCompare(b.squad || '');
            if (comparison === 0) {
              comparison = (a.microservice || '').localeCompare(b.microservice || '');
            }
          }
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
    this.cdr.markForCheck();
  }

  // Filter handlers
  onSquadChange(squad: string): void {
    this.selectedSquad = squad;
    this.applyFilters();
  }

  onPartEnMepChange(value: boolean): void {
    this.showOnlyPartEnMep = value;
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onColumnToggle(column: ColumnConfig): void {
    column.visible = !column.visible;
    this.saveColumnPreferences();
  }

  // Table handlers
  onFieldUpdate(event: { entry: ReleaseNoteEntry; field: string; value: string }): void {
    const { entry, field, value } = event;

    if (!this.release) return;

    const currentValue = field === 'deployOrder'
      ? (entry.deployOrder?.toString() || '')
      : ((entry as any)[field] || '');

    if (value === currentValue) {
      return;
    }

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
      status: field === 'status' ? (value as any) : entry.status,
      changes: entry.changes || []
    };

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

  onPartEnMepToggle(entry: ReleaseNoteEntry): void {
    if (!this.release) return;

    entry.partEnMep = !entry.partEnMep;

    if (!entry.partEnMep) {
      entry.deployOrder = undefined;
      entry.tag = undefined;
    }

    const request: CreateReleaseNoteEntryRequest = {
      microserviceId: entry.microserviceId,
      microservice: entry.microservice,
      squad: entry.squad,
      partEnMep: entry.partEnMep,
      deployOrder: entry.deployOrder,
      tag: entry.tag,
      previousTag: entry.previousTag,
      parentVersion: entry.parentVersion,
      changes: entry.changes || [],
      comment: entry.comment
    };

    if (entry.id) {
      this.releaseNoteService.updateEntry(this.release.id!, entry.id, request).subscribe({
        next: (updated) => {
          this.updateLocalEntry(updated);
        },
        error: (error) => {
          console.error('Error updating entry:', error);
          this.toastService.error('Erreur lors de la mise à jour');
          entry.partEnMep = !entry.partEnMep;
        }
      });
    } else {
      this.releaseNoteService.createEntry(this.release.id!, request).subscribe({
        next: (created) => {
          this.updateLocalEntry(created);
        },
        error: (error) => {
          console.error('Error creating entry:', error);
          this.toastService.error('Erreur lors de la création');
          entry.partEnMep = !entry.partEnMep;
        }
      });
    }
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  // Changes modal handlers
  openChangesModal(entry: ReleaseNoteEntry): void {
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
      comment: this.currentEditingEntry.comment
    };

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

  openDeleteMicroserviceModal(): void {
    const dialogRef = this.dialog.open(MicroserviceDeleteModalComponent, {
      width: '100%',
      maxWidth: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If deletion occurred, refresh the microservices list
        this.loadMicroservices(this.release!.id);
      }
    });
  }

  // Microservice modal
  openAddMicroserviceModal(): void {
    const dialogRef = this.dialog.open(MicroserviceManagementModalComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((result: Microservice | undefined) => {
      if (result && this.release) {
        const existingEntry = this.entries.find(e =>
          e.microserviceId === result.id ||
          (e.microservice && e.microservice === result.name)
        );

        if (existingEntry) {
          this.loadMicroservices(this.release!.id);
          this.applyFilters();
          this.toastService.success('Microservice créé (déjà présent dans le tableau)');
          return;
        }

        const newEntryRequest: CreateReleaseNoteEntryRequest = {
          microserviceId: result.id,
          microservice: result.name,
          squad: result.squad,
          partEnMep: false,
          changes: []
        };

        this.releaseNoteService.createEntry(this.release.id!, newEntryRequest).subscribe({
          next: (created) => {
            this.entries.push(created);
            this.loadMicroservices(this.release!.id);
            this.applyFilters();
            this.toastService.success('Microservice créé et ajouté au tableau');
          },
          error: (error) => {
            console.error('Error creating release note entry:', error);
            this.loadMicroservices(this.release!.id);
            this.toastService.warning('Microservice créé, mais erreur lors de l\'ajout au tableau');
          }
        });
      }
    });
  }

  // Features handlers
  onSaveFeature(event: { squadId: string; feature: Partial<Feature> }): void {
    const { squadId, feature } = event;

    if (feature.id) {
      this.releaseService.updateFeature(feature.id, {
        title: feature.title!,
        description: feature.description || ''
      }).then(() => {
        this.toastService.success('Fonctionnalité modifiée avec succès');
        this.loadRelease(this.release!.id!);
      }).catch(err => {
        console.error('Error saving feature:', err);
        this.toastService.error('Erreur lors de la sauvegarde de la fonctionnalité');
      });
    } else {
      this.releaseService.addFeature(squadId, {
        title: feature.title!,
        description: feature.description || ''
      }).then(() => {
        this.toastService.success('Fonctionnalité ajoutée avec succès');
        this.loadRelease(this.release!.id!);
      }).catch(err => {
        console.error('Error saving feature:', err);
        this.toastService.error('Erreur lors de la sauvegarde de la fonctionnalité');
      });
    }
  }

  async onDeleteFeature(event: { squadId: string; featureId: string }): Promise<void> {
    const { squadId, featureId } = event;

    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer la fonctionnalité',
      message: 'Êtes-vous sûr de vouloir supprimer cette fonctionnalité ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      try {
        await this.releaseService.deleteFeature(featureId);
        this.toastService.success('Fonctionnalité supprimée avec succès');
        await this.loadRelease(this.release!.id!);
      } catch (err) {
        console.error('Error deleting feature:', err);
        this.toastService.error('Erreur lors de la suppression de la fonctionnalité');
      }
    }
  }

  // Export
  toggleExportDropdown(event?: MouseEvent): void {
    this.isExportDropdownOpen = !this.isExportDropdownOpen;

    if (this.isExportDropdownOpen && event) {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      this.exportDropdownTop = rect.bottom + 8;
      this.exportDropdownRight = window.innerWidth - rect.right;
    }
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
    this.toastService.info('Export PNG à venir (utiliser html2canvas)');
    this.isExportDropdownOpen = false;
  }

  // Utilities
  getTotalEntriesCount(): number {
    return this.entries.length;
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'd MMMM yyyy', { locale: fr });
  }

  computeSortedSquads() {
    if (!this.release?.squads) {
      this.sortedSquads = [];
      return;
    }
    this.sortedSquads = [...this.release.squads].sort((a, b) => a.squadNumber - b.squadNumber);
  }

  // Deprecated: used computeSortedSquads instead for performance
  // kept if needed by other components, but normally private
  private getSortedSquadsRef() {
    return this.sortedSquads;
  }

  goBack(): void {
    this.router.navigate(['/releases']);
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

  private loadColumnPreferences(): void {
    const saved = sessionStorage.getItem('release_note_columns');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        this.columns.forEach(col => {
          if (preferences[col.key] !== undefined && !col.alwaysVisible) {
            col.visible = preferences[col.key];
          }
        });
      } catch (e) {
        console.error('Error loading column preferences:', e);
      }
    }
  }

  private saveColumnPreferences(): void {
    const preferences: Record<string, boolean> = {};
    this.columns.forEach(col => {
      preferences[col.key] = col.visible;
    });
    sessionStorage.setItem('release_note_columns', JSON.stringify(preferences));
  }
}
