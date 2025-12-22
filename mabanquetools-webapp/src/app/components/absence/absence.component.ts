import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbsenceService } from '@services/absence.service';
import { Absence, AbsenceUser, AbsenceType, CreateAbsenceRequest, ABSENCE_LABELS } from '@models/absence.model';
import { AuthService } from '@services/auth.service';
import { PermissionService } from '@services/permission.service';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isWeekend, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { SprintService } from '@services/sprint.service';
import { Sprint } from '@models/sprint.model';
import { ToastService } from '@services/toast.service';
import { MultiSelectFilterComponent } from '@components/shared/multi-select-filter.component';

interface DayMetadata {
  date: Date;
  isWeekend: boolean;
  isHoliday: boolean;
  isToday: boolean;
  label: string;
  dayNum: string;
  activeSprint?: Sprint;
  sprintIndex?: number;
  isSprintStart?: boolean;
  isCurrentSprint?: boolean;
  isCodeFreeze?: boolean;
  isMepBack?: boolean;
  isMepFront?: boolean;
}

interface MonthMetadata {
  date: Date;
  days: DayMetadata[];
  width: number;
}

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectFilterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-gray-900">
      
      <!-- Toolbar (Legend Only) -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between shadow-sm z-20 h-10 shrink-0">
        <button (click)="toggleUserDetails()" class="ml-4 text-xs flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <span class="material-icons text-sm">{{ showUserDetails ? 'visibility_off' : 'visibility' }}</span>
            <span>{{ showUserDetails ? 'Masquer détails' : 'Plus de détail' }}</span>
        </button>

        <div class="flex items-center space-x-4 text-xs font-medium mr-4">
          <div class="flex items-center space-x-1">
            <div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <span class="text-gray-600 dark:text-gray-300">{{ ABSENCE_LABELS.ABSENCE }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
            <span class="text-gray-600 dark:text-gray-300">{{ ABSENCE_LABELS.FORMATION }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <span class="text-gray-600 dark:text-gray-300">{{ ABSENCE_LABELS.TELETRAVAIL }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content (Timeline) -->
      <div class="flex-1 flex overflow-hidden relative">
        
        <!-- Left Sidebar (Users Table) -->
        <div [style.width.px]="showUserDetails ? 740 : 350" class="flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col z-10 shadow-lg transition-all duration-300">
          <!-- Table Header -->
          <div class="h-24 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-4 space-y-2 shrink-0">
            <!-- Headers -->
             <div class="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div class="flex-1 min-w-0 pr-2">Nom</div>
                <div class="w-[95px] px-1 text-center flex-shrink-0">Squads</div>
                <div class="w-28 px-1 text-center flex-shrink-0">Métier</div>
                <div *ngIf="showUserDetails" class="w-28 px-1 text-center flex-shrink-0">Tribu</div>
                <div *ngIf="showUserDetails" class="w-20 px-1 text-center flex-shrink-0">Interne</div>
                <div *ngIf="showUserDetails" class="w-48 px-1 flex-shrink-0 flex items-center justify-center space-x-2">
                    <span>Email</span>
                    <button (click)="copyEmails()" class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none" title="Copier les emails">
                        <span class="material-icons text-[14px]">{{ emailCopySuccess ? 'check' : 'content_copy' }}</span>
                    </button>
                </div>
             </div>
             <!-- Filters -->
              <div class="flex items-center">
                <div class="flex-1 relative pr-2">
                    <span class="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                    <input 
                        type="text" 
                        [(ngModel)]="searchQuery" 
                        (ngModelChange)="filterUsers()"
                        placeholder="Rech..." 
                        class="pl-7 pr-1 py-1 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs focus:ring-1 focus:ring-primary-500"
                    >
                </div>
                <div class="w-[95px] relative flex-shrink-0 px-1">
                    <app-multi-select-filter
                        [options]="uniqueSquads"
                        [(selectedValues)]="selectedSquads"
                        (selectedValuesChange)="filterUsers()">
                    </app-multi-select-filter>
                </div>
                <div class="w-28 relative flex-shrink-0 px-1">
                    <app-multi-select-filter
                        [options]="uniqueMetiers"
                        [(selectedValues)]="selectedMetiers"
                        (selectedValuesChange)="filterUsers()">
                    </app-multi-select-filter>
                </div>
                <!-- Tribu Filter -->
                 <div *ngIf="showUserDetails" class="w-28 relative flex-shrink-0 px-1">
                    <app-multi-select-filter
                        [options]="uniqueTribus"
                        [(selectedValues)]="selectedTribus"
                        (selectedValuesChange)="filterUsers()">
                    </app-multi-select-filter>
                 </div>
                 <!-- Status Filter -->
                 <div *ngIf="showUserDetails" class="w-20 relative flex-shrink-0 px-1">
                    <select 
                        [(ngModel)]="selectedStatus" 
                        (change)="filterUsers()"
                        class="w-full text-[10px] py-1 pl-1 pr-5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer">
                        <option value="ALL">Tous</option>
                        <option value="INTERNAL">Interne</option>
                        <option value="EXTERNAL">Externe</option>
                    </select>
                     <span class="material-icons absolute right-0.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[16px]">expand_more</span>
                 </div>
                 <div *ngIf="showUserDetails" class="w-48 relative flex-shrink-0 px-1">
                     <input 
                         type="text" 
                         disabled
                         placeholder="-" 
                         class="w-full text-[10px] py-1 px-2 border-transparent bg-transparent text-gray-400"
                     >
                 </div>
              </div>
          </div>
          
          <!-- User List synchronized scroll -->
          <div #userListContainer class="flex-1 overflow-y-auto custom-scrollbar" (scroll)="onLeftScroll($event)">
            <div [style.padding-top.px]="0"> <!-- Placeholder for eventual virtual scroll padding -->
                <div *ngFor="let user of filteredUsers; trackBy: trackUserById" 
                     (click)="toggleHighlight(user.id)"
                     class="h-8 border-b border-gray-300 dark:border-gray-700 flex items-center px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer group relative"
                     [class.bg-indigo-50]="user.id === highlightedUserId"
                     [class.dark:bg-indigo-900/20]="user.id === highlightedUserId"
                     [class.ring-2]="user.id === highlightedUserId"
                     [class.ring-indigo-400]="user.id === highlightedUserId"
                     [class.dark:ring-indigo-500]="user.id === highlightedUserId">
                  
                  <!-- Name Column -->
                  <div class="flex-1 flex items-center min-w-0 pr-2">
                      <div class="truncate text-xs font-medium text-gray-900 dark:text-white" [title]="(user.firstName | titlecase) + ' ' + (user.lastName | titlecase)">
                        {{ user.firstName | titlecase }} {{ (user.lastName | slice:0:1 | titlecase) }}
                      </div>
                  </div>

                  <!-- Squad Column -->
                  <div class="w-[95px] px-1 truncate text-[10px] text-gray-500 dark:text-gray-400 text-center flex-shrink-0" [title]="user.squads ? user.squads.join(', ') : ''">
                    {{ user.squads ? user.squads.join(', ') : '' }}
                  </div>

                  <!-- Metier Column -->
                  <div class="w-28 px-1 truncate text-[10px] text-gray-500 dark:text-gray-400 text-center flex-shrink-0" [title]="user.metier">
                    {{ user.metier }}
                  </div>

                  <!-- Tribu Column -->
                  <div *ngIf="showUserDetails" class="w-28 px-1 truncate text-[10px] text-gray-500 dark:text-gray-500 text-center flex-shrink-0" [title]="user.tribu">
                    {{ user.tribu }}
                  </div>

                  <!-- Interne Column -->
                  <div *ngIf="showUserDetails" class="w-20 px-1 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400">
                    <span *ngIf="user.interne">Oui</span>
                    <span *ngIf="!user.interne">Non</span>
                  </div>

                  <!-- Email Column -->
                  <div *ngIf="showUserDetails" class="w-48 px-1 truncate text-[10px] text-gray-500 dark:text-gray-500 flex-shrink-0" [title]="user.email">
                    {{ user.email }}
                  </div>
                </div>
            </div>
          </div>
        </div>

        <!-- Right Timeline Area -->
        <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800 relative">
          
          <!-- Timeline Header (Months & Days) -->
          <div #headerScrollContainer class="overflow-x-auto custom-scrollbar border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 h-24" (scroll)="onHeaderScroll($event)">
            <div class="flex h-full" [style.width.px]="timelineWidth">
              <!-- Months -->
              <ng-container *ngFor="let month of monthData; trackBy: trackMonthByDate">
                <div class="border-r border-gray-300 dark:border-gray-600 flex flex-col h-full" [style.width.px]="month.width">
                  <div class="h-6 text-xs font-bold text-center py-1 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 uppercase tracking-widest sticky left-0 z-20 shrink-0">
                    {{ format(month.date, 'MMMM yyyy', { locale: fr }) }}
                  </div>
                  <div class="flex flex-1">
                    <div *ngFor="let day of month.days; trackBy: trackDayByDate" 
                         class="flex-none border-r border-gray-300 dark:border-gray-700 flex flex-col items-center justify-end pb-1 text-[10px] relative" 
                         [style.width.px]="dayWidth"
                         [class.font-bold]="day.isToday"
                         [class.text-emerald-700]="day.isToday"
                         [class.dark:text-emerald-400]="day.isToday"
                         [class.bg-emerald-100]="day.isToday"
                         [class.dark:bg-emerald-900\/40]="day.isToday"
                         [class.bg-gray-100]="day.isWeekend && !day.isToday"
                         [class.dark:bg-gray-800]="day.isWeekend && !day.isToday"
                         [class.text-gray-400]="day.isWeekend"
                         [class.bg-rose-50]="day.isHoliday && !day.isToday"
                         [class.dark:bg-rose-900\/20]="day.isHoliday && !day.isToday"
                         [class.text-rose-400]="day.isHoliday">
                      <div class="mb-1">{{ day.label }}</div>
                      <div>{{ day.dayNum }}</div>

                      <!-- Code Freeze Icon -->
                      <div *ngIf="day.isCodeFreeze" class="absolute top-1.5 left-1/2 -translate-x-1/2 z-20" title="Code Freeze">
                        <div class="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                          <span class="material-icons text-[10px] text-indigo-500 dark:text-indigo-300">ac_unit</span>
                        </div>
                      </div>

                      <!-- MEP Back Icon (Cyan Rocket) -->
                      <div *ngIf="day.isMepBack" class="absolute top-1.5 left-1/2 -translate-x-1/2 z-20" title="Mise en production Back">
                         <div class="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/50 border border-cyan-100 dark:border-cyan-800 shadow-sm">
                            <span class="material-icons text-[10px] text-cyan-600 dark:text-cyan-400">rocket_launch</span>
                         </div>
                      </div>

                      <!-- MEP Front Icon (Green Rocket) -->
                      <div *ngIf="day.isMepFront" class="absolute top-1.5 left-1/2 -translate-x-1/2 z-20" title="Mise en production Front">
                         <div class="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                            <span class="material-icons text-[10px] text-emerald-600 dark:text-emerald-400">rocket_launch</span>
                         </div>
                      </div>

                      <!-- Sprint Top Marker (Refined) -->
                      <div *ngIf="day.activeSprint"
                           class="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-80"
                           [class.bg-sky-300]="!day.isCurrentSprint && day.sprintIndex! % 2 === 0"
                           [class.bg-emerald-300]="!day.isCurrentSprint && day.sprintIndex! % 2 !== 0"
                           [class.dark:bg-sky-400]="!day.isCurrentSprint && day.sprintIndex! % 2 === 0"
                           [class.dark:bg-emerald-400]="!day.isCurrentSprint && day.sprintIndex! % 2 !== 0"
                           [class.bg-amber-500]="day.isCurrentSprint"
                           [class.dark:bg-amber-500]="day.isCurrentSprint"
                      ></div>
                      <!-- Sprint Name (Start Only - Horizontal Badge) -->
                      <div *ngIf="day.activeSprint && day.isSprintStart"
                           class="absolute top-[4px] left-0 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap z-20 px-1 rounded-r-sm shadow-sm opacity-90"
                           [class.bg-sky-50]="!day.isCurrentSprint && day.sprintIndex! % 2 === 0"
                           [class.text-sky-600]="!day.isCurrentSprint && day.sprintIndex! % 2 === 0"
                           [class.bg-emerald-50]="!day.isCurrentSprint && day.sprintIndex! % 2 !== 0"
                           [class.text-emerald-600]="!day.isCurrentSprint && day.sprintIndex! % 2 !== 0"
                           [class.dark:bg-sky-900]="!day.isCurrentSprint && day.sprintIndex! % 2 === 0"
                           [class.dark:text-sky-300]="!day.isCurrentSprint && day.sprintIndex! % 2 === 0"
                           [class.dark:bg-emerald-900]="!day.isCurrentSprint && day.sprintIndex! % 2 !== 0"
                           [class.dark:text-emerald-300]="!day.isCurrentSprint && day.sprintIndex! % 2 !== 0"
                           
                           [class.bg-amber-50]="day.isCurrentSprint"
                           [class.text-amber-700]="day.isCurrentSprint"
                           [class.dark:bg-amber-900]="day.isCurrentSprint"
                           [class.dark:text-amber-400]="day.isCurrentSprint"
                      >
                        {{ day.activeSprint.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>

          <!-- Timeline Grid Container (Scrollable) -->
          <div #mainScrollContainer class="flex-1 overflow-auto custom-scrollbar" (scroll)="onMainScroll($event)">
            <div class="relative" [style.width.px]="timelineWidth">
              
              <!-- BACKGROUND LAYER: The Grids (Rendered ONCE) -->
              <!-- We use an absolute container that fills the height. -->
              <!-- Optimization: Since dragging needs per-row interaction, we can't just have one bg. 
                   But we can have the grid lines drawn by one bg container, and the rows transparent. -->
              
              <div class="absolute inset-0 flex z-0 pointer-events-none sticky-cols">
                 <ng-container *ngFor="let month of monthData; trackBy: trackMonthByDate">
                    <div *ngFor="let day of month.days; trackBy: trackDayByDate"
                         class="border-r border-gray-300 dark:border-gray-700 h-full flex-shrink-0"
                         [style.width.px]="dayWidth"
                         [class.bg-emerald-50]="day.isToday"
                         [class.dark:bg-emerald-900\/10]="day.isToday"
                         [class.bg-gray-50]="day.isWeekend && !day.isToday"
                         [class.dark:bg-gray-800\/50]="day.isWeekend && !day.isToday"
                         [class.bg-rose-50]="day.isHoliday && !day.isToday"
                         [class.dark:bg-rose-900\/20]="day.isHoliday && !day.isToday">
                    </div>
                 </ng-container>
              </div>

              <!-- CONTENT LAYER: Transparent Rows -->
              <div class="relative z-10" #rowsContainer>
                  <div *ngFor="let user of filteredUsers; trackBy: trackUserById" 
                       class="h-8 border-b border-gray-300 dark:border-gray-700 relative hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                       [class.bg-indigo-50]="user.id === highlightedUserId"
                       [class.dark:bg-indigo-900/20]="user.id === highlightedUserId"
                       (mousedown)="onRowMouseDown($event, user)"
                       (mousemove)="onRowMouseMove($event)">
                    
                    <!-- Absences overlay -->
                    <ng-container *ngFor="let absence of getUserAbsences(user.id); trackBy: trackAbsenceById">
                       <ng-container *ngFor="let segment of getAbsenceSegments(absence); trackBy: trackSegment">
                           <div class="absolute top-1 bottom-1 shadow-sm cursor-pointer hover:brightness-110 transition-all z-20 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
                                [style.left.px]="getDateLeft(segment.start)"
                                [style.width.px]="getSegmentWidth(segment.start, segment.end)"
                                [style.background]="getSegmentBackground(absence, segment.shape)"
                                (click)="editAbsence(absence, $event)">
                           </div>
                       </ng-container>
                    </ng-container>

                    <!-- Ghost Absence (Dragging) -->
                     <div *ngIf="isDragging && selectedUser?.id === user.id"
                          class="absolute top-1 bottom-1 rounded bg-indigo-200 dark:bg-indigo-500/50 opacity-70 z-30 pointer-events-none border border-indigo-400"
                          [style.left.px]="getGhostLeft()"
                          [style.width.px]="getGhostWidth()">
                     </div>

                  </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay flex items-center justify-center z-50" (click)="closeModal()">
        <div class="modal-content max-w-md fade-in-scale" (click)="$event.stopPropagation()">
            <div class="modal-header-glass">
                <div class="flex items-center space-x-3">
                    <span class="material-icons text-xl text-primary-600">event_note</span>
                    <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ editingAbsence ? 'Modifier' : 'Ajouter' }} une absence</h3>
                </div>
                <button (click)="closeModal()" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-500">close</span>
                </button>
            </div>
            
            <div class="p-6 space-y-4">
                <div *ngIf="selectedUser" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Pour : <span class="font-semibold text-gray-900 dark:text-white">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</span>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'absence</label>
                    <div class="grid grid-cols-1 gap-2">
                        <button type="button" (click)="newAbsence.type = 'ABSENCE'" 
                            [class.ring-2]="newAbsence.type === 'ABSENCE'" 
                            class="px-4 py-3 rounded-lg border flex items-center space-x-3 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 bg-white dark:bg-gray-800 text-left">
                            <div class="w-4 h-4 rounded-full bg-orange-300"></div>
                            <span class="font-medium text-gray-900 dark:text-white">{{ ABSENCE_LABELS.ABSENCE }}</span>
                        </button>
                        <button type="button" (click)="newAbsence.type = 'FORMATION'" 
                            [class.ring-2]="newAbsence.type === 'FORMATION'" 
                            class="px-4 py-3 rounded-lg border flex items-center space-x-3 transition-all hover:bg-sky-50 dark:hover:bg-sky-900/20 border-sky-200 bg-white dark:bg-gray-800 text-left">
                            <div class="w-4 h-4 rounded-full bg-sky-500"></div>
                            <span class="font-medium text-gray-900 dark:text-white">{{ ABSENCE_LABELS.FORMATION }}</span>
                        </button>
                        <button type="button" (click)="newAbsence.type = 'TELETRAVAIL'" 
                            [class.ring-2]="newAbsence.type === 'TELETRAVAIL'" 
                            class="px-4 py-3 rounded-lg border flex items-center space-x-3 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 border-rose-200 bg-white dark:bg-gray-800 text-left">
                            <div class="w-4 h-4 rounded-full bg-rose-500"></div>
                            <span class="font-medium text-gray-900 dark:text-white">{{ ABSENCE_LABELS.TELETRAVAIL }}</span>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <!-- Start Date & Period -->
                    <div class="flex space-x-2">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Début</label>
                            <input type="date" [(ngModel)]="newAbsence.startDate" class="input w-full">
                        </div>
                        <div class="w-32">
                           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Créneau</label>
                           <div class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                               <button type="button" (click)="newAbsence.startPeriod = 'MORNING'" 
                                       [class.bg-indigo-100]="newAbsence.startPeriod === 'MORNING'"
                                       [class.text-indigo-700]="newAbsence.startPeriod === 'MORNING'"
                                       class="flex-1 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                   Matin
                               </button>
                               <div class="w-px bg-gray-300 dark:bg-gray-600"></div>
                               <button type="button" (click)="newAbsence.startPeriod = 'AFTERNOON'" 
                                       [class.bg-indigo-100]="newAbsence.startPeriod === 'AFTERNOON'"
                                       [class.text-indigo-700]="newAbsence.startPeriod === 'AFTERNOON'"
                                       class="flex-1 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                   Ap-Midi
                               </button>
                           </div>
                        </div>
                    </div>

                    <!-- End Date & Period -->
                    <div class="flex space-x-2">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin</label>
                            <input type="date" [(ngModel)]="newAbsence.endDate" class="input w-full">
                        </div>
                        <div class="w-32">
                           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Créneau</label>
                           <div class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                               <button type="button" (click)="newAbsence.endPeriod = 'MORNING'" 
                                       [class.bg-indigo-100]="newAbsence.endPeriod === 'MORNING'"
                                       [class.text-indigo-700]="newAbsence.endPeriod === 'MORNING'"
                                       class="flex-1 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                   Matin
                               </button>
                               <div class="w-px bg-gray-300 dark:bg-gray-600"></div>
                               <button type="button" (click)="newAbsence.endPeriod = 'AFTERNOON'" 
                                       [class.bg-indigo-100]="newAbsence.endPeriod === 'AFTERNOON'"
                                       [class.text-indigo-700]="newAbsence.endPeriod === 'AFTERNOON'"
                                       class="flex-1 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                   Ap-Midi
                               </button>
                           </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 space-x-3">
                    <button *ngIf="editingAbsence" (click)="deleteCurrentAbsence()" class="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors">
                        Supprimer
                    </button>
                    <button (click)="closeModal()" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                        Annuler
                    </button>
                    <button (click)="saveAbsence()" class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50" [disabled]="!newAbsence.type || !newAbsence.startDate || !newAbsence.endDate || isSaving">
                        {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Hide scrollbar for header */
    ::-webkit-scrollbar { display: none; }
    .custom-scrollbar::-webkit-scrollbar { display: block; width: 8px; height: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 4px; }
  `]
})
export class AbsenceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainScrollContainer') mainScrollContainer!: ElementRef;
  @ViewChild('headerScrollContainer') headerScrollContainer!: ElementRef;
  @ViewChild('userListContainer') userListContainer!: ElementRef;

  users: AbsenceUser[] = [];
  filteredUsers: AbsenceUser[] = [];
  absences: Absence[] = [];
  sprints: Sprint[] = [];

  // Maps for O(1) access
  private userAbsencesMap = new Map<string, Absence[]>();
  private absenceSegmentsMap = new Map<string, { start: Date, end: Date, shape: 'FULL' | 'PM' | 'AM' }[]>();

  uniqueMetiers: string[] = [];
  uniqueSquads: string[] = [];
  uniqueTribus: string[] = [];
  selectedMetiers: string[] = [];
  selectedSquads: string[] = [];
  selectedTribus: string[] = [];
  selectedStatus: 'ALL' | 'INTERNAL' | 'EXTERNAL' = 'ALL';
  searchQuery = '';

  // Timeline config
  startDate: Date = startOfMonth(addMonths(new Date(), -3));
  endDate: Date = endOfMonth(addMonths(new Date(), 12));
  monthData: MonthMetadata[] = [];
  allDays: DayMetadata[] = [];

  dayWidth = 32; // px
  timelineWidth = 0;

  // Interaction
  isDragging = false;
  dragStartX = 0;
  dragCurrentX = 0;
  selectedUser: AbsenceUser | null = null;
  highlightedUserId: string | null = null;

  toggleHighlight(userId: string) {
    this.highlightedUserId = this.highlightedUserId === userId ? null : userId;
  }

  // Polling
  private refreshSubscription: Subscription | null = null;

  // Modal
  showModal = false;
  editingAbsence: Absence | null = null;
  newAbsence: Partial<CreateAbsenceRequest> = { type: 'ABSENCE', startPeriod: 'MORNING', endPeriod: 'AFTERNOON' };

  ABSENCE_LABELS = ABSENCE_LABELS;

  showUserDetails = false;
  emailCopySuccess = false;

  toggleUserDetails() {
    this.showUserDetails = !this.showUserDetails;
    // Recalculate layout or just let Angular handle check
    this.cdr.markForCheck();
  }

  copyEmails() {
    const emails = this.filteredUsers
      .map(u => u.email)
      .filter(email => !!email)
      .join('; ');

    if (!emails) return;

    navigator.clipboard.writeText(emails).then(() => {
      this.emailCopySuccess = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.emailCopySuccess = false;
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  constructor(
    private absenceService: AbsenceService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sprintService: SprintService,
    private toastService: ToastService
  ) {
    // We delay generateTimeline until sprints are loaded or parallel? 
    // Sprints are visual, can be loaded whenever. 
    this.generateTimeline();
  }

  format = format;
  fr = fr;

  generateTimeline() {
    this.monthData = []; // Clear previous data
    const rawDays = eachDayOfInterval({ start: this.startDate, end: this.endDate });

    // Pre-calculate metadata
    this.allDays = rawDays.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');

      // Check triggers
      const isCodeFreeze = this.sprints.some(s => s.codeFreezeDate === dateStr);
      const isMepBack = this.sprints.some(s => s.releaseDateBack === dateStr);
      const isMepFront = this.sprints.some(s => s.releaseDateFront === dateStr);

      return {
        date: d,
        isWeekend: isWeekend(d),
        isHoliday: this.checkIsHoliday(d),
        isToday: isToday(d),

        label: format(d, 'EEEEE', { locale: fr }),
        dayNum: format(d, 'dd'),
        isCodeFreeze,
        isMepBack,
        isMepFront,
        ...this.getSprintInfo(dateStr)
      };
    });

    this.timelineWidth = this.allDays.length * this.dayWidth;

    // Group by months for header
    let currentDayIndex = 0;
    let currentMonthDate = startOfMonth(this.startDate);

    while (currentMonthDate <= this.endDate) {
      const monthEnd = endOfMonth(currentMonthDate);
      const effectiveEnd = monthEnd > this.endDate ? this.endDate : monthEnd;

      const daysInMonth: DayMetadata[] = [];
      while (currentDayIndex < this.allDays.length && this.allDays[currentDayIndex].date <= effectiveEnd) {
        daysInMonth.push(this.allDays[currentDayIndex]);
        currentDayIndex++;
      }

      if (daysInMonth.length > 0) {
        this.monthData.push({
          date: currentMonthDate,
          days: daysInMonth,
          width: daysInMonth.length * this.dayWidth
        });
      }
      currentMonthDate = addMonths(currentMonthDate, 1);
    }
  }

  ngOnInit() {
    this.loadSprints(); // Load sprints first or parallel
    this.loadUsers();
    this.startPolling();
  }

  loadSprints() {
    this.sprintService.getAllSprints().subscribe(sprints => {
      this.sprints = sprints.sort((a, b) => a.startDate.localeCompare(b.startDate));
      // Regenerate timeline metadata to apply sprint info
      this.generateTimeline();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        const targetDate = new Date(params['date']);
        if (!isNaN(targetDate.getTime())) {
          setTimeout(() => this.scrollToDate(targetDate), 100);
        } else {
          this.scrollToDate(new Date());
        }
      } else {
        this.scrollToDate(new Date());
      }
    });
  }

  loadUsers() {
    this.absenceService.getAbsenceUsers().subscribe(users => {
      this.users = users;
      this.uniqueMetiers = [...new Set(users.map(u => u.metier).filter(Boolean))].sort();
      this.uniqueSquads = [...new Set(users.flatMap(u => u.squads || []).filter(Boolean))].sort();
      this.uniqueTribus = [...new Set(users.map(u => u.tribu).filter(Boolean))].sort();
      this.filterUsers();
      this.cdr.markForCheck();
    });
  }

  startPolling() {
    this.refreshAbsences(); // Initial load

    this.refreshSubscription = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchAbsencesObservable())
      )
      .subscribe(absences => {
        this.absences = absences;
        this.rebuildAbsenceMaps();
        this.cdr.markForCheck();
      });
  }

  private fetchAbsencesObservable() {
    const startIo = format(this.startDate, 'yyyy-MM-dd');
    const endIo = format(this.endDate, 'yyyy-MM-dd');
    return this.absenceService.getAbsences(startIo, endIo);
  }

  refreshAbsences() {
    this.fetchAbsencesObservable().subscribe(absences => {
      this.absences = absences;
      this.rebuildAbsenceMaps();
      this.cdr.markForCheck();
    });
  }

  rebuildAbsenceMaps() {
    this.userAbsencesMap.clear();
    this.absenceSegmentsMap.clear();

    for (const abs of this.absences) {
      // User Map
      if (!this.userAbsencesMap.has(abs.userId)) {
        this.userAbsencesMap.set(abs.userId, []);
      }
      this.userAbsencesMap.get(abs.userId)!.push(abs);

      // Segment Map
      this.absenceSegmentsMap.set(abs.id, this.calculateSegments(abs));
    }
  }

  getUserAbsences(userId: string): Absence[] {
    return this.userAbsencesMap.get(userId) || [];
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(u => {
      const matchesSearch = !this.searchQuery ||
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesMetier = this.selectedMetiers.length === 0 ||
        (u.metier && this.selectedMetiers.includes(u.metier));

      const matchesSquad = this.selectedSquads.length === 0 ||
        (u.squads && u.squads.some(s => this.selectedSquads.includes(s)));

      const matchesTribu = this.selectedTribus.length === 0 ||
        (u.tribu && this.selectedTribus.includes(u.tribu));

      const matchesStatus = this.selectedStatus === 'ALL' ||
        (this.selectedStatus === 'INTERNAL' && u.interne) ||
        (this.selectedStatus === 'EXTERNAL' && !u.interne);

      return matchesSearch && matchesMetier && matchesSquad && matchesTribu && matchesStatus;
    });
    this.cdr.markForCheck();
  }

  getSegmentBackground(absence: Absence, shape: 'FULL' | 'PM' | 'AM'): string {
    const colorMap: Record<string, string> = {
      'ABSENCE': '#fb923c', // orange-400
      'FORMATION': '#0ea5e9', // sky-500
      'TELETRAVAIL': '#fb7185' // rose-400
    };
    const color = colorMap[absence.type] || '#9ca3af';

    if (shape === 'FULL') {
      return color;
    } else if (shape === 'PM') {
      // Bottom-Right Triangle: Top-Left is transparent
      return `linear-gradient(to bottom right, transparent 50%, ${color} 50%)`;
    } else if (shape === 'AM') {
      // Top-Left Triangle: Bottom-Right is transparent
      return `linear-gradient(to bottom right, ${color} 50%, transparent 50%)`;
    }
    return color;
  }

  // Optimized Segment Calc
  getAbsenceSegments(absence: Absence): { start: Date, end: Date, shape: 'FULL' | 'PM' | 'AM' }[] {
    return this.absenceSegmentsMap.get(absence.id) || [];
  }

  private calculateSegments(absence: Absence): { start: Date, end: Date, shape: 'FULL' | 'PM' | 'AM' }[] {
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    const segments: { start: Date, end: Date, shape: 'FULL' | 'PM' | 'AM' }[] = [];

    let effectiveStart = new Date(start);
    let effectiveEnd = new Date(end);

    // Handle Start PM
    if (absence.startPeriod === 'AFTERNOON') {
      // If single day and end is MORNING, it's invalid sequence (PM -> AM same day), assuming validated.
      // If single day and end is AFTERNOON, it's PM Only.
      // We add a PM segment for the start day.
      segments.push({ start: new Date(effectiveStart), end: new Date(effectiveStart), shape: 'PM' });
      effectiveStart.setDate(effectiveStart.getDate() + 1);
    }

    // Handle End AM
    // If effectiveStart > effectiveEnd, we are done (e.g. single day PM case handled above).
    if (effectiveStart <= effectiveEnd) {
      if (absence.endPeriod === 'MORNING') {
        // Add AM segment for the end day
        segments.push({ start: new Date(effectiveEnd), end: new Date(effectiveEnd), shape: 'AM' });
        effectiveEnd.setDate(effectiveEnd.getDate() - 1);
      }
    }

    // Handle Middle (Full)
    if (effectiveStart <= effectiveEnd) {
      let loop = new Date(effectiveStart);
      let currentStart: Date | null = null;
      let currentEnd: Date | null = null;

      while (loop <= effectiveEnd) {
        const isOff = isWeekend(loop) || this.checkIsHoliday(loop);
        if (!isOff) {
          if (!currentStart) currentStart = new Date(loop);
          currentEnd = new Date(loop);
        } else {
          if (currentStart && currentEnd) {
            segments.push({ start: currentStart, end: currentEnd, shape: 'FULL' });
            currentStart = null;
            currentEnd = null;
          }
        }
        loop.setDate(loop.getDate() + 1);
      }
      if (currentStart && currentEnd) {
        segments.push({ start: currentStart, end: currentEnd, shape: 'FULL' });
      }
    }

    return segments;
  }

  // --- POSITIONING ---

  // Convert date to X pixels relative to start
  getDateX(date: Date): number {
    const diffTime = date.getTime() - this.startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays * this.dayWidth);
  }

  getDateLeft(date: Date): number {
    return this.getDateX(date);
  }

  getSegmentWidth(start: Date, end: Date): number {
    // Determine number of days inclusive
    const diffTime = end.getTime() - start.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return days * this.dayWidth;
  }


  // --- INTERACTION ---

  // Sync from Right (Main) to Left (Users) & Header
  onMainScroll(event: any) {
    const scrollLeft = event.target.scrollLeft;
    const scrollTop = event.target.scrollTop;

    // Sync Header (Horizontal)
    if (this.headerScrollContainer && this.headerScrollContainer.nativeElement.scrollLeft !== scrollLeft) {
      this.headerScrollContainer.nativeElement.scrollLeft = scrollLeft;
    }

    // Sync User List (Vertical)
    if (this.userListContainer && this.userListContainer.nativeElement.scrollTop !== scrollTop) {
      this.userListContainer.nativeElement.scrollTop = scrollTop;
    }
  }

  // Sync from Header to Main
  onHeaderScroll(event: any) {
    const scrollLeft = event.target.scrollLeft;
    if (this.mainScrollContainer && this.mainScrollContainer.nativeElement.scrollLeft !== scrollLeft) {
      this.mainScrollContainer.nativeElement.scrollLeft = scrollLeft;
    }
  }

  // Sync from Left (Users) to Right (Main)
  onLeftScroll(event: any) {
    const scrollTop = event.target.scrollTop;

    if (this.mainScrollContainer && this.mainScrollContainer.nativeElement.scrollTop !== scrollTop) {
      this.mainScrollContainer.nativeElement.scrollTop = scrollTop;
    }
  }

  scrollToDate(date: Date) {
    if (this.mainScrollContainer) {
      const x = this.getDateX(date);
      const center = x - (this.mainScrollContainer.nativeElement.clientWidth / 2) + (this.dayWidth / 2);
      this.mainScrollContainer.nativeElement.scrollLeft = Math.max(0, center);
    }
  }

  onRowMouseDown(event: MouseEvent, user: AbsenceUser) {
    if (!this.canEdit(user)) return; // Or show toast

    // Calculate clicked day index from offsetX
    // event.currentElement is the row. offsetX is relative to row? 
    // Careful with bubbles. Better use getBoundingClientRect.
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left; // relative to row
    // Adjust for scroll? No, row is scrolled. Wait.
    // getBoundingClientRect is absolute viewport.
    // If the container scrolls, the row moves left?
    // The row is inside `div.relative` which has width `timelineWidth`.
    // The `mainScrollContainer` scrolls.
    // So `rect.left` moves. `event.clientX` is viewport.
    // `x` is relative to the START of the timeline row. Correct.

    this.isDragging = true;
    this.selectedUser = user;
    this.dragStartX = x;
    this.dragCurrentX = x;

    // Add global mouseup listener
    document.addEventListener('mouseup', this.onGlobalMouseUp);
  }

  onRowMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    this.dragCurrentX = x;
    // this.cdr.markForCheck(); // handled by OnPush? events trigger CD.
  }

  onGlobalMouseUp = () => {
    if (this.isDragging) {
      this.finishDrag();
    }
    document.removeEventListener('mouseup', this.onGlobalMouseUp);
  }

  finishDrag() {
    this.isDragging = false;
    // Calculate dates
    const startX = Math.min(this.dragStartX, this.dragCurrentX);
    const endX = Math.max(this.dragStartX, this.dragCurrentX);

    // Convert X to Date index
    const startIndex = Math.floor(startX / this.dayWidth);
    const endIndex = Math.floor(endX / this.dayWidth); // inclusive of pixel?
    // Actually, if we drag 40px, we select 1 day.

    const startDay = new Date(this.startDate);
    startDay.setDate(startDay.getDate() + startIndex);

    const endDay = new Date(this.startDate);
    endDay.setDate(endDay.getDate() + endIndex); // inclusive

    if (this.selectedUser) {
      this.openCreateModal(startDay, endDay);
    }

    this.dragStartX = 0;
    this.dragCurrentX = 0;
    this.cdr.markForCheck();
  }

  // Ghost Positioning
  getGhostLeft(): number {
    const x = Math.min(this.dragStartX, this.dragCurrentX);
    // Snap to grid
    const colParams = Math.floor(x / this.dayWidth);
    return colParams * this.dayWidth;
  }

  getGhostWidth(): number {
    const startX = Math.min(this.dragStartX, this.dragCurrentX);
    const endX = Math.max(this.dragStartX, this.dragCurrentX);

    const startCol = Math.floor(startX / this.dayWidth);
    const endCol = Math.floor(endX / this.dayWidth); // if we are at pixel 41, endCol=1. Width = (1-1 + 1) * 40?
    // endX is strictly the mouse pos.
    // if mouse is at 50 (col 1), start at 10 (col 0).
    // range 0..1.

    return ((endCol - startCol) + 1) * this.dayWidth;
  }

  openCreateModal(start: Date, end: Date) {
    if (!this.selectedUser) return;
    this.editingAbsence = null;
    this.newAbsence = {
      userId: this.selectedUser.id,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      type: 'ABSENCE'
    };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  // Helper
  checkIsHoliday(day: Date): boolean {
    const year = day.getFullYear();
    const month = day.getMonth() + 1;
    const date = day.getDate();

    const fixedHolidays = [
      { month: 1, date: 1 },
      { month: 5, date: 1 },
      { month: 5, date: 8 },
      { month: 7, date: 14 },
      { month: 8, date: 15 },
      { month: 11, date: 1 },
      { month: 11, date: 11 },
      { month: 12, date: 25 }
    ];

    if (fixedHolidays.some(h => h.month === month && h.date === date)) return true;

    // Easter calc
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const monthE = Math.floor((h + l - 7 * m + 114) / 31);
    const dayE = ((h + l - 7 * m + 114) % 31) + 1;

    // Check specific easter dates
    const easter = new Date(year, monthE - 1, dayE);

    // Common helper for checking if a date matches
    const isSame = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();

    if (isSame(day, easter)) return true; // Pâques

    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    if (isSame(day, easterMonday)) return true; // Lundi de Pâques

    const ascension = new Date(easter);
    ascension.setDate(easter.getDate() + 39);
    if (isSame(day, ascension)) return true; // Ascension

    const pentecostMonday = new Date(easter);
    pentecostMonday.setDate(easter.getDate() + 50);
    if (isSame(day, pentecostMonday)) return true; // Lundi de Pentecôte

    return false;
  }



  private getSprintInfo(dateStr: string): { activeSprint?: Sprint, sprintIndex?: number, isSprintStart?: boolean, isCurrentSprint?: boolean } {
    if (!this.sprints.length) return {};

    const index = this.sprints.findIndex(s => dateStr >= s.startDate && dateStr <= s.endDate);
    if (index === -1) return {};

    const sprint = this.sprints[index];
    const todayStr = new Date().toISOString().split('T')[0];
    const isCurrent = todayStr >= sprint.startDate && todayStr <= sprint.endDate;

    return {
      activeSprint: sprint,
      sprintIndex: index,
      isSprintStart: sprint.startDate === dateStr,
      isCurrentSprint: isCurrent
    };
  }

  // TrackBy functions for optimization
  trackUserById(index: number, user: AbsenceUser): string { return user.id; }
  trackAbsenceById(index: number, absence: Absence): string { return absence.id; }
  trackDayByDate(index: number, d: DayMetadata): number { return d.date.getTime(); }
  trackMonthByDate(index: number, m: MonthMetadata): number { return m.date.getTime(); }
  trackSegment(index: number, seg: any): string { return seg.start.getTime() + '-' + seg.end.getTime(); }

  // ... (rest of methods: editAbsence, canEdit, saveAbsence, deleteCurrentAbsence, closeModel)
  // Ensure they use cdr.markForCheck() if needed or just rely on OnPush interaction

  editAbsence(absence: Absence, event: Event) {
    event.stopPropagation();
    const user = this.users.find(u => u.id === absence.userId);
    if (!user || !this.canEdit(user)) return;
    this.editingAbsence = absence;
    this.selectedUser = user;
    this.newAbsence = { ...absence };
    this.showModal = true;
  }

  canEdit(targetUser: AbsenceUser): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    const hasAdminAccess = this.permissionService.hasWriteAccess('ADMIN');
    if (hasAdminAccess) return true;
    if (currentUser.id === targetUser.id && this.permissionService.hasWriteAccess('ABSENCE')) return true;
    return false;
  }

  closeModal() {
    this.showModal = false;
    this.editingAbsence = null;
    this.cdr.markForCheck();
  }

  isSaving = false;

  saveAbsence() {
    if (!this.selectedUser || this.isSaving) return;
    this.isSaving = true;

    const request: CreateAbsenceRequest = {
      userId: this.selectedUser.id,
      startDate: this.newAbsence.startDate!,
      endDate: this.newAbsence.endDate!,
      type: this.newAbsence.type!,
      startPeriod: this.newAbsence.startPeriod!,
      endPeriod: this.newAbsence.endPeriod!
    };

    const finalize = () => {
      this.isSaving = false;
      this.cdr.markForCheck();
    };

    if (this.editingAbsence) {
      this.absenceService.updateAbsence(this.editingAbsence.id, request).subscribe(
        updated => {
          this.toastService.success('Absence modifiée avec succès');
          this.closeModal();
          this.refreshAbsences();
          finalize();
        },
        error => {
          console.error(error);
          this.toastService.error('Erreur lors de la modification de l\'absence');
          finalize();
        }
      );
    } else {
      this.absenceService.createAbsence(request).subscribe(
        created => {
          this.toastService.success('Absence créée avec succès');
          this.closeModal();
          this.refreshAbsences();
          finalize();
        },
        error => {
          console.error(error);
          this.toastService.error('Erreur lors de la création de l\'absence');
          finalize();
        }
      );
    }
  }

  deleteCurrentAbsence() {
    if (this.editingAbsence) {
      this.absenceService.deleteAbsence(this.editingAbsence.id).subscribe(
        () => {
          this.toastService.success('Absence supprimée avec succès');
          this.closeModal();
          this.refreshAbsences();
        },
        error => {
          console.error(error);
          this.toastService.error('Erreur lors de la suppression de l\'absence');
        }
      );
    }
  }
}
