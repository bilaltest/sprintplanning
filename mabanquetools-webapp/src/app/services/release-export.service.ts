import { Injectable } from '@angular/core';
import { Action, Release, Squad } from '@models/release.model';
import { FeatureFlippingHelper } from '../helpers/feature-flipping.helper';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GroupedActions {
    memory_flipping: Action[];
    feature_flipping: Action[];
    other: Action[];
}

@Injectable({
    providedIn: 'root'
})
export class ReleaseExportService {

    exportRelease(release: Release, formatType: 'markdown' | 'html'): void {
        let content = '';
        const fileName = `${release.name.replace(/\s+/g, '_')}`;

        if (formatType === 'markdown') {
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

        // 1. Tontons MEP Table
        md += `## Tontons MEP\n\n`;
        const tontonHeaders = ['Squad', 'Tonton MEP', 'Statut'];
        const tontonRows = release.squads.map(s => [
            `Squad ${s.squadNumber}`,
            s.tontonMep || '-',
            s.isCompleted ? '✅ Validé' : '⏳ En cours'
        ]);
        md += this.generateMarkdownTable(tontonHeaders, tontonRows);
        md += '\n';

        // 2. Actions Pré-MEP
        md += `## Actions Pré-MEP\n\n`;
        const preMepActions = this.getAllActionsByPhase(release, 'pre_mep');
        if (preMepActions.length > 0) {
            md += this.generateGlobalActionsMarkdown(release, preMepActions);
        }

        if (preMepActions.length === 0) {
            md += '_Aucune action renseignée_\n\n';
        }


        // 3. Actions Post-MEP
        md += `## Actions Post-MEP\n\n`;
        const postMepActions = this.getAllActionsByPhase(release, 'post_mep');
        if (postMepActions.length > 0) {
            md += this.generateGlobalActionsMarkdown(release, postMepActions);
        }

        if (postMepActions.length === 0) {
            md += '_Aucune action renseignée_\n\n';
        }

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
    .empty-section { font-style: italic; color: #6b7280; margin-top: 0.5rem; margin-bottom: 1rem; }
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

        // 1. Tontons MEP Table
        html += `<h2>Tontons MEP</h2>`;
        const tontonHeaders = ['Squad', 'Tonton MEP', 'Statut'];
        const tontonRows = release.squads.map(s => [
            `Squad ${s.squadNumber}`,
            s.tontonMep || '-',
            s.isCompleted ? '✅ Validé' : '⏳ En cours'
        ]);
        html += this.generateHTMLTable(tontonHeaders, tontonRows);

        // 2. Actions Pré-MEP
        html += `<h2>Actions Pré-MEP</h2>`;
        const preMepActions = this.getAllActionsByPhase(release, 'pre_mep');
        if (preMepActions.length > 0) {
            html += this.generateGlobalActionsHTML(release, preMepActions);
        }

        if (preMepActions.length === 0) {
            html += `<p class="empty-section">Aucune action renseignée</p>`;
        }

        // 3. Actions Post-MEP
        html += `<h2>Actions Post-MEP</h2>`;
        const postMepActions = this.getAllActionsByPhase(release, 'post_mep');
        if (postMepActions.length > 0) {
            html += this.generateGlobalActionsHTML(release, postMepActions);
        }

        if (postMepActions.length === 0) {
            html += `<p class="empty-section">Aucune action renseignée</p>`;
        }

        html += '</body></html>';
        return html;
    }

    private generateGlobalActionsMarkdown(release: Release, actions: Action[]): string {
        let md = '';
        const grouped = this.groupActionsByType(actions);

        // Memory Flipping
        if (grouped.memory_flipping.length > 0) {
            md += `#### Memory Flipping\n\n`;
            const headers = ['Squad', 'Nom du MF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
            const rows = grouped.memory_flipping.map(a => [
                `S${this.getSquadNumber(release, a.squadId)}`,
                a.flipping?.ruleName || '',
                a.description || '',
                a.flipping?.theme || '',
                FeatureFlippingHelper.getRuleActionLabel(a.flipping?.ruleAction || ''),
                FeatureFlippingHelper.getFlippingClientsDisplay(a.flipping?.targetClients || []),
                FeatureFlippingHelper.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
                FeatureFlippingHelper.getFlippingOSDisplay(a.flipping?.targetOS || []),
                FeatureFlippingHelper.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
            ]);
            md += this.generateMarkdownTable(headers, rows);
            md += '\n';
        }

        // Feature Flipping
        if (grouped.feature_flipping.length > 0) {
            md += `#### Feature Flipping\n\n`;
            const headers = ['Squad', 'Nom du FF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
            const rows = grouped.feature_flipping.map(a => [
                `S${this.getSquadNumber(release, a.squadId)}`,
                a.flipping?.ruleName || '',
                a.description || '',
                a.flipping?.theme || '',
                FeatureFlippingHelper.getRuleActionLabel(a.flipping?.ruleAction || ''),
                FeatureFlippingHelper.getFlippingClientsDisplay(a.flipping?.targetClients || []),
                FeatureFlippingHelper.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
                FeatureFlippingHelper.getFlippingOSDisplay(a.flipping?.targetOS || []),
                FeatureFlippingHelper.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
            ]);
            md += this.generateMarkdownTable(headers, rows);
            md += '\n';
        }

        // Other Actions
        if (grouped.other.length > 0) {
            md += `#### Autres Actions\n\n`;
            const headers = ['Squad', 'Description'];
            const rows = grouped.other.map(a => [
                `S${this.getSquadNumber(release, a.squadId)}`,
                a.description
            ]);
            md += this.generateMarkdownTable(headers, rows);
            md += '\n';
        }

        return md;
    }

    private generateGlobalActionsHTML(release: Release, actions: Action[]): string {
        let html = '';
        const grouped = this.groupActionsByType(actions);

        // Memory Flipping
        if (grouped.memory_flipping.length > 0) {
            html += `<h4>Memory Flipping</h4>`;
            const headers = ['Squad', 'Nom du MF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
            const rows = grouped.memory_flipping.map(a => [
                `S${this.getSquadNumber(release, a.squadId)}`,
                a.flipping?.ruleName || '',
                a.description || '',
                a.flipping?.theme || '',
                FeatureFlippingHelper.getRuleActionLabel(a.flipping?.ruleAction || ''),
                FeatureFlippingHelper.getFlippingClientsDisplay(a.flipping?.targetClients || []),
                FeatureFlippingHelper.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
                FeatureFlippingHelper.getFlippingOSDisplay(a.flipping?.targetOS || []),
                FeatureFlippingHelper.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
            ]);
            html += this.generateHTMLTable(headers, rows);
        }

        // Feature Flipping
        if (grouped.feature_flipping.length > 0) {
            html += `<h4>Feature Flipping</h4>`;
            const headers = ['Squad', 'Nom du FF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
            const rows = grouped.feature_flipping.map(a => [
                `S${this.getSquadNumber(release, a.squadId)}`,
                a.flipping?.ruleName || '',
                a.description || '',
                a.flipping?.theme || '',
                FeatureFlippingHelper.getRuleActionLabel(a.flipping?.ruleAction || ''),
                FeatureFlippingHelper.getFlippingClientsDisplay(a.flipping?.targetClients || []),
                FeatureFlippingHelper.getFlippingCaissesDisplay(a.flipping?.targetCaisses),
                FeatureFlippingHelper.getFlippingOSDisplay(a.flipping?.targetOS || []),
                FeatureFlippingHelper.getFlippingVersionsDisplay(a.flipping?.targetVersions || [])
            ]);
            html += this.generateHTMLTable(headers, rows);
        }

        // Other Actions
        if (grouped.other.length > 0) {
            html += `<h4>Autres Actions</h4>`;
            const headers = ['Squad', 'Description'];
            const rows = grouped.other.map(a => [
                `S${this.getSquadNumber(release, a.squadId)}`,
                a.description
            ]);
            html += this.generateHTMLTable(headers, rows);
        }

        return html;
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


    private groupActionsByType(actions: Action[]): GroupedActions {
        const grouped: GroupedActions = {
            memory_flipping: [],
            feature_flipping: [],
            other: []
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

    private getAllActionsByPhase(release: Release, phase: 'pre_mep' | 'post_mep'): Action[] {
        if (!release) return [];
        const allActions: Action[] = [];
        release.squads.forEach(squad => {
            const squadActions = squad.actions.filter(a => a.phase === phase);
            allActions.push(...squadActions);
        });
        return allActions;
    }

    private getSquadNumber(release: Release, squadId: string): string {
        const squad = release.squads.find(s => s.id === squadId);
        return squad ? squad.squadNumber.toString() : '?';
    }

    private formatDate(dateStr: string): string {
        if (!dateStr) return '';
        return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr });
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
