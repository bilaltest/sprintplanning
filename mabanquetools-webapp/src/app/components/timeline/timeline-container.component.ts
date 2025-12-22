import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TimelineService } from '@services/timeline.service';
import { EventService } from '@services/event.service';
import { FilterService } from '@services/filter.service';
import { ExportService } from '@services/export.service';
import { ToastService } from '@services/toast.service';
import { TimelineView } from '@models/timeline.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from '@models/event.model';
import { Sprint } from '@models/sprint.model';
import { SprintService } from '@services/sprint.service';
import { ClosedDay } from '@models/closed-day.model';
import { ClosedDayService } from '@services/closed-day.service';

import { SemesterViewComponent } from './semester-view.component';
import { NowViewComponent } from './now-view.component';
import { FilterBarComponent } from '../filters/filter-bar.component';
import { EventModalComponent } from '../modals/event-modal.component';

@Component({
  selector: 'app-timeline-container',
  standalone: true,
  imports: [
    CommonModule,

    SemesterViewComponent,
    NowViewComponent,
    FilterBarComponent,
    EventModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- View selector -->
          <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              *ngFor="let view of views"
              (click)="setView(view.value)"
              [class.bg-white]="(currentView$ | async) === view.value"
              [class.dark:bg-gray-600]="(currentView$ | async) === view.value"
              [class.shadow-sm]="(currentView$ | async) === view.value"
              class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
              [class.text-primary-600]="(currentView$ | async) === view.value"
              [class.dark:text-primary-400]="(currentView$ | async) === view.value"
              [class.text-gray-600]="(currentView$ | async) !== view.value"
              [class.dark:text-gray-300]="(currentView$ | async) !== view.value"
            >
              <span class="material-icons text-lg">{{ view.icon }}</span>
              <span>{{ view.label }}</span>
            </button>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-4">
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
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 fade-in-scale"
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
      <div [class.sticky]="!isStickyDisabled" class="z-30" [style.top.px]="0">
        <app-filter-bar></app-filter-bar>
        
        <!-- Toggle button (visible when scrolled) -->
        <button
          *ngIf="isScrolled"
          (click)="toggleFilterSticky()"
          class="relative z-40 left-1/2 transform -translate-x-1/2 glass-planning rounded-b-xl px-4 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-md -mt-2"
          [title]="isStickyDisabled ? 'Activer le mode sticky' : 'Désactiver le mode sticky'"
        >
          <span class="material-icons text-sm">
            {{ isStickyDisabled ? 'expand_more' : 'expand_less' }}
          </span>
        </button>
      </div>

      <!-- Timeline view -->
      <div id="timeline-export" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
        <app-now-view
          *ngIf="(currentView$ | async) === 'now'"
          [events]="filteredEvents$ | async"
          (eventClick)="openEditEventModal($event)"
          (addEventClick)="openCreateEventModalWithDate($event)"
          (deleteEventClick)="handleDeleteEvent($event)"
        ></app-now-view>

        <app-semester-view
          *ngIf="(currentView$ | async) === 'semester'"
          [events]="filteredEvents$ | async"
          [sprints]="sprints$ | async"
          [closedDays]="closedDays$ | async"
          (eventClick)="openEditEventModal($event)"
          (addEventClick)="openCreateEventModalWithDate($event)"
        ></app-semester-view>


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

    { value: 'semester' as TimelineView, label: 'Semestre', icon: 'table_view' },
    { value: 'now' as TimelineView, label: 'Timeline', icon: 'timeline' }
  ];

  currentView$!: Observable<TimelineView>;
  filteredEvents$!: Observable<Event[]>;
  sprints$!: Observable<Sprint[]>;
  closedDays$!: Observable<ClosedDay[]>;

  showEventModal = false;
  selectedEvent?: Event;
  showExportMenu = false;
  isStickyDisabled = false;
  isScrolled = false;

  constructor(
    private timelineService: TimelineService,
    private eventService: EventService,
    private sprintService: SprintService,
    private closedDayService: ClosedDayService,
    private filterService: FilterService,
    private exportService: ExportService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
    // Initialisation des observables
    this.filteredEvents$ = this.filterService.filteredEvents$;

    this.currentView$ = this.timelineService.state$.pipe(
      map(state => state.view)
    );

    this.sprints$ = this.sprintService.getAllSprints();
    this.closedDays$ = this.closedDayService.getAllClosedDays();
  }

  ngOnInit(): void {
    // Listen for query parameters to scroll to specific event
    this.route.queryParams.subscribe(params => {
      const eventId = params['eventId'];
      if (eventId) {
        // Wait for the view to render before scrolling
        setTimeout(() => {
          this.scrollToEvent(eventId);
        }, 500);
      }
    });
  }

  private scrollToEvent(eventId: string): void {
    // Find the event and navigate to its quarter
    this.eventService.events$.subscribe(events => {
      const event = events.find(e => e.id === eventId);
      if (event) {
        // Navigate to the correct quarter/year for the event
        const eventDate = new Date(event.date);
        this.timelineService.setCurrentDate(eventDate);

        // Wait for the view to update, then scroll to the day
        setTimeout(() => {
          this.scrollToDay(event.date);
        }, 500);
      }
    }).unsubscribe();
  }

  private scrollToDay(dateStr: string): void {
    // Find the day element by date
    const dayElements = document.querySelectorAll('[data-date]');
    const targetElement = Array.from(dayElements).find(
      el => el.getAttribute('data-date') === dateStr
    ) as HTMLElement;

    if (targetElement) {
      // Scroll to the element
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  setView(view: TimelineView): void {
    this.timelineService.setView(view);
  }

  goToToday(): void {
    this.timelineService.goToToday();
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

  onStickyDisabled(isDisabled: boolean): void {
    this.isStickyDisabled = isDisabled;
  }

  toggleFilterSticky(): void {
    this.isStickyDisabled = !this.isStickyDisabled;
  }

  async handleDeleteEvent(event: Event): Promise<void> {
    if (!event.id) return;

    if (event.sprintId) {
      this.toastService.warning(
        'Action impossible',
        'Cet événement est lié à un sprint. Vous devez supprimer le sprint depuis la page Administration.'
      );
      return;
    }

    try {
      await this.eventService.deleteEvent(event.id);
      this.toastService.success('Événement supprimé', 'L\'événement a été supprimé avec succès');
    } catch (error) {
      this.toastService.error('Erreur', 'Erreur lors de la suppression de l\'événement');
    }
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  async exportAsPDF(): Promise<void> {
    try {
      this.toastService.info('Export en cours', 'Génération du fichier PDF...');
      await this.exportService.exportAsPDF('timeline-export', 'planning');
      this.showExportMenu = false;
      this.toastService.success('Export réussi', 'Le fichier PDF a été téléchargé');
    } catch (error) {
      this.toastService.error('Erreur d\'export', 'Impossible d\'exporter le planning en PDF');
    }
  }

  async exportAsPNG(): Promise<void> {
    try {
      this.toastService.info('Export en cours', 'Génération de l\'image PNG...');
      await this.exportService.exportAsPNG('timeline-export', 'planning');
      this.showExportMenu = false;
      this.toastService.success('Export réussi', 'L\'image PNG a été téléchargée');
    } catch (error) {
      this.toastService.error('Erreur d\'export', 'Impossible d\'exporter le planning en PNG');
    }
  }

  async exportAsJSON(): Promise<void> {
    try {
      this.toastService.info('Export en cours', 'Génération du fichier JSON...');
      await this.exportService.exportAsJSON();
      this.showExportMenu = false;
      this.toastService.success('Export réussi', 'Le fichier JSON a été téléchargé');
    } catch (error) {
      this.toastService.error('Erreur d\'export', 'Impossible d\'exporter les données en JSON');
    }
  }

  async exportAsCSV(): Promise<void> {
    try {
      this.toastService.info('Export en cours', 'Génération du fichier CSV...');
      await this.exportService.exportAsCSV();
      this.showExportMenu = false;
      this.toastService.success('Export réussi', 'Le fichier CSV a été téléchargé');
    } catch (error) {
      this.toastService.error('Erreur d\'export', 'Impossible d\'exporter les données en CSV');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showExportMenu = false;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 100;
  }

}
