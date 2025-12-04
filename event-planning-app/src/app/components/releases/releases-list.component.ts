import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import {
  Release,
  STATUS_LABELS,
  STATUS_COLORS,
  Action,
  ActionType,
  Feature,
  FlippingType,
  FeatureFlipping,
  VersionCondition
} from '@models/release.model';
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
          <span class="material-icons text-4xl text-releases-500 dark:text-releases-400">rocket_launch</span>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Préparation de MEP</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérez vos releases et leurs déploiements</p>
          </div>
        </div>
        <button
          (click)="showCreateModal = true"
          class="btn btn-primary flex items-center space-x-2 px-6 py-3"
        >
          <span class="material-icons text-xl">add_circle</span>
          <span class="text-base">Nouvelle Release</span>
        </button>
      </div>

      <!-- Releases Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="(releases$ | async) as releases">
        <div
          *ngFor="let release of releases"
          class="card-releases p-6 cursor-pointer relative group"
          (click)="viewRelease(release.id!, release.version)"
        >
          <!-- Delete Button -->
          <button
            (click)="deleteRelease($event, release)"
            class="absolute top-4 right-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            title="Supprimer la release"
          >
            <span class="material-icons text-lg">delete</span>
          </button>

          <!-- Header -->
          <div class="flex items-start justify-between mb-4 pr-8">
            <div class="flex-1">
              <h3 class="text-xl font-bold text-releases-700 dark:text-releases-300 mb-1">
                {{ release.name }}
              </h3>
            </div>
          </div>

          <!-- Date -->
          <div class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
            <span class="material-icons text-sm text-gray-500 dark:text-gray-400">event</span>
            <span class="font-medium">{{ formatDate(release.releaseDate) }}</span>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2" *ngIf="release.description">
            {{ release.description }}
          </p>

          <!-- Squads Summary -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 text-sm">
              <span class="material-icons text-lg text-gray-500 dark:text-gray-400">groups</span>
              <span class="text-gray-700 dark:text-gray-300 font-semibold">{{ release.squads.length }} squads</span>
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
    private router: Router,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

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

      // Show success toast
      this.toastService.success(
        'Release créée',
        `${release.name} v${release.version} a été créée avec succès`
      );

      // Navigate to the new release
      this.router.navigate(['/releases', release.id]);
    } catch (error) {
      console.error('Error creating release:', error);
      this.toastService.error(
        'Erreur de création',
        'Impossible de créer la release. Veuillez réessayer.'
      );
    } finally {
      this.isCreating = false;
    }
  }

  async deleteRelease(event: Event, release: Release): Promise<void> {
    event.stopPropagation(); // Empêcher la navigation vers le détail

    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer la release',
      message: `Êtes-vous sûr de vouloir supprimer "${release.name}" ? Cette action est irréversible et supprimera toutes les squads, features et actions associées.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      await this.releaseService.deleteRelease(release.id!);

      this.toastService.success(
        'Release supprimée',
        `${release.name} a été supprimée définitivement`
      );
    } catch (error) {
      console.error('Error deleting release:', error);
      this.toastService.error(
        'Erreur de suppression',
        'Impossible de supprimer la release. Veuillez réessayer.'
      );
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
        const featureHeaders = ['Titre', 'Description'];
        const featureRows = squad.features.map(f => [f.title, f.description || '']);
        md += this.generateMarkdownTable(featureHeaders, featureRows);
        md += '\n';
      }

      // Actions Pre-MEP
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        md += `#### Actions Pre-MEP\n\n`;
        md += this.generateActionsMarkdown(preMepActions);
      }

      // Actions Post-MEP
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        md += `#### Actions Post-MEP\n\n`;
        md += this.generateActionsMarkdown(postMepActions);
      }
    });

    return md;
  }

  private generateActionsMarkdown(actions: Action[]): string {
    let md = '';
    const grouped = this.groupActionsByType(actions);

    // Memory Flipping
    if (grouped.memory_flipping.length > 0) {
      md += `##### Memory Flipping\n\n`;
      const headers = ['Nom du MF', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.memory_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      md += this.generateMarkdownTable(headers, rows);
      md += '\n';
    }

    // Feature Flipping
    if (grouped.feature_flipping.length > 0) {
      md += `##### Feature Flipping\n\n`;
      const headers = ['Nom du FF', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.feature_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      md += this.generateMarkdownTable(headers, rows);
      md += '\n';
    }

    // Other Actions
    if (grouped.other.length > 0) {
      md += `##### Autres Actions\n\n`;
      const headers = ['Description'];
      const rows = grouped.other.map(a => [a.description]);
      md += this.generateMarkdownTable(headers, rows);
      md += '\n';
    }

    return md;
  }

  private generateMarkdownTable(headers: string[], rows: string[][]): string {
    if (rows.length === 0) return '';

    let table = `| ${headers.join(' | ')} |\n`;
    table += `| ${headers.map(() => '---').join(' | ')} |\n`;

    rows.forEach(row => {
      const escapedRow = row.map(cell => (cell || '').replace(/\|/g, '\\|').replace(/\n/g, '<br>'));
      table += `| ${escapedRow.join(' | ')} |\n`;
    });

    return table;
  }

  private generateHTML(release: Release): string {
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${release.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; color: #1f2937; }
    h1 { color: #111827; font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-top: 2rem; }
    h3 { color: #374151; margin-top: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
    h4 { color: #4b5563; margin-top: 1.25rem; font-size: 1.1rem; }
    h5 { color: #6b7280; margin-top: 1rem; font-size: 1rem; font-weight: 600; }
    .meta { color: #6b7280; margin-bottom: 2rem; }
    .squad { margin-bottom: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
    .squad.completed { background: #f0fdf4; border-color: #bbf7d0; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; }
    th { background-color: #f3f4f6; text-align: left; padding: 0.75rem; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; }
    td { padding: 0.75rem; border: 1px solid #e5e7eb; color: #4b5563; vertical-align: top; }
    tr:nth-child(even) { background-color: #f9fafb; }
    .squad.completed tr:nth-child(even) { background-color: #f0fdf4; }
    .squad.completed th { background-color: #dcfce7; }
  </style>
</head>
<body>
  <h1>${release.name}</h1>
  <div class="meta">
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
        html += ` <span style="font-size: 0.875em; font-weight: normal; color: #6b7280;">(Tonton MEP: ${squad.tontonMep})</span>`;
      }
      html += '</h3>';

      // Features
      if (squad.features.length > 0) {
        html += `<h4>Fonctionnalités majeures</h4>`;
        const featureHeaders = ['Titre', 'Description'];
        const featureRows = squad.features.map(f => [f.title, f.description || '']);
        html += this.generateHTMLTable(featureHeaders, featureRows);
      }

      // Actions Pre-MEP
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        html += `<h4>Actions Pre-MEP</h4>`;
        html += this.generateActionsHTML(preMepActions);
      }

      // Actions Post-MEP
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        html += `<h4>Actions Post-MEP</h4>`;
        html += this.generateActionsHTML(postMepActions);
      }

      html += '</div>';
    });

    html += '</body></html>';
    return html;
  }

  private generateActionsHTML(actions: Action[]): string {
    let html = '';
    const grouped = this.groupActionsByType(actions);

    // Memory Flipping
    if (grouped.memory_flipping.length > 0) {
      html += `<h5>Memory Flipping</h5>`;
      const headers = ['Nom du MF', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.memory_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      html += this.generateHTMLTable(headers, rows);
    }

    // Feature Flipping
    if (grouped.feature_flipping.length > 0) {
      html += `<h5>Feature Flipping</h5>`;
      const headers = ['Nom du FF', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.feature_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.flipping?.theme || '',
        this.getRuleActionLabel(a.flipping?.ruleAction || ''),
        this.getFlippingClientsDisplay(a.flipping?.targetClients || []),
        this.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
        this.getFlippingOSDisplay(a.flipping?.targetOS || []),
        this.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
      ]);
      html += this.generateHTMLTable(headers, rows);
    }

    // Other Actions
    if (grouped.other.length > 0) {
      html += `<h5>Autres Actions</h5>`;
      const headers = ['Description'];
      const rows = grouped.other.map(a => [a.description]);
      html += this.generateHTMLTable(headers, rows);
    }

    return html;
  }

  private generateHTMLTable(headers: string[], rows: string[][]): string {
    if (rows.length === 0) return '';

    let html = `<table><thead><tr>`;
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += `</tr></thead><tbody>`;

    rows.forEach(row => {
      html += `<tr>`;
      row.forEach(cell => {
        html += `<td>${(cell || '').replace(/\n/g, '<br>')}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    return html;
  }

  private groupActionsByType(actions: Action[]): { memory_flipping: Action[], feature_flipping: Action[], other: Action[] } {
    const grouped = {
      memory_flipping: [] as Action[],
      feature_flipping: [] as Action[],
      other: [] as Action[]
    };

    actions.forEach(action => {
      if (action.type === 'memory_flipping') {
        grouped.memory_flipping.push(action);
      } else if (action.type === 'feature_flipping') {
        grouped.feature_flipping.push(action);
      } else {
        grouped.other.push(action);
      }
    });

    return grouped;
  }

  // Helper methods for formatting
  private getFlippingTargets(data: string | string[]): string[] {
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private getFlippingClientsDisplay(targetClients: string | string[]): string {
    const clients = this.getFlippingTargets(targetClients);
    if (clients.length === 0 || clients.includes('all')) {
      return 'ALL';
    }
    return clients.join(', ');
  }

  private getFlippingCaissesDisplay(targetCaisses?: string | null): string {
    if (!targetCaisses) {
      return 'ALL';
    }
    return targetCaisses;
  }

  private getFlippingOSDisplay(targetOS: string | string[]): string {
    const osList = this.getFlippingTargets(targetOS);
    if (osList.length === 0 || (osList.includes('ios') && osList.includes('android'))) {
      return 'ALL';
    }
    return osList.join(', ').toUpperCase();
  }

  private getFlippingVersionsDisplay(targetVersions: string | any[]): string {
    let versions: any[];
    if (Array.isArray(targetVersions)) {
      versions = targetVersions;
    } else {
      try {
        versions = JSON.parse(targetVersions);
      } catch {
        versions = [];
      }
    }

    if (versions.length === 0) {
      return 'ALL';
    }

    return versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
  }

  private getRuleActionLabel(action: string): string {
    const labels: any = {
      'create_rule': 'Créer la règle',
      'obsolete_rule': 'Rendre obsolète',
      'disable_rule': 'Désactiver',
      'enable_rule': 'Activer'
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
