import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OnboardingService } from '@services/onboarding.service';
import { driver } from 'driver.js';

import { SemesterViewComponent } from './semester-view.component';
import { NowViewComponent } from './now-view.component';
import { FilterBarComponent } from '../filters/filter-bar.component';
import { EventModalComponent } from '../modals/event-modal.component';

@Component({
  selector: 'app-timeline-container',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,

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
                id="btn-export"
                (click)="toggleExportMenu()"
                class="btn btn-secondary flex items-center space-x-2"
              >
                <span class="material-icons text-lg">download</span>
                <span>Exporter</span>
              </button>

              <div
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 transition-all duration-200"
                [class.invisible]="!showExportMenu"
                [class.opacity-0]="!showExportMenu"
                [class.pointer-events-none]="!showExportMenu"
                [class.fade-in-scale]="showExportMenu && !isTourActive"
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
                <button
                  id="btn-export-ics"
                  (click)="exportAsICS()"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span class="material-icons text-base">calendar_month</span>
                  <span>Export ICS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div [class.sticky]="!isStickyDisabled" class="z-30" [style.top.px]="0" [class.pointer-events-none]="isTourActive">
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

      <!-- Error Banner (shown when backend is unavailable) -->
      <div *ngIf="eventsError$ | async as error"
           class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex items-start space-x-3">
        <span class="material-icons text-red-600 dark:text-red-400 mt-0.5">error_outline</span>
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Erreur de chargement</h3>
          <p class="text-xs text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
        <button
          (click)="retryLoadEvents()"
          class="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg transition-colors flex items-center space-x-1">
          <span class="material-icons text-sm">refresh</span>
          <span>Réessayer</span>
        </button>
      </div>

      <!-- Timeline view -->
      <div id="timeline-export" 
           class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 relative min-h-[600px]"
           [class.pointer-events-none]="isTourActive">

        <!-- Loading Overlay -->
        <div *ngIf="isLoadingEvents$ | async" class="absolute inset-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-opacity duration-300">
          <div class="text-center">
            <div class="inline-block w-12 h-12 border-4 border-emerald-200 dark:border-emerald-700 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Chargement...</p>
          </div>
        </div>

        <!-- Data Views (Always present) -->
        <app-now-view
          *ngIf="(currentView$ | async) === 'now'"
          [events]="filteredEvents$ | async"
          (eventClick)="openEditEventModal($event)"
          (addEventClick)="openCreateEventModalWithDate($event)"
          (deleteEventClick)="handleDeleteEvent($event)"
          (ready)="onViewReady()"
        ></app-now-view>

        <app-semester-view
          *ngIf="(currentView$ | async) === 'semester'"
          [events]="filteredEvents$ | async"
          [sprints]="sprints$ | async"
          [closedDays]="closedDays$ | async"
          (eventClick)="openEditEventModal($event)"
          (addEventClick)="openCreateEventModalWithDate($event)"
          (ready)="onViewReady()"
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
  isTourActive = false;

  // Loading & Error states
  isLoadingEvents$!: Observable<boolean>;
  eventsError$!: Observable<string | null>;

  constructor(
    private timelineService: TimelineService,
    private eventService: EventService,
    private sprintService: SprintService,
    private closedDayService: ClosedDayService,
    private filterService: FilterService,
    private exportService: ExportService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private onboardingService: OnboardingService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    // Initialisation des observables
    this.filteredEvents$ = this.filterService.filteredEvents$;

    this.currentView$ = this.timelineService.state$.pipe(
      map(state => state.view)
    );

    this.sprints$ = this.sprintService.getAllSprints();
    this.closedDays$ = this.closedDayService.getAllClosedDays();

    // Loading & Error observables
    this.isLoadingEvents$ = this.eventService.loading$;
    this.eventsError$ = this.eventService.error$;
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

    // this.checkOnboarding(); - Moved to onViewReady
  }

  onViewReady(): void {
    this.checkOnboarding();
  }

  private checkOnboarding(): void {
    this.onboardingService.loadSeenKeys().subscribe(() => {
      if (this.onboardingService.shouldShow('FEATURE_CALENDAR')) {
        this.startTour();
      }
    });
  }

  private startTour(): void {
    this.isTourActive = true;
    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Terminer',
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      onDestroyed: () => {
        this.isTourActive = false;
        this.onboardingService.markAsSeen('FEATURE_CALENDAR');
        this.showExportMenu = false; // Close menu if open
      },
      steps: [
        {
          element: '[data-is-today="true"]',
          popover: {
            title: 'Aujourd\'hui',
            description: 'Focus immédiat sur la journée courante. Vous pouvez cliquer sur un événement pour voir les détails.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: 'app-filter-bar',
          onDeselected: () => {
            // Prepare next step (Export) by pre-opening the menu and scrolling up
            // This ensures the element exists when Step 3 starts
            this.showExportMenu = true;
            this.cdr.detectChanges();
            window.scrollTo({ top: 0, behavior: 'auto' });
          },
          popover: {
            title: 'Filtres',
            description: 'Utilisez la barre de filtres pour n\'afficher que certaines catégories d\'événements (ex: MEP uniquement).',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#btn-export-ics',
          onHighlightStarted: () => {
            // Ensure state is correct just in case
            this.showExportMenu = true;
            window.scrollTo({ top: 0, behavior: 'auto' });
            this.cdr.detectChanges();
          },
          popover: {
            title: 'Export Calendrier',
            description: 'Cliquez sur Exporter puis choisissez "Export ICS" pour ajouter ce planning à votre calendrier Outlook.',
            side: 'left',
            align: 'center'
          }
        }
      ]
    });

    tourDriver.drive();
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

  async exportAsICS(): Promise<void> {
    try {
      this.toastService.info('Export en cours', 'Génération du fichier ICS...');
      await this.eventService.downloadIcs();
      this.showExportMenu = false;
      this.toastService.success('Export réussi', 'Le fichier ICS a été téléchargé');
    } catch (error) {
      this.toastService.error('Erreur d\'export', 'Impossible d\'exporter les données en ICS');
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

  async retryLoadEvents(): Promise<void> {
    await this.eventService.refreshEvents();
  }

}
