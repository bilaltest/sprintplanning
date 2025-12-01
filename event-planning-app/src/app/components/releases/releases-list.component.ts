import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReleaseService } from '@services/release.service';
import { Release, STATUS_LABELS, STATUS_COLORS } from '@models/release.model';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-releases-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="material-icons text-3xl text-primary-600 dark:text-primary-400">rocket_launch</span>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Préparation de MEP</h1>
        </div>
        <button
          (click)="showCreateModal = true"
          class="btn btn-primary flex items-center space-x-2"
        >
          <span class="material-icons">add</span>
          <span>Nouvelle Release</span>
        </button>
      </div>

      <!-- Releases Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="(releases$ | async) as releases">
        <div
          *ngFor="let release of releases"
          class="card p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
          (click)="viewRelease(release.id!, release.version)"
        >
          <!-- Delete Button -->
          <button
            (click)="deleteRelease($event, release)"
            class="absolute top-4 right-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer la release"
          >
            <span class="material-icons text-sm">delete</span>
          </button>

          <!-- Header -->
          <div class="flex items-start justify-between mb-4 pr-8">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {{ release.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Version {{ release.version }}
              </p>
            </div>
          </div>

          <!-- Date -->
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <span class="material-icons text-sm">calendar_today</span>
            <span>{{ formatDate(release.releaseDate) }}</span>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2" *ngIf="release.description">
            {{ release.description }}
          </p>

          <!-- Squads Summary -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-1">
                <span class="material-icons text-sm text-gray-500">groups</span>
                <span class="text-gray-600 dark:text-gray-300">{{ release.squads.length }} squads</span>
              </div>
              <div class="flex items-center space-x-1">
                <span class="material-icons text-sm text-gray-500">task</span>
                <span class="text-gray-600 dark:text-gray-300">{{ getTotalActions(release) }} actions</span>
              </div>
            </div>

            <!-- Export Button -->
            <div class="relative" (click)="$event.stopPropagation()">
              <button
                (click)="toggleExportMenu(release.id!)"
                class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Exporter la release"
              >
                <span class="material-icons text-sm">download</span>
                <span>Export</span>
              </button>

              <!-- Export Dropdown -->
              <div
                *ngIf="exportMenuOpen === release.id"
                class="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <button
                  (click)="exportRelease(release, 'markdown')"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex items-center space-x-2"
                >
                  <span class="material-icons text-sm">description</span>
                  <span>Markdown</span>
                </button>
                <button
                  (click)="exportRelease(release, 'html')"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors flex items-center space-x-2"
                >
                  <span class="material-icons text-sm">code</span>
                  <span>HTML</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          *ngIf="releases.length === 0"
          class="col-span-full flex flex-col items-center justify-center py-12 text-center"
        >
          <span class="material-icons text-6xl text-gray-400 dark:text-gray-600 mb-4">rocket_launch</span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune release
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Commencez par créer votre première release pour organiser votre MEP
          </p>
          <button
            (click)="showCreateModal = true"
            class="btn btn-primary"
          >
            Créer une release
          </button>
        </div>
      </div>

      <!-- Create Modal -->
      <div
        *ngIf="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="showCreateModal = false"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Nouvelle Release
          </h2>

          <form (submit)="createRelease($event)" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la release
              </label>
              <input
                type="text"
                [(ngModel)]="newRelease.name"
                name="name"
                required
                class="input"
                placeholder="Ex: Release v40.5 - Sprint 2024.12"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Version
              </label>
              <input
                type="text"
                [(ngModel)]="newRelease.version"
                name="version"
                required
                class="input"
                placeholder="Ex: 40.5"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de MEP
              </label>
              <input
                type="date"
                [(ngModel)]="newRelease.releaseDate"
                name="releaseDate"
                required
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optionnel)
              </label>
              <textarea
                [(ngModel)]="newRelease.description"
                name="description"
                rows="3"
                class="input"
                placeholder="Description de la release..."
              ></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="btn btn-primary flex-1"
                [disabled]="isCreating"
              >
                {{ isCreating ? 'Création...' : 'Créer' }}
              </button>
              <button
                type="button"
                (click)="showCreateModal = false"
                class="btn btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
          </form>
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
export class ReleasesListComponent implements OnInit {
  releases$ = this.releaseService.releases$;

  showCreateModal = false;
  isCreating = false;
  exportMenuOpen: string | null = null;

  newRelease = {
    name: '',
    version: '',
    releaseDate: '',
    description: ''
  };

  STATUS_LABELS = STATUS_LABELS;
  STATUS_COLORS = STATUS_COLORS;

  constructor(
    private releaseService: ReleaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.releaseService.loadReleases();
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  getTotalActions(release: Release): number {
    return release.squads.reduce((total, squad) => total + squad.actions.length, 0);
  }

  viewRelease(id: string, version?: string): void {
    // Utiliser la version pour l'URL si disponible, sinon utiliser l'ID
    const routeParam = version || id;
    this.router.navigate(['/releases', routeParam]);
  }

  async createRelease(event: Event): Promise<void> {
    event.preventDefault();

    if (this.isCreating) return;

    try {
      this.isCreating = true;
      const release = await this.releaseService.createRelease(this.newRelease);

      // Reset form
      this.newRelease = {
        name: '',
        version: '',
        releaseDate: '',
        description: ''
      };

      this.showCreateModal = false;

      // Navigate to the new release
      this.router.navigate(['/releases', release.id]);
    } catch (error) {
      console.error('Error creating release:', error);
      alert('Erreur lors de la création de la release');
    } finally {
      this.isCreating = false;
    }
  }

  async deleteRelease(event: Event, release: Release): Promise<void> {
    event.stopPropagation(); // Empêcher la navigation vers le détail

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la release "${release.name}" ?\n\nCette action est irréversible et supprimera toutes les squads, features et actions associées.`);

    if (!confirmed) return;

    try {
      await this.releaseService.deleteRelease(release.id!);
    } catch (error) {
      console.error('Error deleting release:', error);
      alert('Erreur lors de la suppression de la release');
    }
  }

  toggleExportMenu(releaseId: string): void {
    this.exportMenuOpen = this.exportMenuOpen === releaseId ? null : releaseId;
  }

  exportRelease(release: Release, format: 'markdown' | 'html'): void {
    this.exportMenuOpen = null;

    let content = '';
    const fileName = `${release.name.replace(/\s+/g, '_')}_v${release.version}`;

    if (format === 'markdown') {
      content = this.generateMarkdown(release);
      this.downloadFile(content, `${fileName}.md`, 'text/markdown');
    } else {
      content = this.generateHTML(release);
      this.downloadFile(content, `${fileName}.html`, 'text/html');
    }
  }

  private generateMarkdown(release: Release): string {
    let md = `# ${release.name}\n\n`;
    md += `**Version:** ${release.version}  \n`;
    md += `**Date de MEP:** ${this.formatDate(release.releaseDate)}  \n\n`;

    if (release.description) {
      md += `## Description\n\n${release.description}\n\n`;
    }

    md += `## Squads\n\n`;

    release.squads.forEach(squad => {
      const completionStatus = squad.isCompleted ? '✅' : '⏳';
      md += `### ${completionStatus} Squad ${squad.squadNumber}`;
      if (squad.tontonMep) {
        md += ` - Tonton MEP: ${squad.tontonMep}`;
      }
      md += '\n\n';

      // Features
      if (squad.features.length > 0) {
        md += `#### Fonctionnalités majeures\n\n`;
        squad.features.forEach(feature => {
          md += `- **${feature.title}**`;
          if (feature.description) {
            md += `: ${feature.description}`;
          }
          md += '\n';
        });
        md += '\n';
      }

      // Actions Pre-MEP
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        md += `#### Actions Pre-MEP\n\n`;
        preMepActions.forEach(action => {
          md += this.formatActionMarkdown(action);
        });
        md += '\n';
      }

      // Actions Post-MEP
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        md += `#### Actions Post-MEP\n\n`;
        postMepActions.forEach(action => {
          md += this.formatActionMarkdown(action);
        });
        md += '\n';
      }
    });

    return md;
  }

  private generateHTML(release: Release): string {
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${release.name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    h2 { color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
    h3 { color: #059669; }
    h4 { color: #7c3aed; }
    .meta { color: #6b7280; margin-bottom: 20px; }
    .squad { margin-bottom: 30px; padding: 15px; background: #f9fafb; border-left: 4px solid #2563eb; }
    .squad.completed { border-left-color: #059669; background: #f0fdf4; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>${release.name}</h1>
  <div class="meta">
    <strong>Version:</strong> ${release.version}<br>
    <strong>Date de MEP:</strong> ${this.formatDate(release.releaseDate)}
  </div>`;

    if (release.description) {
      html += `<h2>Description</h2><p>${release.description}</p>`;
    }

    html += `<h2>Squads</h2>`;

    release.squads.forEach(squad => {
      const completionClass = squad.isCompleted ? 'completed' : '';
      const completionEmoji = squad.isCompleted ? '✅' : '⏳';
      html += `<div class="squad ${completionClass}">`;
      html += `<h3>${completionEmoji} Squad ${squad.squadNumber}`;
      if (squad.tontonMep) {
        html += ` - Tonton MEP: ${squad.tontonMep}`;
      }
      html += '</h3>';

      // Features
      if (squad.features.length > 0) {
        html += `<h4>Fonctionnalités majeures</h4><ul>`;
        squad.features.forEach(feature => {
          html += `<li><strong>${feature.title}</strong>`;
          if (feature.description) {
            html += `: ${feature.description}`;
          }
          html += '</li>';
        });
        html += '</ul>';
      }

      // Actions Pre-MEP
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        html += `<h4>Actions Pre-MEP</h4>`;
        preMepActions.forEach(action => {
          html += this.formatActionHTML(action);
        });
      }

      // Actions Post-MEP
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        html += `<h4>Actions Post-MEP</h4>`;
        postMepActions.forEach(action => {
          html += this.formatActionHTML(action);
        });
      }

      html += '</div>';
    });

    html += '</body></html>';
    return html;
  }

  private formatActionMarkdown(action: any): string {
    let md = `##### ${action.title}\n\n`;

    if (action.description) {
      md += `${action.description}\n\n`;
    }

    // Détails de l'action de type Feature/Memory Flipping
    if (action.flipping) {
      const flip = action.flipping;
      md += `**Type:** ${flip.flippingType === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping'}  \n`;
      md += `**Nom de la règle:** \`${flip.ruleName}\`  \n`;
      md += `**Action:** ${this.getRuleActionLabel(flip.ruleAction)}  \n`;

      // Périmètres
      md += `\n**Périmètres :**  \n`;

      // Clients
      const clients = Array.isArray(flip.targetClients) ? flip.targetClients : JSON.parse(flip.targetClients || '[]');
      if (clients.includes('all') || clients.length === 0) {
        md += `- **Clients:** ALL  \n`;
      } else {
        md += `- **Clients:** ${clients.join(', ')}  \n`;
      }

      // Caisses
      if (flip.targetCaisses) {
        md += `- **Caisses:** ${flip.targetCaisses}  \n`;
      } else {
        md += `- **Caisses:** ALL  \n`;
      }

      // OS
      const os = Array.isArray(flip.targetOS) ? flip.targetOS : JSON.parse(flip.targetOS || '[]');
      if (os.length === 0 || (os.includes('ios') && os.includes('android'))) {
        md += `- **OS:** ALL  \n`;
      } else {
        md += `- **OS:** ${os.join(', ').toUpperCase()}  \n`;
      }

      // Versions
      const versions = Array.isArray(flip.targetVersions) ? flip.targetVersions : JSON.parse(flip.targetVersions || '[]');
      if (versions.length === 0) {
        md += `- **Versions:** ALL  \n`;
      } else {
        const versionStr = versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
        md += `- **Versions:** ${versionStr}  \n`;
      }
    }

    md += '\n';
    return md;
  }

  private formatActionHTML(action: any): string {
    let html = `<div style="margin-bottom: 15px; padding: 10px; background: #f9fafb; border-left: 3px solid #7c3aed;">`;
    html += `<h5 style="margin: 0 0 10px 0; color: #7c3aed;">${action.title}</h5>`;

    if (action.description) {
      html += `<p style="margin-bottom: 10px;">${action.description}</p>`;
    }

    // Détails de l'action de type Feature/Memory Flipping
    if (action.flipping) {
      const flip = action.flipping;
      html += `<p><strong>Type:</strong> ${flip.flippingType === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping'}</p>`;
      html += `<p><strong>Nom de la règle:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${flip.ruleName}</code></p>`;
      html += `<p><strong>Action:</strong> ${this.getRuleActionLabel(flip.ruleAction)}</p>`;

      // Périmètres
      html += `<p style="margin-top: 10px;"><strong>Périmètres :</strong></p>`;
      html += `<ul style="margin-top: 5px;">`;

      // Clients
      const clients = Array.isArray(flip.targetClients) ? flip.targetClients : JSON.parse(flip.targetClients || '[]');
      if (clients.includes('all') || clients.length === 0) {
        html += `<li><strong>Clients:</strong> ALL</li>`;
      } else {
        html += `<li><strong>Clients:</strong> ${clients.join(', ')}</li>`;
      }

      // Caisses
      if (flip.targetCaisses) {
        html += `<li><strong>Caisses:</strong> ${flip.targetCaisses}</li>`;
      } else {
        html += `<li><strong>Caisses:</strong> ALL</li>`;
      }

      // OS
      const os = Array.isArray(flip.targetOS) ? flip.targetOS : JSON.parse(flip.targetOS || '[]');
      if (os.length === 0 || (os.includes('ios') && os.includes('android'))) {
        html += `<li><strong>OS:</strong> ALL</li>`;
      } else {
        html += `<li><strong>OS:</strong> ${os.join(', ').toUpperCase()}</li>`;
      }

      // Versions
      const versions = Array.isArray(flip.targetVersions) ? flip.targetVersions : JSON.parse(flip.targetVersions || '[]');
      if (versions.length === 0) {
        html += `<li><strong>Versions:</strong> ALL</li>`;
      } else {
        const versionStr = versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
        html += `<li><strong>Versions:</strong> ${versionStr}</li>`;
      }

      html += `</ul>`;
    }

    html += `</div>`;
    return html;
  }

  private getRuleActionLabel(action: string): string {
    const labels: any = {
      'create_rule': 'Créer la règle FF/MF',
      'obsolete_rule': 'Obsolescence de la règle FF/MF',
      'disable_rule': 'Désactiver la règle FF/MF',
      'enable_rule': 'Activer la règle FF/MF'
    };
    return labels[action] || action;
  }

  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
