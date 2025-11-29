import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '@services/timeline.service';
import { EventService } from '@services/event.service';
import { FilterService } from '@services/filter.service';
import { ExportService } from '@services/export.service';
import { TimelineView } from '@models/timeline.model';
import { Observable } from 'rxjs';
import { Event } from '@models/event.model';
import { AnnualViewComponent } from './annual-view.component';
import { MonthViewComponent } from './month-view.component';
import { FilterBarComponent } from '../filters/filter-bar.component';
import { EventModalComponent } from '../modals/event-modal.component';

@Component({
  selector: 'app-timeline-container',
  standalone: true,
  imports: [
    CommonModule,
    AnnualViewComponent,
    MonthViewComponent,
    FilterBarComponent,
    EventModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- View selector -->
          <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              *ngFor="let view of views"
              (click)="setView(view.value)"
              [class.bg-white]="(currentView$ | async) === view.value && !(isDark$ | async)"
              [class.dark:bg-gray-600]="(currentView$ | async) === view.value"
              [class.shadow-sm]="(currentView$ | async) === view.value"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
              [class.text-primary-600]="(currentView$ | async) === view.value && !(isDark$ | async)"
              [class.dark:text-primary-400]="(currentView$ | async) === view.value"
              [class.text-gray-600]="(currentView$ | async) !== view.value && !(isDark$ | async)"
              [class.dark:text-gray-300]="(currentView$ | async) !== view.value"
            >
              <span class="material-icons text-lg">{{ view.icon }}</span>
              <span>{{ view.label }}</span>
            </button>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-4">
            <button
              (click)="previousPeriod()"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Période précédente"
            >
              <span class="material-icons text-gray-600 dark:text-gray-300">chevron_left</span>
            </button>

            <div class="text-center min-w-[200px]">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ getCurrentPeriodLabel() }}
              </h2>
            </div>

            <button
              (click)="nextPeriod()"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Période suivante"
            >
              <span class="material-icons text-gray-600 dark:text-gray-300">chevron_right</span>
            </button>

            <button
              (click)="goToToday()"
              class="btn btn-secondary btn-sm"
            >
              Aujourd'hui
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button
              (click)="openCreateEventModal()"
              class="btn btn-primary flex items-center space-x-2"
            >
              <span class="material-icons text-lg">add</span>
              <span>Nouvel événement</span>
            </button>

            <div class="relative">
              <button
                (click)="toggleExportMenu()"
                class="btn btn-secondary flex items-center space-x-2"
              >
                <span class="material-icons text-lg">download</span>
                <span>Exporter</span>
              </button>

              <div
                *ngIf="showExportMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 fade-in-scale"
              >
                <button
                  (click)="exportAsPDF()"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span class="material-icons text-base">picture_as_pdf</span>
                  <span>Export PDF</span>
                </button>
                <button
                  (click)="exportAsPNG()"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span class="material-icons text-base">image</span>
                  <span>Export PNG</span>
                </button>
                <button
                  (click)="exportAsJSON()"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span class="material-icons text-base">code</span>
                  <span>Export JSON</span>
                </button>
                <button
                  (click)="exportAsCSV()"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span class="material-icons text-base">table_chart</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="sticky top-2 z-30">
        <app-filter-bar></app-filter-bar>
      </div>

      <!-- Timeline view -->
      <div id="timeline-export" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <app-annual-view
          *ngIf="(currentView$ | async) === 'annual'"
          [events]="filteredEvents$ | async"
          (eventClick)="openEditEventModal($event)"
          (addEventClick)="openCreateEventModalWithDate($event)"
          (deleteEventClick)="handleDeleteEvent($event)"
        ></app-annual-view>

        <app-month-view
          *ngIf="(currentView$ | async) === 'month'"
          [events]="filteredEvents$ | async"
          (eventClick)="openEditEventModal($event)"
          (addEventClick)="openCreateEventModalWithDate($event)"
          (deleteEventClick)="handleDeleteEvent($event)"
        ></app-month-view>
      </div>

      <!-- Bottom navigation -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <button
              (click)="previousPeriod()"
              class="btn btn-secondary flex items-center space-x-2"
            >
              <span class="material-icons text-lg">chevron_left</span>
              <span>Période précédente</span>
            </button>
          </div>

          <button
            (click)="goToToday()"
            class="btn btn-primary"
          >
            <span class="material-icons text-lg">today</span>
            Aujourd'hui
          </button>

          <div class="flex items-center space-x-2">
            <button
              (click)="nextPeriod()"
              class="btn btn-secondary flex items-center space-x-2"
            >
              <span>Période suivante</span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Event modal -->
    <app-event-modal
      *ngIf="showEventModal"
      [event]="selectedEvent"
      (close)="closeEventModal()"
      (save)="handleEventSave($event)"
    ></app-event-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TimelineContainerComponent implements OnInit {
  views = [
    { value: 'annual' as TimelineView, label: 'Année', icon: 'calendar_view_month' },
    { value: 'month' as TimelineView, label: 'Mois', icon: 'calendar_today' }
  ];

  currentView$!: Observable<TimelineView>;
  filteredEvents$!: Observable<Event[]>;
  isDark$ = new Observable<boolean>();

  showEventModal = false;
  selectedEvent?: Event;
  showExportMenu = false;

  constructor(
    private timelineService: TimelineService,
    private eventService: EventService,
    private filterService: FilterService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.currentView$ = new Observable(observer => {
      this.timelineService.state$.subscribe(state => {
        observer.next(state.view);
      });
    });

    this.filteredEvents$ = this.filterService.filteredEvents$;
  }

  setView(view: TimelineView): void {
    this.timelineService.setView(view);
  }

  previousPeriod(): void {
    this.timelineService.previousPeriod();
  }

  nextPeriod(): void {
    this.timelineService.nextPeriod();
  }

  goToToday(): void {
    this.timelineService.goToToday();
  }

  getCurrentPeriodLabel(): string {
    const state = this.timelineService.getCurrentState();
    const date = state.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    switch (state.view) {
      case 'annual':
        return `${year}`;
      case 'month':
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${monthNames[month]} ${year}`;
      default:
        return `${year}`;
    }
  }

  openCreateEventModal(): void {
    this.selectedEvent = undefined;
    this.showEventModal = true;
  }

  openCreateEventModalWithDate(date: string): void {
    // Créer un événement temporaire avec la date pré-remplie
    this.selectedEvent = {
      title: '',
      date: date,
      category: 'mep',
      color: '#22c55e',
      icon: 'rocket_launch',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.showEventModal = true;
  }

  openEditEventModal(event: Event): void {
    this.selectedEvent = event;
    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = undefined;
  }

  handleEventSave(event: Event): void {
    this.closeEventModal();
  }

  async handleDeleteEvent(event: Event): Promise<void> {
    if (!event.id) return;

    try {
      await this.eventService.deleteEvent(event.id);
    } catch (error) {
      console.error('Delete event error:', error);
      alert('Erreur lors de la suppression de l\'événement');
    }
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  async exportAsPDF(): Promise<void> {
    try {
      await this.exportService.exportAsPDF('timeline-export', 'planning');
      this.showExportMenu = false;
    } catch (error) {
      console.error('Export PDF error:', error);
    }
  }

  async exportAsPNG(): Promise<void> {
    try {
      await this.exportService.exportAsPNG('timeline-export', 'planning');
      this.showExportMenu = false;
    } catch (error) {
      console.error('Export PNG error:', error);
    }
  }

  async exportAsJSON(): Promise<void> {
    try {
      await this.exportService.exportAsJSON();
      this.showExportMenu = false;
    } catch (error) {
      console.error('Export JSON error:', error);
    }
  }

  async exportAsCSV(): Promise<void> {
    try {
      await this.exportService.exportAsCSV();
      this.showExportMenu = false;
    } catch (error) {
      console.error('Export CSV error:', error);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showExportMenu = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousPeriod();
    } else if (event.key === 'ArrowRight') {
      this.nextPeriod();
    }
  }
}
