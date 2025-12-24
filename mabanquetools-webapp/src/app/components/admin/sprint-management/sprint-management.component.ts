import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';
import { SprintService } from '@services/sprint.service';
import { EventService } from '@services/event.service';
import { Sprint } from '@models/sprint.model';

@Component({
    selector: 'app-sprint-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- Sprint Management -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="material-icons text-2xl text-teal-600 dark:text-teal-400">rocket_launch</span>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Sprints</h2>
            </div>
            <button (click)="openCreateSprintModal()" class="btn btn-primary flex items-center space-x-2">
                <span class="material-icons text-sm">add</span>
                <span>Nouveau Sprint</span>
            </button>
        </div>

        <div *ngIf="sprints.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun sprint planifié
        </div>

        <div *ngIf="otherSprints.length === 0 && !currentSprint" class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun sprint planifié
        </div>

        <div *ngIf="sprints.length > 0" class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Début</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fin</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Freeze</th>
                         <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">MEP Back</th>
                         <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">MEP Front</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <!-- Current Sprint Pinned Row -->
                <tbody *ngIf="currentSprint" class="bg-vibrant-50/50 dark:bg-vibrant-900/10 border-b-2 border-vibrant-100 dark:border-vibrant-800">
                     <tr class="hover:bg-vibrant-50 dark:hover:bg-vibrant-900/20 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div class="flex items-center space-x-2">
                                <span>{{ currentSprint.name }}</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-vibrant-100 text-vibrant-800 dark:bg-vibrant-900 dark:text-vibrant-200">
                                    En cours
                                </span>
                                <span *ngIf="isFreezeWeek(currentSprint)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Freeze Week
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ currentSprint.startDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ currentSprint.endDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">ac_unit</span>
                                <span>{{ currentSprint.codeFreezeDate | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-gray-600 dark:text-blue-gray-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ currentSprint.releaseDateBack | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ currentSprint.releaseDateFront | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button (click)="editSprint(currentSprint)" class="text-teal-600 hover:text-teal-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                <span class="material-icons">edit</span>
                            </button>
                            <button (click)="deleteSprint(currentSprint)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <span class="material-icons">delete</span>
                            </button>
                        </td>
                    </tr>
                </tbody>

                <!-- Other Sprints -->
                <tbody class="divide-y divide-gray-200 dark:divide-gray-600 border-t border-gray-200 dark:border-gray-600">
                    <tr *ngFor="let sprint of paginatedSprints" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ sprint.name }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ sprint.startDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ sprint.endDate | date:'dd/MM/yyyy' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">ac_unit</span>
                                <span>{{ sprint.codeFreezeDate | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-gray-600 dark:text-blue-gray-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ sprint.releaseDateBack | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                            <div class="flex items-center space-x-1">
                                <span class="material-icons text-xs">rocket_launch</span>
                                <span>{{ sprint.releaseDateFront | date:'dd/MM/yyyy' }}</span>
                            </div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button (click)="editSprint(sprint)" class="text-teal-600 hover:text-teal-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                <span class="material-icons">edit</span>
                            </button>
                            <button (click)="deleteSprint(sprint)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <span class="material-icons">delete</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Sprint Pagination Controls -->
        <div *ngIf="totalSprintPages > 1" class="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div class="flex-1 flex justify-between sm:hidden">
                <button (click)="setSprintPage(sprintPage - 1)" [disabled]="sprintPage === 1" class="btn btn-secondary btn-sm">Précédent</button>
                <button (click)="setSprintPage(sprintPage + 1)" [disabled]="sprintPage === totalSprintPages" class="btn btn-secondary btn-sm">Suivant</button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                        Affichage de <span class="font-medium">{{ (sprintPage - 1) * sprintPageSize + 1 }}</span> à <span class="font-medium">{{ Math.min(sprintPage * sprintPageSize, otherSprints.length) }}</span> sur <span class="font-medium">{{ otherSprints.length }}</span> résultats
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button (click)="setSprintPage(sprintPage - 1)" [disabled]="sprintPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="material-icons text-sm">chevron_left</span>
                        </button>
                        <button *ngFor="let p of sprintPages" (click)="setSprintPage(p)"
                            [class.bg-indigo-50]="p === sprintPage" 
                            [class.dark:bg-indigo-900]="p === sprintPage" 
                            [class.text-indigo-600]="p === sprintPage" 
                            [class.dark:text-indigo-300]="p === sprintPage"
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                            {{ p }}
                        </button>
                        <button (click)="setSprintPage(sprintPage + 1)" [disabled]="sprintPage === totalSprintPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="material-icons text-sm">chevron_right</span>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
      </div>

    <!-- Sprint Modal -->
    <div *ngIf="isSprintModalOpen" class="modal-overlay" (click)="closeSprintModal()">
        <div class="modal-content max-w-lg fade-in-scale" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="modal-header-glass">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-3">
                        <span class="material-icons text-2xl text-indigo-600 dark:text-indigo-400">rocket_launch</span>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ editingSprint ? 'Modifier le sprint' : 'Nouveau sprint' }}</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Configuration des dates clés</p>
                        </div>
                    </div>
                    <button (click)="closeSprintModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Sprint</label>
                    <input type="text" [(ngModel)]="editedSprint.name" class="input" placeholder="ex: Sprint 24.01">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                        <input type="date" [(ngModel)]="editedSprint.startDate" class="input">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                        <input type="date" [(ngModel)]="editedSprint.endDate" class="input">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Code Freeze</label>
                        <input type="date" [(ngModel)]="editedSprint.codeFreezeDate" class="input border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                         <!-- Spacer or empty -->
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-blue-gray-600 dark:text-blue-gray-400 mb-1">MEP Back</label>
                        <input type="date" [(ngModel)]="editedSprint.releaseDateBack" class="input border-blue-gray-200 focus:border-blue-gray-500 focus:ring-blue-gray-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">MEP Front</label>
                        <input type="date" [(ngModel)]="editedSprint.releaseDateFront" class="input border-green-200 focus:border-green-500 focus:ring-green-500">
                    </div>
                </div>
                 <div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div class="flex items-start space-x-2">
                        <span class="material-icons text-sm text-blue-500 mt-0.5">info</span>
                        <span>Les événements "Code Freeze" et "Mise en production" seront automatiquement créés dans le calendrier.</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
             <div class="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
                <button (click)="closeSprintModal()" class="btn btn-secondary">Annuler</button>
                <button (click)="saveSprint()" [disabled]="isSavingSprint" class="btn btn-primary flex items-center space-x-2">
                    <span class="material-icons text-sm" [class.animate-spin]="isSavingSprint">
                        {{ isSavingSprint ? 'refresh' : 'save' }}
                    </span>
                    <span>{{ isSavingSprint ? 'Enregistrement...' : 'Enregistrer' }}</span>
                </button>
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
export class SprintManagementComponent implements OnInit {
    sprints: Sprint[] = [];
    editingSprint: Sprint | null = null;
    editedSprint: Partial<Sprint> = {};
    isSavingSprint = false;
    isSprintModalOpen = false;

    // Sprint Pagination
    sprintPage = 1;
    sprintPageSize = 4;

    Math = Math;

    constructor(
        private sprintService: SprintService,
        private eventService: EventService,
        private confirmationService: ConfirmationService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadSprints();
    }

    get currentSprint(): Sprint | undefined {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today

        return this.sprints.find(sprint => {
            // Assuming sprint dates are YYYY-MM-DD string
            return new Date(sprint.startDate) <= today && new Date(sprint.endDate) >= today;
        });
    }

    get otherSprints(): Sprint[] {
        const current = this.currentSprint;
        if (!current) return this.sprints;
        return this.sprints.filter(s => s.id !== current.id);
    }

    get paginatedSprints(): Sprint[] {
        const startIndex = (this.sprintPage - 1) * this.sprintPageSize;
        return this.otherSprints.slice(startIndex, startIndex + this.sprintPageSize);
    }

    get totalSprintPages(): number {
        return Math.ceil(this.otherSprints.length / this.sprintPageSize);
    }

    get sprintPages(): number[] {
        return Array.from({ length: this.totalSprintPages }, (_, i) => i + 1);
    }

    isFreezeWeek(sprint: Sprint): boolean {
        const today = new Date();
        const freeze = new Date(sprint.codeFreezeDate);
        const release = new Date(sprint.releaseDateFront);
        return today >= freeze && today <= release;
    }

    setSprintPage(page: number): void {
        if (page >= 1 && page <= this.totalSprintPages) {
            this.sprintPage = page;
        }
    }

    async loadSprints(): Promise<void> {
        try {
            this.sprints = await firstValueFrom(this.sprintService.getAllSprints());
        } catch (error) {
            console.error('Erreur lors du chargement des sprints:', error);
            this.toastService.error('Erreur', 'Impossible de charger les sprints');
        }
    }

    openCreateSprintModal(): void {
        this.editingSprint = null;
        this.editedSprint = {
            name: '',
            startDate: '',
            endDate: '',
            codeFreezeDate: '',
            releaseDateBack: '',
            releaseDateFront: ''
        };
        this.isSprintModalOpen = true;
    }

    editSprint(sprint: Sprint): void {
        this.editingSprint = sprint;
        this.editedSprint = { ...sprint };
        this.isSprintModalOpen = true;
    }

    closeSprintModal(): void {
        this.isSprintModalOpen = false;
        this.editingSprint = null;
        this.editedSprint = {};
    }

    async saveSprint(): Promise<void> {
        if (!this.editedSprint.name || !this.editedSprint.startDate || !this.editedSprint.endDate || !this.editedSprint.codeFreezeDate || !this.editedSprint.releaseDateBack || !this.editedSprint.releaseDateFront) {
            this.toastService.warning('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        this.isSavingSprint = true;
        try {
            if (this.editingSprint) {
                await firstValueFrom(this.sprintService.updateSprint(this.editingSprint.id, this.editedSprint));
                this.toastService.success('Sprint modifié', 'Le sprint a été mis à jour avec succès');
            } else {
                await firstValueFrom(this.sprintService.createSprint(this.editedSprint as Sprint));
                this.toastService.success('Sprint créé', 'Le sprint a été créé avec succès');
            }
            await this.eventService.refreshEvents();
            this.closeSprintModal();
            await this.loadSprints();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du sprint:', error);
            this.toastService.error('Erreur', 'Impossible de sauvegarder le sprint');
        } finally {
            this.isSavingSprint = false;
        }
    }

    async deleteSprint(sprint: Sprint): Promise<void> {
        const confirmed = await this.confirmationService.confirm({
            title: 'Supprimer ce sprint ?',
            message: `${sprint.name}\n\nAttention: Cela supprimera également les événements "Freeze" et "MEP" associés.`,
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            confirmButtonClass: 'danger'
        });

        if (!confirmed) return;

        try {
            await firstValueFrom(this.sprintService.deleteSprint(sprint.id));
            await this.eventService.refreshEvents();
            this.toastService.success('Sprint supprimé', 'Le sprint a été supprimé avec succès');
            await this.loadSprints();
        } catch (error) {
            console.error('Erreur lors de la suppression du sprint:', error);
            this.toastService.error('Erreur', 'Impossible de supprimer le sprint');
        }
    }
}
