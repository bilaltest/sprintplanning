import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '@services/confirmation.service';
import { ToastService } from '@services/toast.service';
import { ClosedDayService } from '@services/closed-day.service';
import { ClosedDay } from '@models/closed-day.model';

@Component({
    selector: 'app-closed-day-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- Closed Days Management -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
              <span class="material-icons text-2xl text-rose-600 dark:text-rose-400">event_busy</span>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Jours Fermés</h2>
              <button (click)="openClosedDaysModal()" class="ml-auto text-xs font-medium px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all active:scale-95 shadow-sm border border-primary-100 dark:border-primary-800">
                  Voir la liste
              </button>
          </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-2 mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <input type="date" [(ngModel)]="newClosedDay.date" class="input py-1.5 text-sm flex-1 min-w-[130px]">
          <input type="text" [(ngModel)]="newClosedDay.reason" placeholder="Raison (ex: Pont)" class="input py-1.5 text-sm flex-[2] min-w-[150px]">
          <button (click)="addClosedDay()" [disabled]="!newClosedDay.date || !newClosedDay.reason" class="btn btn-primary flex items-center justify-center w-8 h-8 p-0 rounded-lg flex-shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95">
              <span class="material-icons text-sm">add</span>
          </button>
      </div>
    </div>

    <!-- Closed Days Modal -->
    <div *ngIf="isClosedDaysModalOpen" class="modal-overlay" (click)="closeClosedDaysModal()">
        <div class="modal-content max-w-md fade-in-scale" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="modal-header-glass">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-3">
                        <span class="material-icons text-2xl text-rose-600 dark:text-rose-400">event_busy</span>
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Jours Fermés</h2>
                    </div>
                    <button (click)="closeClosedDaysModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <span class="material-icons text-gray-600 dark:text-gray-400">close</span>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="p-6">
                <div *ngIf="closedDays.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span class="material-icons text-4xl mb-2 opacity-50">event_available</span>
                    <p>Aucun jour fermé configuré</p>
                </div>

                <div *ngIf="closedDays.length > 0" class="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <div *ngFor="let day of closedDays" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 group hover:border-primary-100 dark:hover:border-primary-900/30 transition-colors">
                        <div class="flex flex-col">
                             <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ day.reason }}</span>
                             <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ day.date | date:'EEEE d MMMM yyyy':'':'fr' }}</span>
                        </div>
                        <button (click)="deleteClosedDay(day)" class="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Supprimer">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                <button (click)="closeClosedDaysModal()" class="btn btn-primary">Fermer</button>
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
export class ClosedDayManagementComponent implements OnInit {
    closedDays: ClosedDay[] = [];
    newClosedDay: Partial<ClosedDay> = {};
    isClosedDaysModalOpen = false;

    constructor(
        private closedDayService: ClosedDayService,
        private confirmationService: ConfirmationService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadClosedDays();
    }

    loadClosedDays() {
        this.closedDayService.getAllClosedDays().subscribe((days: ClosedDay[]) => {
            this.closedDays = days;
        });
    }

    addClosedDay() {
        if (!this.newClosedDay.date || !this.newClosedDay.reason) return;

        this.closedDayService.createClosedDay(this.newClosedDay as ClosedDay).subscribe({
            next: (day: ClosedDay) => {
                this.closedDays.push(day);
                this.closedDays.sort((a, b) => a.date.localeCompare(b.date));
                this.newClosedDay = {};
                this.toastService.success('Jour fermé ajouté');
            },
            error: () => this.toastService.error('Erreur lors de l\'ajout')
        });
    }

    deleteClosedDay(day: ClosedDay) {
        if (!day.id) return;
        this.confirmationService.confirm({
            title: 'Confirmer la suppression',
            message: 'Êtes-vous sûr de vouloir supprimer ce jour fermé ?',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            confirmButtonClass: 'danger'
        })
            .then(confirmed => {
                if (confirmed) {
                    this.closedDayService.deleteClosedDay(day.id!).subscribe({
                        next: () => {
                            this.closedDays = this.closedDays.filter(d => d.id !== day.id);
                            this.toastService.success('Jour fermé supprimé');
                        },
                        error: () => this.toastService.error('Erreur lors de la suppression')
                    });
                }
            });
    }

    openClosedDaysModal() {
        this.isClosedDaysModalOpen = true;
    }

    closeClosedDaysModal() {
        this.isClosedDaysModalOpen = false;
    }
}
