import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    Release,
    Squad,
    Action,
    ActionPhase,
    ActionType,
    CreateActionDto,
    FlippingType,
    RuleAction,
    OSType,
    VersionOperator,
    ACTION_TYPE_LABELS
} from '@models/release.model';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
import { CanAccessDirective } from '@directives/can-access.directive';
import { FeatureFlippingHelper } from '../../../helpers/feature-flipping.helper';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-release-actions',
    standalone: true,
    imports: [CommonModule, FormsModule, CanAccessDirective],
    template: `
    <div class="card overflow-hidden">
      <!-- Header -->
      <div 
        class="p-4 border-b bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent flex justify-between items-center cursor-pointer hover:from-indigo-100 dark:hover:from-indigo-900/30 transition-all duration-200" 
        (click)="toggleExpanded()"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
            <span class="material-icons text-xl text-indigo-600 dark:text-indigo-400">
                {{ phase === 'pre_mep' ? 'arrow_back' : 'arrow_forward' }}
            </span>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ phase === 'pre_mep' ? 'Actions Pré-MEP' : 'Actions Post-MEP' }}
          </h2>
        </div>
        <span class="material-icons text-gray-500">
          {{ isExpanded ? 'expand_less' : 'expand_more' }}
        </span>
      </div>

      <!-- Body -->
      <div *ngIf="isExpanded" class="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
        
        <!-- Add Action Button -->
        <div class="mb-6 flex justify-end">
          <button
            appCanAccess="RELEASES"
            accessLevel="write"
            (click)="startAddingAction()"
            class="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span class="material-icons text-sm">add</span>
            <span>Ajouter une action</span>
          </button>
        </div>

        <!-- Add Action Form -->
        <div *ngIf="isAddingAction" class="mb-6 form-inline-glass">
            <form (submit)="saveAction($event)" class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <h4 class="font-medium text-gray-900 dark:text-white">
                {{ editingActionId ? "Modifier l'action" : "Nouvelle action" }}
                </h4>
                <button type="button" (click)="cancelAddAction()" class="text-gray-400 hover:text-gray-500">
                <span class="material-icons text-sm">close</span>
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Squad Selection -->
                <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Squad <span class="text-red-500">*</span></label>
                <select [(ngModel)]="newAction.squadId" name="squadId" required class="input text-sm w-full">
                    <option value="">Sélectionner une squad</option>
                    <option *ngFor="let squad of release?.squads" [value]="squad.id">Squad {{ squad.squadNumber }}</option>
                </select>
                </div>

                <!-- Type Selection -->
                <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'action <span class="text-red-500">*</span></label>
                <select [(ngModel)]="newAction.type" name="type" required class="input text-sm w-full">
                    <option value="">Sélectionner un type</option>
                    <option value="feature_flipping">{{ getActionTypeLabel('feature_flipping') }}</option>
                    <option value="memory_flipping">{{ getActionTypeLabel('memory_flipping') }}</option>
                    <option value="other">{{ getActionTypeLabel('other') }}</option>
                </select>
                </div>
            </div>

            <!-- Description -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span class="text-red-500">*</span></label>
                <textarea
                [(ngModel)]="newAction.description"
                name="description"
                placeholder="Description de l'action"
                rows="2"
                required
                class="input text-sm w-full"
                ></textarea>
            </div>

            <!-- Feature/Memory Flipping Config -->
            <div *ngIf="newAction.type === 'feature_flipping' || newAction.type === 'memory_flipping'" class="space-y-4 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <h4 class="font-medium text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                Configuration {{ newAction.type === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping' }}
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ newAction.type === 'feature_flipping' ? 'Nom du FF' : 'Nom du MF' }} <span class="text-red-500">*</span>
                    </label>
                    <input type="text" [(ngModel)]="newAction.flipping.ruleName" name="ruleName" required class="input text-sm w-full" placeholder="Ex: FEATURE_NEW_DASHBOARD" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thème <span class="text-red-500">*</span></label>
                    <input type="text" [(ngModel)]="newAction.flipping.theme" name="theme" required class="input text-sm w-full" placeholder="Ex: Authentification" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action <span class="text-red-500">*</span></label>
                    <select [(ngModel)]="newAction.flipping.ruleAction" name="ruleAction" required class="input text-sm w-full">
                    <option value="">Sélectionner</option>
                    <option value="create_rule">Créer règle ({{ newAction.type === 'feature_flipping' ? 'FF' : 'MF' }})</option>
                    <option value="obsolete_rule">Rendre obsolète ({{ newAction.type === 'feature_flipping' ? 'FF' : 'MF' }})</option>
                    <option value="disable_rule">Désactiver ({{ newAction.type === 'feature_flipping' ? 'FF' : 'MF' }})</option>
                    <option value="enable_rule">Activer ({{ newAction.type === 'feature_flipping' ? 'FF' : 'MF' }})</option>
                    </select>
                </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clients (CAELs)</label>
                    <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" [(ngModel)]="flippingTargetsAll" name="targetsAll" (change)="toggleAllClients()" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">Tous</span>
                    </label>
                    <input *ngIf="!flippingTargetsAll" type="text" [(ngModel)]="flippingClientsInput" name="clients" placeholder="Ex: 89123456789" class="input text-sm w-full" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caisses</label>
                    <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" [(ngModel)]="flippingTargetsAllCaisses" name="targetsAllCaisses" (change)="toggleAllCaisses()" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">Toutes</span>
                    </label>
                    <input *ngIf="!flippingTargetsAllCaisses" type="text" [(ngModel)]="flippingCaissesInput" name="caisses" placeholder="Ex: Caisse 1" class="input text-sm w-full" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OS ciblés</label>
                    <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" value="ios" [(ngModel)]="flippingOSiOS" name="osIOS" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">iOS</span>
                    </label>
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" value="android" [(ngModel)]="flippingOSAndroid" name="osAndroid" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">Android</span>
                    </label>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versions</label>
                    <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" [(ngModel)]="flippingTargetsAllVersions" name="targetsAllVersions" (change)="toggleAllVersions()" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">Toutes</span>
                    </label>
                    <input *ngIf="!flippingTargetsAllVersions" type="text" [(ngModel)]="flippingVersionsInput" name="versions" placeholder="Ex: >= 38.5" class="input text-sm w-full" />
                    </div>
                </div>
                </div>
            </div>

            <div class="flex space-x-3 pt-2">
                <button appCanAccess="RELEASES" accessLevel="write" type="submit" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium">Enregistrer</button>
                <button type="button" (click)="cancelAddAction()" class="btn btn-secondary btn-sm px-4">Annuler</button>
            </div>
            </form>
        </div>

        <!-- Global Actions List (Three sections: Standard, FF, MF) -->
        <div class="space-y-8">
            
            <!-- Standard Actions -->
            <div *ngIf="getNonFlippingActions().length > 0">
            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide flex items-center">
                <span class="material-icons text-base mr-2">description</span>
                Actions Standard
            </h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 w-32">Squad</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Description</th>
                    <th class="px-4 py-3 w-24"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                    <tr *ngFor="let action of getNonFlippingActions()" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                            <span class="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                Squad {{ getSquadNumber(action.squadId) }}
                            </span>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{{ action.description }}</td>
                    <td class="px-4 py-3 text-right">
                            <button (click)="startAddingAction(action)" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"><span class="material-icons text-sm">edit</span></button>
                            <button (click)="deleteAction(action.squadId!, action.id!)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><span class="material-icons text-sm">delete</span></button>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>

            <!-- Feature Flipping -->
            <div *ngIf="getFeatureFlippingActions().length > 0">
            <h4 class="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3 uppercase tracking-wide flex items-center">
                <span class="material-icons text-base mr-2">toggle_on</span>
                Feature Flipping
            </h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                <table class="min-w-full text-xs">
                <thead class="bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 w-24">Squad</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nom du FF</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Thème</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Action</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Clients</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Caisses</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">OS</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Versions</th>
                    <th class="px-4 py-3 w-20"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                    <tr *ngFor="let action of getFeatureFlippingActions()" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="px-4 py-3">
                        <span class="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                            S{{ getSquadNumber(action.squadId) }}
                        </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{{ action.flipping?.ruleName }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ action.flipping?.theme }}</td>
                    <td class="px-4 py-3">
                            <span class="px-2 py-0.5 text-xs font-medium rounded"
                                [class.bg-green-100]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.text-green-800]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.dark:bg-green-900]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.dark:text-green-200]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.bg-red-100]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'"
                                [class.text-red-800]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'"
                                [class.dark:bg-red-900]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'"
                                [class.dark:text-red-200]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'">
                            {{ getRuleActionLabel(action.flipping?.ruleAction || '') }}
                            </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title="{{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}">
                        {{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ getFlippingCaissesDisplay(action.flipping?.targetCaisses) }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ getFlippingOSDisplay(action.flipping?.targetOS || []) }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ getFlippingVersionsDisplay(action.flipping?.targetVersions || []) }}</td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end space-x-2">
                            <button (click)="startAddingAction(action)" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"><span class="material-icons text-sm">edit</span></button>
                            <button (click)="deleteAction(action.squadId!, action.id!)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><span class="material-icons text-sm">delete</span></button>
                        </div>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>

            <!-- Memory Flipping -->
            <div *ngIf="getMemoryFlippingActions().length > 0">
            <h4 class="text-sm font-bold text-purple-700 dark:text-purple-300 mb-3 uppercase tracking-wide flex items-center">
                <span class="material-icons text-base mr-2">memory</span>
                Memory Flipping
            </h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                <table class="min-w-full text-xs">
                <thead class="bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 w-24">Squad</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nom du MF</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Thème</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Action</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Clients</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Caisses</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">OS</th>
                    <th class="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Versions</th>
                    <th class="px-4 py-3 w-20"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                    <tr *ngFor="let action of getMemoryFlippingActions()" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td class="px-4 py-3">
                        <span class="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-semibold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            S{{ getSquadNumber(action.squadId) }}
                        </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">{{ action.flipping?.ruleName }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ action.flipping?.theme }}</td>
                    <td class="px-4 py-3">
                            <span class="px-2 py-0.5 text-xs font-medium rounded"
                                [class.bg-green-100]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.text-green-800]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.dark:bg-green-900]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.dark:text-green-200]="action.flipping?.ruleAction === 'create_rule' || action.flipping?.ruleAction === 'enable_rule'"
                                [class.bg-red-100]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'"
                                [class.text-red-800]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'"
                                [class.dark:bg-red-900]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'"
                                [class.dark:text-red-200]="action.flipping?.ruleAction === 'obsolete_rule' || action.flipping?.ruleAction === 'disable_rule'">
                            {{ getRuleActionLabel(action.flipping?.ruleAction || '') }}
                            </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title="{{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}">
                        {{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}
                    </td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ getFlippingCaissesDisplay(action.flipping?.targetCaisses) }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ getFlippingOSDisplay(action.flipping?.targetOS || []) }}</td>
                    <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ getFlippingVersionsDisplay(action.flipping?.targetVersions || []) }}</td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end space-x-2">
                            <button (click)="startAddingAction(action)" class="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"><span class="material-icons text-sm">edit</span></button>
                            <button (click)="deleteAction(action.squadId!, action.id!)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><span class="material-icons text-sm">delete</span></button>
                        </div>
                    </td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>

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
export class ReleaseActionsComponent implements OnInit {
    @Input() release: Release | null = null;
    @Input() phase: ActionPhase = 'pre_mep';
    @Input() isExpanded = true;
    @Output() toggleExpand = new EventEmitter<void>();
    @Output() releaseUpdated = new EventEmitter<void>();

    isAddingAction = false;
    editingActionId: string | null = null;
    newAction: any = {
        squadId: '',
        type: '',
        description: '',
        flipping: {
            ruleName: '',
            theme: '',
            ruleAction: '',
            targetClients: [],
            targetCaisses: '',
            targetOS: [],
            targetVersions: [],
            ruleState: 'enabled'
        }
    };

    // Flipping UI state
    flippingTargetsAll = true;
    flippingClientsInput = '';
    flippingTargetsAllCaisses = true;
    flippingCaissesInput = '';
    flippingOSiOS = true;
    flippingOSAndroid = true;
    flippingTargetsAllVersions = true;
    flippingVersionsInput = '';

    ACTION_TYPE_LABELS = ACTION_TYPE_LABELS;

    constructor(
        private releaseService: ReleaseService,
        private toastService: ToastService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void { }

    toggleExpanded(): void {
        this.toggleExpand.emit();
    }

    getActionTypeLabel(type: string): string {
        return FeatureFlippingHelper.getActionTypeLabel(type);
    }

    getRuleActionLabel(action: string): string {
        return FeatureFlippingHelper.getRuleActionLabel(action);
    }

    getFlippingClientsDisplay(targetClients: string | string[]): string {
        return FeatureFlippingHelper.getFlippingClientsDisplay(targetClients);
    }

    getFlippingCaissesDisplay(targetCaisses?: string | null): string {
        return FeatureFlippingHelper.getFlippingCaissesDisplay(targetCaisses);
    }

    getFlippingOSDisplay(targetOS: string | string[]): string {
        return FeatureFlippingHelper.getFlippingOSDisplay(targetOS);
    }

    getFlippingVersionsDisplay(targetVersions: string | any[]): string {
        return FeatureFlippingHelper.getFlippingVersionsDisplay(targetVersions);
    }

    // Action Getters
    getAllActions(): Action[] {
        if (!this.release) return [];
        const allActions: Action[] = [];
        this.release.squads.forEach(squad => {
            const squadActions = squad.actions.filter(a => a.phase === this.phase);
            allActions.push(...squadActions);
        });
        return allActions;
    }

    getNonFlippingActions(): Action[] {
        return this.getAllActions().filter(a => a.type === 'other');
    }

    getFeatureFlippingActions(): Action[] {
        return this.getAllActions().filter(a => a.type === 'feature_flipping');
    }

    getMemoryFlippingActions(): Action[] {
        return this.getAllActions().filter(a => a.type === 'memory_flipping');
    }

    getSquadNumber(squadId: string): string {
        const squad = this.release?.squads.find(s => s.id === squadId);
        return squad ? squad.squadNumber.toString() : '?';
    }

    // Actions Logic
    startAddingAction(action?: Action) {
        this.isAddingAction = true;
        if (action) {
            this.editingActionId = action.id!;
            this.newAction = {
                squadId: action.squadId,
                type: action.type,
                description: action.description,
                flipping: action.flipping ? { ...action.flipping } : this.getEmptyFlippingConfig()
            };

            this.initializeFlippingUI(action);
        } else {
            this.editingActionId = null;
            this.resetNewAction();
        }
    }

    cancelAddAction() {
        this.isAddingAction = false;
        this.editingActionId = null;
        this.resetNewAction();
    }

    async saveAction(event: Event): Promise<void> {
        event.preventDefault();
        if (!this.release) return;

        if (!this.newAction.squadId) {
            this.toastService.error('Erreur', 'Veuillez sélectionner une squad');
            return;
        }

        if (!this.newAction.type || !this.newAction.description?.trim()) {
            this.toastService.warning('Champs requis', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Flipping validation
        if (this.newAction.type === 'feature_flipping' || this.newAction.type === 'memory_flipping') {
            if (!this.newAction.flipping.ruleName?.trim() || !this.newAction.flipping.theme?.trim() || !this.newAction.flipping.ruleAction) {
                this.toastService.warning('Configuration incomplète', 'Veuillez remplir les champs obligatoires du flipping');
                return;
            }
        }

        try {
            const actionDto: CreateActionDto = {
                phase: this.phase,
                type: this.newAction.type as ActionType,
                title: this.newAction.description.substring(0, 50),
                description: this.newAction.description
            };

            if (this.newAction.type !== 'other') {
                actionDto.flipping = this.buildFlippingConfig();
            }

            if (this.editingActionId) {
                await this.releaseService.updateAction(this.editingActionId, actionDto);
            } else {
                await this.releaseService.addAction(this.newAction.squadId, actionDto);
            }

            this.releaseUpdated.emit();
            this.cancelAddAction();

            this.toastService.success(
                this.editingActionId ? 'Action modifiée' : 'Action ajoutée',
                `Action ${this.phase === 'pre_mep' ? 'pré-MEP' : 'post-MEP'} ${this.editingActionId ? 'modifiée' : 'créée'} avec succès`
            );
        } catch (error) {
            console.error('Error adding/updating action:', error);
            this.toastService.error('Erreur', 'Impossible de sauvegarder l\'action');
        }
    }

    async deleteAction(squadId: string, actionId: string): Promise<void> {
        const confirmed = await this.confirmationService.confirm({
            title: 'Supprimer l\'action',
            message: 'Êtes-vous sûr de vouloir supprimer cette action ?',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            confirmButtonClass: 'danger'
        });

        if (!confirmed) return;

        try {
            await this.releaseService.deleteAction(actionId);
            this.releaseUpdated.emit();
            this.toastService.success('Action supprimée', 'L\'action a été supprimée avec succès');
        } catch (error) {
            console.error('Error deleting action:', error);
            this.toastService.error('Erreur', 'Impossible de supprimer l\'action');
        }
    }

    // Helpers
    toggleAllClients() { if (this.flippingTargetsAll) this.flippingClientsInput = ''; }
    toggleAllCaisses() { if (this.flippingTargetsAllCaisses) this.flippingCaissesInput = ''; }
    toggleAllVersions() { if (this.flippingTargetsAllVersions) this.flippingVersionsInput = ''; }

    resetNewAction() {
        // Keep squad selection if possible
        const squadId = this.newAction.squadId;
        this.newAction = {
            squadId: squadId,
            type: '',
            description: '',
            flipping: this.getEmptyFlippingConfig()
        };
        this.resetFlippingUI();
    }

    getEmptyFlippingConfig() {
        return {
            ruleName: '',
            theme: '',
            ruleAction: '',
            targetClients: [],
            targetCaisses: '',
            targetOS: [],
            targetVersions: [],
            ruleState: 'enabled'
        };
    }

    resetFlippingUI() {
        this.flippingTargetsAll = true;
        this.flippingClientsInput = '';
        this.flippingTargetsAllCaisses = true;
        this.flippingCaissesInput = '';
        this.flippingOSiOS = true;
        this.flippingOSAndroid = true;
        this.flippingTargetsAllVersions = true;
        this.flippingVersionsInput = '';
    }

    initializeFlippingUI(action: Action) {
        if (!action.flipping) return;

        const f = action.flipping;
        this.flippingTargetsAll = f.targetClients?.includes('all') || !f.targetClients || f.targetClients.length === 0;
        this.flippingClientsInput = !this.flippingTargetsAll ? FeatureFlippingHelper.getFlippingTargets(f.targetClients!).join(', ') : '';

        this.flippingTargetsAllCaisses = !f.targetCaisses || f.targetCaisses === 'Toutes';
        this.flippingCaissesInput = !this.flippingTargetsAllCaisses ? f.targetCaisses! : '';

        const os = FeatureFlippingHelper.getFlippingTargets(f.targetOS || []);
        this.flippingOSiOS = os.includes('ios');
        this.flippingOSAndroid = os.includes('android');

        // Versions parsing (simplified)
        this.flippingTargetsAllVersions = !f.targetVersions || f.targetVersions.length === 0;
        this.flippingVersionsInput = !this.flippingTargetsAllVersions ? FeatureFlippingHelper.getFlippingVersionsDisplay(f.targetVersions) : '';
    }

    buildFlippingConfig() {
        // Build flipping object for API
        const targetClients = this.flippingTargetsAll ? ['all'] : this.flippingClientsInput.split(',').map(c => c.trim()).filter(c => c);
        const targetCaisses = this.flippingTargetsAllCaisses ? 'Toutes' : (this.flippingCaissesInput.trim() || undefined);
        const targetOS: OSType[] = [];
        if (this.flippingOSiOS) targetOS.push('ios');
        if (this.flippingOSAndroid) targetOS.push('android');

        return {
            flippingType: this.newAction.type as FlippingType,
            ruleName: this.newAction.flipping.ruleName,
            theme: this.newAction.flipping.theme,
            ruleAction: this.newAction.flipping.ruleAction as RuleAction,
            targetClients,
            targetCaisses,
            targetOS,
            // Note: versions parsing logic needed here or use helper if moved to static
            targetVersions: this.parseVersions(this.flippingVersionsInput)
        };
    }

    parseVersions(input: string): any[] {
        if (!input.trim() || this.flippingTargetsAllVersions) return [];
        const versions = [];
        const parts = input.split(',').map(p => p.trim());
        for (const part of parts) {
            const match = part.match(/^(>=|<=|>|<|=|!=)\\s*(.+)$/);
            if (match) {
                versions.push({
                    operator: match[1] as VersionOperator,
                    version: match[2].trim()
                });
            }
        }
        return versions;
    }
}
