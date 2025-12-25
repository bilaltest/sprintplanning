import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '@services/settings.service';
import { EventService } from '@services/event.service';
import { ReleaseService } from '@services/release.service';
import { AuthService, PermissionModule } from '@services/auth.service';
import { Event } from '@models/event.model';
import { Release } from '@models/release.model';
import { Absence, ABSENCE_LABELS } from '@models/absence.model';
import { AbsenceService } from '@services/absence.service';
import { format, isFuture, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { interval, Subscription } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { OnboardingService } from '@services/onboarding.service';
import { WelcomeModalComponent } from '../onboarding/welcome-modal/welcome-modal.component';
import { driver } from 'driver.js';

interface Widget {
  id: string;
  type: 'events7days' | 'nextMep' | 'userAbsences';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatDialogModule],
  template: `
    <div class="min-h-screen relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-300">
      
      <!-- Content Container -->
      <div class="relative z-10 container mx-auto px-4 py-8 space-y-12">
        
        <!-- Header Section -->
        <header class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
             <!-- Optional: Add a user greeting or logo here if needed -->
          </div>
          <div class="flex items-center space-x-4">

          </div>
        </header>

        <!-- Main Applications Section -->
        <section class="space-y-8">
          <div class="flex items-center space-x-4 mb-8">
            <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-900/5 dark:via-white/10 to-transparent"></div>
            <h2 class="text-xl font-light tracking-[0.2em] text-emerald-900/60 dark:text-emerald-100/60 uppercase">Applications</h2>
            <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-900/5 dark:via-white/10 to-transparent"></div>
          </div>

          <div id="apps-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
            <!-- Calendrier Card -->
            <div *ngIf="canAccess('CALENDAR')" (click)="navigateToCalendar()"
                 class="group relative cursor-pointer h-72 rounded-3xl p-1 transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1">
              <!-- Glow Border -->
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <!-- Card Content -->
              <div class="relative h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-xl dark:shadow-black/40 hover:shadow-2xl transition-all duration-300">
                <!-- Background decoration -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 dark:from-emerald-500/10 dark:to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10 mb-6 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                   <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/90 to-teal-600/90 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/10 dark:shadow-black/30 group-hover:shadow-emerald-500/20 transition-shadow duration-300">
                      <span class="material-icons text-white text-4xl">calendar_month</span>
                   </div>
                </div>
                
                <h3 class="relative z-10 text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2 tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Calendrier</h3>
                <p class="relative z-10 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Planifiez vos événements et activités</p>
                
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>

            <!-- Absences Card -->
            <div *ngIf="canAccess('ABSENCE')" (click)="navigateToAbsences()"
                 class="group relative cursor-pointer h-72 rounded-3xl p-1 transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-500/20 dark:to-orange-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="relative h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-xl dark:shadow-black/40 hover:shadow-2xl transition-all duration-300">
                <div class="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-orange-100/20 dark:from-amber-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10 mb-6 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                   <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/90 to-orange-600/90 dark:from-amber-600 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/10 dark:shadow-black/30 group-hover:shadow-amber-500/20 transition-shadow duration-300">
                      <span class="material-icons text-white text-4xl">beach_access</span>
                   </div>
                </div>
                
                <h3 class="relative z-10 text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2 tracking-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Absences</h3>
                <p class="relative z-10 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Gérez votre activité et vos absences</p>
                
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>

                        <!-- MEP Card -->
            <div *ngIf="canAccess('RELEASES')" (click)="navigateToReleases()"
                 class="group relative cursor-pointer h-72 rounded-3xl p-1 transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1">
              <div class="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="relative h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-xl dark:shadow-black/40 hover:shadow-2xl transition-all duration-300">
                <div class="absolute inset-0 bg-gradient-to-br from-teal-100/20 to-cyan-100/20 dark:from-teal-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10 mb-6 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                   <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/90 to-cyan-600/90 dark:from-teal-600 dark:to-cyan-700 flex items-center justify-center shadow-lg shadow-teal-500/10 dark:shadow-black/30 group-hover:shadow-teal-500/20 transition-shadow duration-300">
                      <span class="material-icons text-white text-4xl">rocket_launch</span>
                   </div>
                </div>
                
                <h3 class="relative z-10 text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2 tracking-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Préparation MEP</h3>
                <p class="relative z-10 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Gérez vos mises en production</p>
                
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
            
            <!-- Playground Card -->
            <div *ngIf="canAccess('PLAYGROUND')" (click)="navigateToPlayground()"
                 class="group relative cursor-pointer h-72 rounded-3xl p-1 transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1"
                 [ngClass]="{'animate-blob': isPlaygroundNew}">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="relative h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-xl dark:shadow-black/40 hover:shadow-2xl transition-all duration-300">
                <div class="absolute inset-0 bg-gradient-to-br from-violet-100/20 to-fuchsia-100/20 dark:from-violet-500/10 dark:to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10 mb-6 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                   <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/90 to-fuchsia-600/90 dark:from-violet-600 dark:to-fuchsia-700 flex items-center justify-center shadow-lg shadow-violet-500/10 dark:shadow-black/30 group-hover:shadow-violet-500/20 transition-shadow duration-300">
                      <span class="material-icons text-white text-4xl">sports_esports</span>
                   </div>
                </div>
                
                <h3 class="relative z-10 text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2 tracking-tight group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">Playground</h3>
                <p class="relative z-10 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Jeux et détente</p>
                
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>

            <!-- Admin Card -->
            <div *ngIf="canAccess('ADMIN')" (click)="navigateToAdmin()"
                 class="group relative cursor-pointer h-72 rounded-3xl p-1 transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1">
              <div class="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-500/20 dark:from-slate-500/20 dark:to-slate-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="relative h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-xl dark:shadow-black/40 hover:shadow-2xl transition-all duration-300">
                <div class="absolute inset-0 bg-gradient-to-br from-slate-100/20 to-slate-200/20 dark:from-slate-500/10 dark:to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10 mb-6 transform group-hover:scale-110 transition-transform duration-500 ease-out">
                   <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-500/90 to-slate-600/90 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/10 dark:shadow-black/30 group-hover:shadow-slate-500/20 transition-shadow duration-300">
                      <span class="material-icons text-white text-4xl">admin_panel_settings</span>
                   </div>
                </div>
                
                <h3 class="relative z-10 text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2 tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">Administration</h3>
                <p class="relative z-10 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Gestion de l'application</p>
                
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Widgets Section -->
        <section class="space-y-8">
          <div class="flex items-center space-x-4 mb-4">
             <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-900/5 dark:via-white/10 to-transparent"></div>
             <h2 class="text-xl font-light tracking-[0.2em] text-emerald-900/60 dark:text-emerald-100/60 uppercase">Tableau de bord</h2>
             <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-900/5 dark:via-white/10 to-transparent"></div>
          </div>

          <!-- Error Banner (shown when backend is unavailable) -->
          <div *ngIf="eventsError || releasesError"
               class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-start space-x-3">
            <span class="material-icons text-red-600 dark:text-red-400 mt-0.5">error_outline</span>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Serveur indisponible</h3>
              <p class="text-xs text-red-700 dark:text-red-400">
                Impossible de charger les données. Le serveur backend ne répond pas.
              </p>
            </div>
            <button
              (click)="retryLoadData()"
              class="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg transition-colors flex items-center space-x-1">
              <span class="material-icons text-sm">refresh</span>
              <span>Réessayer</span>
            </button>
          </div>

          <div
            id="widgets-grid"
            cdkDropList
            [cdkDropListAutoScrollDisabled]="false"
            (cdkDropListDropped)="onWidgetDrop($event)"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <ng-container *ngFor="let widget of orderedWidgets">
              <div cdkDrag class="relative group">
                 <!-- Drag Handle -->
                 <div class="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-move p-1.5 bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg backdrop-blur-md">
                   <span class="material-icons text-sm text-slate-500 dark:text-slate-400">drag_indicator</span>
                 </div>

                 <!-- Glass Widget Card Container -->
                 <div class="h-full bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 hover:border-emerald-500/20 dark:hover:border-white/10 rounded-2xl p-5 shadow-md dark:shadow-black/40 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/50 flex flex-col"
                      [class.cursor-move]="true"
                      (click)="handleWidgetClick($event, widget.type === 'events7days' ? 'calendar' : widget.type === 'userAbsences' ? 'absence' : widget.type === 'nextMep' ? 'release' : null, widget.type === 'nextMep' ? nextMep : null)">
                    
                    <!-- Events Widget -->
                    <ng-container *ngIf="widget.type === 'events7days'">
                         <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                               <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                  <span class="material-icons text-lg">calendar_today</span>
                               </div>
                               <div>
                                  <h3 class="text-slate-800 dark:text-slate-200 font-medium">Événements</h3>
                                  <p class="text-xs text-slate-500 dark:text-slate-400">15 prochains jours</p>
                               </div>
                            </div>
                            <span class="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-mono text-slate-600 dark:text-slate-300">{{ eventsNext15Days.length }}</span>
                         </div>

                         <!-- Loading State -->
                         <div *ngIf="isLoadingEvents" class="space-y-2 flex-1">
                            <div *ngFor="let i of [1,2,3,4]" class="flex items-center space-x-3 p-2">
                               <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
                               <div class="flex-1 space-y-2">
                                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                                  <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
                               </div>
                            </div>
                         </div>

                         <!-- Data Loaded -->
                         <div *ngIf="!isLoadingEvents" class="space-y-2 flex-1 overflow-y-auto custom-scrollbar-thin">
                            <div *ngFor="let event of eventsNext15Days.slice(0, 4)"
                                 class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/item"
                                 (click)="navigateToEvent(event, $event)">
                               <div class="w-2 h-2 rounded-full shadow-sm" [style.background-color]="event.color"></div>
                               <div class="flex-1 min-w-0">
                                  <p class="text-sm text-slate-700 dark:text-slate-300 truncate group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400 transition-colors">{{ event.title }}</p>
                                  <p class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(event.date) }}</p>
                               </div>
                            </div>
                            <div *ngIf="eventsNext15Days.length === 0 && !eventsError" class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                               <span class="material-icons text-3xl mb-2 opacity-50">event_busy</span>
                               <span class="text-xs">Aucun événement</span>
                            </div>
                            <div *ngIf="eventsError" class="flex-1 flex flex-col items-center justify-center text-red-400 dark:text-red-500">
                               <span class="material-icons text-3xl mb-2">error_outline</span>
                               <span class="text-xs text-center">{{ eventsError }}</span>
                            </div>
                         </div>
                    </ng-container>

                    <!-- MEP Widget -->
                    <ng-container *ngIf="widget.type === 'nextMep'">
                         <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                               <div class="p-2 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400">
                                  <span class="material-icons text-lg">rocket_launch</span>
                               </div>
                               <div>
                                  <h3 class="text-slate-800 dark:text-slate-200 font-medium">Prochaine MEP</h3>
                               </div>
                            </div>
                         </div>

                         <!-- Loading State -->
                         <div *ngIf="isLoadingReleases" class="flex-1 flex flex-col items-center justify-center">
                            <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mb-3"></div>
                            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32 mb-2"></div>
                            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24"></div>
                         </div>

                         <!-- Data Loaded -->
                         <div *ngIf="!isLoadingReleases">
                            <div *ngIf="nextMep && !releasesError" class="flex-1 flex flex-col">
                               <div class="text-center my-auto">
                                  <div class="inline-block p-3 rounded-full bg-teal-50 dark:bg-teal-500/10 mb-3 animate-pulse">
                                     <span class="material-icons text-3xl text-teal-500 dark:text-teal-400">event</span>
                                  </div>
                                  <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 truncate px-2">{{ nextMep.name }}</h3>
                                  <p class="text-sm text-teal-600 dark:text-teal-400 font-mono">{{ formatDate(nextMep.releaseDate) }}</p>
                               </div>

                               <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                                  <div class="flex items-center justify-between">
                                     <span class="text-xs text-slate-400 dark:text-slate-500">J-{{ getDaysUntilMep(nextMep.releaseDate) }}</span>
                                     <button class="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center transition-colors">
                                       Détails <span class="material-icons text-xs ml-1">arrow_forward</span>
                                     </button>
                                   </div>
                               </div>
                            </div>
                            <div *ngIf="!nextMep && !releasesError" class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                               <span class="material-icons text-3xl mb-2 opacity-50">rocket</span>
                               <span class="text-xs">Aucune MEP planifiée</span>
                            </div>
                            <div *ngIf="releasesError" class="flex-1 flex flex-col items-center justify-center text-red-400 dark:text-red-500">
                               <span class="material-icons text-3xl mb-2">error_outline</span>
                               <span class="text-xs text-center">{{ releasesError }}</span>
                            </div>
                         </div>
                    </ng-container>

                    <!-- Absences Widget -->
                    <ng-container *ngIf="widget.type === 'userAbsences'">
                         <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                               <div class="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  <span class="material-icons text-lg">beach_access</span>
                               </div>
                               <div>
                                  <h3 class="text-slate-800 dark:text-slate-200 font-medium">Mes Absences</h3>
                                  <p class="text-xs text-slate-500 dark:text-slate-400">15 prochains jours</p>
                               </div>
                            </div>
                            <span class="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-mono text-slate-600 dark:text-slate-300">{{ userNextAbsences.length }}</span>
                         </div>

                         <div class="space-y-2 flex-1 overflow-y-auto custom-scrollbar-thin">
                            <div *ngFor="let absence of userNextAbsences" 
                                 class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/item"
                                 (click)="navigateToAbsenceDate(absence.startDate, $event)">
                               <div class="w-1.5 h-1.5 rounded-full"
                                    [class.bg-orange-400]="absence.type === 'ABSENCE'"
                                    [class.bg-sky-400]="absence.type === 'FORMATION'"
                                    [class.bg-rose-400]="absence.type === 'TELETRAVAIL'"></div>
                               <div class="flex-1 min-w-0">
                                  <div class="flex justify-between items-baseline">
                                     <p class="text-sm text-slate-700 dark:text-slate-300 truncate group-hover/item:text-amber-700 dark:group-hover/item:text-amber-400 transition-colors">{{ ABSENCE_LABELS[absence.type] }}</p>
                                     <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ formatDate(absence.startDate) }}</span>
                                  </div>
                                </div>
                            </div>
                            <div *ngIf="userNextAbsences.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                               <span class="material-icons text-3xl mb-2 opacity-50">beach_access</span>
                               <span class="text-xs">Aucune absence</span>
                            </div>
                         </div>
                    </ng-container>
                 </div>
              </div>
            </ng-container>

          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    /* Custom Scrollbar */
    .custom-scrollbar-thin::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar-thin::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }
    .custom-scrollbar-thin::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }

    /* Animations */
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    .perspective-1000 {
      perspective: 1000px;
    }

    /* Drag & Drop Styles */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 1rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5);
      backdrop-filter: blur(10px);
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
      background: rgba(255,255,255,0.05);
      border-radius: 1rem;
      border: 2px dashed rgba(255,255,255,0.1);
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  nextMep: Release | null = null;
  eventsNext15Days: Event[] = [];
  userNextAbsences: Absence[] = [];
  orderedWidgets: Widget[] = [];
  ABSENCE_LABELS = ABSENCE_LABELS;

  // Loading & Error states
  isLoadingEvents = false;
  isLoadingReleases = false;
  eventsError: string | null = null;
  releasesError: string | null = null;

  // Animation state for new playground
  isPlaygroundNew = false;


  // Stats pour compteurs animés
  totalEvents = 0;
  activeReleases = 0;
  completionRate = 0;
  hotfixCount = 0;

  // Valeurs animées
  animatedEventsCount = 0;
  animatedReleasesCount = 0;
  animatedCompletionRate = 0;
  animatedHotfixCount = 0;

  private animationSubscription?: Subscription;

  // Default widget order
  private readonly DEFAULT_WIDGETS: Widget[] = [
    { id: 'events7days', type: 'events7days' },
    { id: 'nextMep', type: 'nextMep' },
    { id: 'userAbsences', type: 'userAbsences' }
  ];

  constructor(
    private router: Router,
    public settingsService: SettingsService,
    private eventService: EventService,
    private releaseService: ReleaseService,
    private absenceService: AbsenceService,
    private authService: AuthService,
    private onboardingService: OnboardingService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadWidgetOrder();
    this.loadStatistics();
    this.checkOnboarding();

    // Subscribe to playground unlock event (for wobble animation)
    this.authService.playgroundUnlocked$.subscribe(unlocked => {
      if (unlocked) {
        this.isPlaygroundNew = true;
        // Reset after animation (approx 7s)
        setTimeout(() => {
          this.isPlaygroundNew = false;
          // Also reset the subject to avoid re-triggering on nav back
          this.authService.playgroundUnlocked$.next(false);
        }, 7000);
      }
    });
  }


  private checkOnboarding(): void {
    this.onboardingService.loadSeenKeys().subscribe(() => {
      // Check if we should show the welcome tour (using special key TOUR_HOME or WELCOME)
      // The requirement says: OnboardingService.markAllAsSeen is called when skipped.
      // So checking WELCOME or TOUR_HOME is fine.
      if (this.onboardingService.shouldShow('TOUR_HOME')) {
        this.dialog.open(WelcomeModalComponent, {
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          panelClass: 'transparent-dialog',
          backdropClass: 'blur-backdrop',
          disableClose: true,
          autoFocus: false
        }).afterClosed().subscribe((startTour: boolean) => {
          if (startTour) {
            this.startTour();
          } else {
            this.onboardingService.skipAll();
          }
        });
      }
    });
  }

  private startTour(): void {
    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Terminer',
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      onDestroyed: () => {
        // Mark tour as seen when finished or skipped via X
        this.onboardingService.markAsSeen('TOUR_HOME');
      },
      steps: [
        {
          element: '#apps-grid',
          popover: {
            title: 'Vos Applications',
            description: 'Retrouvez ici tous vos modules : Calendrier, Absences, Releases, etc.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#widgets-grid',
          popover: {
            title: 'Vos Widgets',
            description: 'Un aperçu et accès rapide vers vos événements à venir, la prochaine MEP et vos absences. De nouveaux widgets pourront être ajoutés progressivement. Vous pouvez les ordonner, vos préférences seront sauvegardées.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#sidebar-bottom',
          popover: {
            title: 'Paramètres & Profil',
            description: 'Changez le thème ici, il sera enregistré pour être appliqué lors de votre prochaine connexion. Modifiez votre mot de passe ou déconnectez-vous ici.',
            side: 'right',
            align: 'center'
          }
        }
      ]
    });

    tourDriver.drive();
  }

  ngOnDestroy(): void {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
  }

  /**
   * Charge l'ordre des widgets depuis les préférences utilisateur
   * Filtre les widgets selon les permissions de l'utilisateur
   */
  private loadWidgetOrder(): void {
    const savedOrder = this.authService.getWidgetOrder();

    // Filtrer les widgets selon les permissions
    const availableWidgets = this.DEFAULT_WIDGETS.filter(w => this.canAccessWidget(w.type));

    if (savedOrder.length > 0) {
      // Reconstruct widgets based on saved order (filtrés par permissions)
      this.orderedWidgets = savedOrder
        .map(id => availableWidgets.find(w => w.id === id))
        .filter((w): w is Widget => w !== undefined);

      // Add any new widgets that aren't in saved order
      const missingWidgets = availableWidgets.filter(
        w => !savedOrder.includes(w.id)
      );
      this.orderedWidgets.push(...missingWidgets);
    } else {
      // Use default order (filtrés par permissions)
      this.orderedWidgets = [...availableWidgets];
    }
  }

  /**
   * Vérifie si l'utilisateur peut accéder à un widget donné
   */
  private canAccessWidget(widgetType: 'events7days' | 'nextMep' | 'userAbsences'): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || !user.permissions) {
      return false;
    }

    switch (widgetType) {
      case 'events7days':
        return user.permissions.CALENDAR === 'READ' || user.permissions.CALENDAR === 'WRITE';
      case 'nextMep':
        return user.permissions.RELEASES === 'READ' || user.permissions.RELEASES === 'WRITE';
      case 'userAbsences':
        return user.permissions.ABSENCE === 'READ' || user.permissions.ABSENCE === 'WRITE';
      default:
        return false;
    }
  }

  /**
   * Handler pour le drop event du drag & drop
   */
  async onWidgetDrop(event: CdkDragDrop<Widget[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // Réorganiser les widgets
    moveItemInArray(this.orderedWidgets, event.previousIndex, event.currentIndex);

    // Sauvegarder l'ordre
    const widgetIds = this.orderedWidgets.map(w => w.id);
    await this.authService.updateWidgetOrder(widgetIds);
  }

  /**
   * Gère les clics sur les widgets (uniquement si pas en train de drag)
   */
  handleWidgetClick(event: MouseEvent, type: string | null, release?: Release | null): void {
    // Vérifier si c'est un vrai clic (pas un drag)
    const target = event.target as HTMLElement;
    if (target.closest('.cdk-drag-preview') || target.closest('.cdk-drag-placeholder')) {
      return;
    }

    // Navigation selon le type
    if (type === 'calendar') {
      this.navigateToCalendar();
    } else if (type === 'release' && release) {
      this.navigateToRelease(release);
    } else if (type === 'absence') {
      this.navigateToAbsences();
    }
  }

  private loadStatistics(): void {
    // Subscribe to loading states
    this.eventService.loading$.subscribe(loading => {
      this.isLoadingEvents = loading;
    });

    this.releaseService.loading$.subscribe(loading => {
      this.isLoadingReleases = loading;
    });

    // Subscribe to error states
    this.eventService.error$.subscribe(error => {
      this.eventsError = error;
    });

    this.releaseService.error$.subscribe(error => {
      this.releasesError = error;
    });

    // Load events
    this.eventService.events$.subscribe(events => {
      // Events in the next 15 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fifteenDaysFromNow = new Date(today);
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      this.eventsNext15Days = events
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today && eventDate <= fifteenDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      // Calculate total events this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      this.totalEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      }).length;

      this.animateCounter('events', this.totalEvents);
    });

    // Load releases
    this.releaseService.releases$.subscribe(releases => {
      // Find next MEP (future releases only, sorted by date)
      const futureReleases = releases
        .filter(r => isFuture(new Date(r.releaseDate)))
        .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

      this.nextMep = futureReleases.length > 0 ? futureReleases[0] : null;

      // Calculate stats
      this.activeReleases = releases.filter(r =>
        r.status === 'in_progress' || isFuture(new Date(r.releaseDate))
      ).length;

      this.hotfixCount = releases.filter(r =>
        r.type === 'hotfix' && (r.status === 'in_progress' || isFuture(new Date(r.releaseDate)))
      ).length;

      // Calculate average completion rate
      const releasesWithSquads = releases.filter(r => r.squads.length > 0);
      if (releasesWithSquads.length > 0) {
        const totalCompletion = releasesWithSquads.reduce((sum, release) => {
          const completedSquads = release.squads.filter(s => s.isCompleted).length;
          const percentage = release.squads.length > 0
            ? (completedSquads / release.squads.length) * 100
            : 0;
          return sum + percentage;
        }, 0);
        this.completionRate = Math.round(totalCompletion / releasesWithSquads.length);
      } else {
        this.completionRate = 0;
      }

      // Animate counters
      this.animateCounter('releases', this.activeReleases);
      this.animateCounter('completion', this.completionRate);
      this.animateCounter('hotfix', this.hotfixCount);
      this.animateCounter('hotfix', this.hotfixCount);
    });

    // Load absences - Only if user has permission
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.permissions &&
        (currentUser.permissions.ABSENCE === 'READ' || currentUser.permissions.ABSENCE === 'WRITE')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fifteenDaysFromNow = new Date(today);
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      const startStr = format(today, 'yyyy-MM-dd');
      const endStr = format(fifteenDaysFromNow, 'yyyy-MM-dd');

      this.absenceService.getAbsences(startStr, endStr).subscribe(absences => {
        this.userNextAbsences = absences
          .filter(a => a.userId === currentUser.id)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      });
    }
  }

  private animateCounter(type: 'events' | 'releases' | 'completion' | 'hotfix', target: number): void {
    const duration = 1000; // 1 seconde
    const steps = 30;
    const increment = target / steps;
    let current = 0;

    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }

    this.animationSubscription = interval(duration / steps).subscribe(() => {
      current += increment;
      if (current >= target) {
        current = target;
        switch (type) {
          case 'events':
            this.animatedEventsCount = Math.round(current);
            break;
          case 'releases':
            this.animatedReleasesCount = Math.round(current);
            break;
          case 'completion':
            this.animatedCompletionRate = Math.round(current);
            break;
          case 'hotfix':
            this.animatedHotfixCount = Math.round(current);
            break;
        }
        this.animationSubscription?.unsubscribe();
      } else {
        switch (type) {
          case 'events':
            this.animatedEventsCount = Math.round(current);
            break;
          case 'releases':
            this.animatedReleasesCount = Math.round(current);
            break;
          case 'completion':
            this.animatedCompletionRate = Math.round(current);
            break;
          case 'hotfix':
            this.animatedHotfixCount = Math.round(current);
            break;
        }
      }
    });
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  }

  getDaysUntilMep(dateString: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mepDate = new Date(dateString);
    mepDate.setHours(0, 0, 0, 0);
    return differenceInDays(mepDate, today);
  }

  async retryLoadData(): Promise<void> {
    if (this.eventsError) {
      await this.eventService.refreshEvents();
    }
    if (this.releasesError) {
      await this.releaseService.refreshReleases();
    }
  }

  navigateToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  navigateToEvent(event: Event, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.router.navigate(['/calendar'], { queryParams: { eventId: event.id } });
  }

  navigateToReleases(): void {
    this.router.navigate(['/releases']);
  }

  navigateToRelease(release: Release): void {
    // Utiliser l'ID pour l'URL
    const routeParam = release.id;
    this.router.navigate(['/releases', routeParam, 'preparation']);
  }

  navigateToAbsences(): void {
    this.router.navigate(['/absences']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navigateToPlayground(): void {
    this.router.navigate(['/playground']);
  }

  canAccess(module: PermissionModule): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || !user.permissions) {
      return false;
    }

    const permission = user.permissions[module];
    return permission === 'READ' || permission === 'WRITE';
  }

  navigateToAbsenceDate(dateStr: string, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/absences'], { queryParams: { date: dateStr } });
  }


}
