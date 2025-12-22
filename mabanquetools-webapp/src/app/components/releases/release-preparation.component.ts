import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReleaseService } from '@services/release.service';

import { CanAccessDirective } from '@directives/can-access.directive';
import {
  Release,
  Squad,
  Feature,
  Action,
  STATUS_LABELS,
  STATUS_COLORS,
  ACTION_TYPE_LABELS,
  ACTION_PHASE_LABELS,
  ActionType,
  ActionPhase,
  CreateFeatureDto,
  CreateActionDto,
  FLIPPING_TYPE_LABELS,
  RULE_ACTION_LABELS,
  RULE_STATE_LABELS,
  FlippingType,
  RuleAction,
  RuleState,
  OSType,
  VersionOperator,

} from '@models/release.model';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReleaseExportService } from '@services/release-export.service';
import { FeatureFlippingHelper } from '../../helpers/feature-flipping.helper';
import { ReleaseTontonsComponent } from './release-tontons/release-tontons.component';
import { ReleaseActionsComponent } from './release-actions/release-actions.component';


@Component({
  selector: 'app-release-preparation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CanAccessDirective, ReleaseTontonsComponent, ReleaseActionsComponent],
  template: `
    <div class="max-w-7xl mx-auto space-y-6" *ngIf="release">
      <!-- Header avec gradient -->
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-950 rounded-2xl shadow-xl p-8">
        <!-- Decorative background pattern -->
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
              <h1 class="text-4xl font-bold text-white mb-3 tracking-tight">{{ release.name }}</h1>
              <div class="flex items-center space-x-4 text-white/90">
                <div class="flex items-center space-x-2">
                  <span class="material-icons text-xl">event</span>
                  <span class="text-lg font-medium">{{ formatDate(release.releaseDate) }}</span>
                </div>
                <div class="w-px h-6 bg-white/30"></div>
                <div class="flex items-center space-x-2">
                  <span class="material-icons text-xl">groups</span>
                  <span class="text-lg">{{ release.squads.length }} Squad{{ release.squads.length > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>

            <div class="hidden lg:flex items-center space-x-4">
              <!-- Link to Release Note -->
              <a
                [routerLink]="['/releases', release.id, 'release-note']"
                class="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:shadow-lg"
              >
                <span class="material-icons">description</span>
                <span class="font-medium">Voir Release Note</span>
              </a>

              <!-- Export Button -->
              <div class="relative">
                <button
                  appCanAccess="RELEASES"
                  accessLevel="read"
                  (click)="toggleExportMenu()"
                  class="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:shadow-lg"
                >
                  <span class="material-icons">download</span>
                  <span class="font-medium">Exporter</span>
                </button>

                <!-- Export Dropdown -->
                <div
                  *ngIf="exportMenuOpen"
                  class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50"
                >
                  <button
                    (click)="exportRelease('markdown')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex items-center space-x-2"
                  >
                    <span class="material-icons text-sm">description</span>
                    <span>Markdown</span>
                  </button>
                  <button
                    (click)="exportRelease('html')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors flex items-center space-x-2"
                  >
                    <span class="material-icons text-sm">code</span>
                    <span>HTML</span>
                  </button>
                </div>
              </div>


            </div>
          </div>

          <p class="text-white/90 mt-4 text-lg leading-relaxed max-w-3xl" *ngIf="release.description">
            {{ release.description }}
          </p>
        </div>
      </div>

      <!-- New Layout: Sections -->
      <div class="space-y-6">

        <!-- 1. Tontons MEP Table -->
        <app-release-tontons
            [release]="release"
            [isExpanded]="expandedSections.has('tontons')"
            (toggleExpand)="toggleSection('tontons')"
            (releaseUpdated)="loadRelease()">
        </app-release-tontons>

        <!-- 2. Actions Pré-MEP -->
        <app-release-actions
            [release]="release"
            phase="pre_mep"
            [isExpanded]="expandedSections.has('pre_mep')"
            (toggleExpand)="toggleSection('pre_mep')"
            (releaseUpdated)="loadRelease()">
        </app-release-actions>

        <!-- 3. Actions Post-MEP -->
        <app-release-actions
            [release]="release"
            phase="post_mep"
            [isExpanded]="expandedSections.has('post_mep')"
            (toggleExpand)="toggleSection('post_mep')"
            (releaseUpdated)="loadRelease()">
        </app-release-actions>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Custom CSS Tooltip */
    [data-tooltip] {
      position: relative;
    }
    
    [data-tooltip]:before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 6px 10px;
      background-color: #1f2937; /* gray-800 */
      color: white;
      border-radius: 4px;
      font-size: 12px;
      white-space: normal;
      max-width: 250px;
      text-align: center;
      line-height: 1.4;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease-in-out;
      pointer-events: none;
      z-index: 50;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-bottom: 8px;
    }
    
    [data-tooltip]:after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px;
      border-style: solid;
      border-color: #1f2937 transparent transparent transparent;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease-in-out;
      margin-bottom: -4px; /* Overlap slightly */
      z-index: 50;
    }
    
    [data-tooltip]:hover:before,
    [data-tooltip]:hover:after {
      opacity: 1;
      visibility: visible;
    }
  `]

})
export class ReleasePreparationComponent implements OnInit {
  release: Release | null = null;
  expandedSections = new Set<string>(['tontons', 'pre_mep', 'post_mep']);
  exportMenuOpen = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private releaseService: ReleaseService,
    private releaseExportService: ReleaseExportService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadRelease();
    if (!this.release) {
      this.router.navigate(['/releases']);
    }
  }

  async loadRelease(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        this.release = await this.releaseService.getRelease(id);
        if (this.release && this.release.squads) {
          this.release.squads.sort((a, b) => a.squadNumber - b.squadNumber);
        }
      } catch (error) {
        console.error('Error loading release:', error);
      }
    }
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  goBack(): void {
    this.router.navigate(['/releases']);
  }

  toggleSection(section: string): void {
    if (this.expandedSections.has(section)) {
      this.expandedSections.delete(section);
    } else {
      this.expandedSections.add(section);
    }
  }







  // Export methods
  toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  exportRelease(format: 'markdown' | 'html'): void {
    if (!this.release) return;
    this.exportMenuOpen = false;
    this.releaseExportService.exportRelease(this.release, format);
  }
}
