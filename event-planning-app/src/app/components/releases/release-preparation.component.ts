import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReleaseService } from '@services/release.service';
import { ToastService } from '@services/toast.service';
import { ConfirmationService } from '@services/confirmation.service';
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
  VersionOperator
} from '@models/release.model';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProgressRingComponent } from '../shared/progress-ring.component';

@Component({
  selector: 'app-release-preparation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProgressRingComponent, CanAccessDirective],
  template: `
    <div class="max-w-7xl mx-auto space-y-6" *ngIf="release">
      <!-- Header avec gradient -->
      <div class="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 rounded-2xl shadow-xl p-8">
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

              <!-- Progress global -->
              <div class="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div class="text-white/80 text-sm font-medium mb-2">Progression globale</div>
                <app-progress-ring
                  [percentage]="getGlobalProgress()"
                  [size]="80"
                  [strokeWidth]="6"
                  color="success"
                  [showPercentage]="true"
                ></app-progress-ring>
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
        <div class="card overflow-hidden">
          <div class="p-4 border-b bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent flex justify-between items-center cursor-pointer hover:from-primary-100 dark:hover:from-primary-900/30 transition-all duration-200" (click)="toggleSection('tontons')">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                <span class="material-icons text-xl text-primary-600 dark:text-primary-400">group</span>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Tontons MEP</h2>
            </div>
            <span class="material-icons text-gray-500">
              {{ expandedSections.has('tontons') ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
          <div *ngIf="expandedSections.has('tontons')" class="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let squad of release.squads" class="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300">
                <!-- Gradient top border -->
                <div class="h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>

                <div class="p-4 space-y-4">
                  <!-- Header with squad number and progress -->
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span class="text-white font-bold text-sm">{{ squad.squadNumber }}</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-white">Squad {{ squad.squadNumber }}</span>
                    </div>
                    <app-progress-ring
                      [percentage]="getSquadProgress(squad)"
                      [size]="52"
                      [strokeWidth]="5"
                      [color]="getSquadProgress(squad) === 100 ? 'success' : (getSquadProgress(squad) >= 70 ? 'primary' : 'warning')"
                      [showPercentage]="true"
                    ></app-progress-ring>
                  </div>

                  <!-- Tonton MEP input -->
                  <div class="space-y-2">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Responsable MEP</label>
                    <div class="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 dark:focus-within:ring-primary-800/50 transition-all">
                      <span class="material-icons text-lg text-primary-500 dark:text-primary-400">person</span>
                      <input
                        #tontonInput
                        type="text"
                        [value]="squad.tontonMep || ''"
                        (input)="true"
                        (keyup.enter)="updateTontonMep(squad.id!, tontonInput.value)"
                        placeholder="Non assigné"
                        class="flex-1 bg-transparent px-1 py-1 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                      />
                      <button
                        appCanAccess="RELEASES"
                        accessLevel="write"
                        (click)="updateTontonMep(squad.id!, tontonInput.value)"
                        [disabled]="tontonInput.value.trim() === (squad.tontonMep || '')"
                        [ngClass]="{
                          'opacity-40 cursor-not-allowed': tontonInput.value.trim() === (squad.tontonMep || ''),
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 shadow-sm': tontonInput.value.trim() !== (squad.tontonMep || '')
                        }"
                        class="p-1.5 rounded-lg transition-all duration-200"
                        title="Valider"
                      >
                        <span class="material-icons text-base">check</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Actions Pré-MEP -->
        <div class="card overflow-hidden">
          <div class="p-4 border-b bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent flex justify-between items-center cursor-pointer hover:from-green-100 dark:hover:from-green-900/30 transition-all duration-200" (click)="toggleSection('pre_mep')">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <span class="material-icons text-xl text-green-600 dark:text-green-400">start</span>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Actions Pré-MEP</h2>
            </div>
            <span class="material-icons text-gray-500">
              {{ expandedSections.has('pre_mep') ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
          <div *ngIf="expandedSections.has('pre_mep')" class="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let squad of release.squads" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm h-full">
              <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-3 mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-white font-bold text-sm">{{ squad.squadNumber }}</span>
                  </div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-white">Squad {{ squad.squadNumber }}</h3>
                </div>
                <button
                  appCanAccess="RELEASES"
                  accessLevel="write"
                  (click)="startAddingAction(squad, 'pre_mep')"
                  class="btn btn-sm btn-ghost flex items-center space-x-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  <span class="material-icons text-sm">add</span>
                  <span>Ajouter</span>
                </button>
              </div>

              <!-- Add Action Form -->
              <div *ngIf="addingActionToSquad?.id === squad.id && addingActionPhase === 'pre_mep'"
                   class="mb-3 form-inline-glass">
                <form (submit)="addAction(squad.id!, 'pre_mep', $event)" class="space-y-3">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900 dark:text-white">
                      {{ editingActionId ? "Modifier l'action" : "Nouvelle action" }}
                    </h4>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'action <span class="text-red-500">*</span></label>
                    <select [(ngModel)]="newAction.type" name="type" (change)="onActionTypeChange()" required class="input text-sm w-full">
                      <option value="">Sélectionner un type</option>
                      <option value="feature_flipping">{{ ACTION_TYPE_LABELS['feature_flipping'] }}</option>
                      <option value="memory_flipping">{{ ACTION_TYPE_LABELS['memory_flipping'] }}</option>
                      <option value="other">{{ ACTION_TYPE_LABELS['other'] }}</option>
                    </select>
                  </div>

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

                  <!-- Feature Flipping / Memory Flipping Form -->
                  <div *ngIf="newAction.type === 'feature_flipping' || newAction.type === 'memory_flipping'" class="space-y-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600">
                    <h4 class="font-medium text-gray-900 dark:text-white text-sm">Configuration {{ newAction.type === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping' }}</h4>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ newAction.type === 'feature_flipping' ? 'Nom du FF' : 'Nom du MF' }} <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="newAction.flipping.ruleName"
                        name="ruleName"
                        required
                        class="input text-sm w-full"
                        placeholder="Ex: FEATURE_NEW_DASHBOARD"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thème <span class="text-red-500">*</span></label>
                      <input
                        type="text"
                        [(ngModel)]="newAction.flipping.theme"
                        name="theme"
                        required
                        class="input text-sm w-full"
                        placeholder="Ex: Authentification, Navigation, Paiement"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action <span class="text-red-500">*</span></label>
                      <select [(ngModel)]="newAction.flipping.ruleAction" name="ruleAction" required class="input text-sm w-full">
                        <option value="">Sélectionner</option>
                        <option value="create_rule">{{ getDynamicRuleActionLabel('create_rule') }}</option>
                        <option value="obsolete_rule">{{ getDynamicRuleActionLabel('obsolete_rule') }}</option>
                        <option value="disable_rule">{{ getDynamicRuleActionLabel('disable_rule') }}</option>
                        <option value="enable_rule">{{ getDynamicRuleActionLabel('enable_rule') }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clients (CAELs)</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            [(ngModel)]="flippingTargetsAll"
                            name="targetsAll"
                            (change)="toggleAllClients()"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Tous les clients</span>
                        </label>
                        <input
                          *ngIf="!flippingTargetsAll"
                          type="text"
                          [(ngModel)]="flippingClientsInput"
                          name="clients"
                          placeholder="Ex: 89123456789"
                          class="input text-sm w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caisses</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            [(ngModel)]="flippingTargetsAllCaisses"
                            name="targetsAllCaisses"
                            (change)="toggleAllCaisses()"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Toutes les caisses</span>
                        </label>
                        <input
                          *ngIf="!flippingTargetsAllCaisses"
                          type="text"
                          [(ngModel)]="flippingCaissesInput"
                          name="caisses"
                          placeholder="Ex: Caisse 1, Caisse 2"
                          class="input text-sm w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OS ciblés</label>
                      <div class="flex space-x-4">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value="ios"
                            [(ngModel)]="flippingOSiOS"
                            name="osIOS"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">iOS</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value="android"
                            [(ngModel)]="flippingOSAndroid"
                            name="osAndroid"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Android</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versions ciblées</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            [(ngModel)]="flippingTargetsAllVersions"
                            name="targetsAllVersions"
                            (change)="toggleAllVersions()"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Toutes les versions</span>
                        </label>
                        <input
                          *ngIf="!flippingTargetsAllVersions"
                          type="text"
                          [(ngModel)]="flippingVersionsInput"
                          name="versions"
                          placeholder="Ex: >= 38.5, < 40.0"
                          class="input text-sm w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-2 pt-2">
                    <button appCanAccess="RELEASES" accessLevel="write" type="submit" class="btn btn-primary btn-sm">Enregistrer</button>
                    <button type="button" (click)="cancelAddAction()" class="btn btn-secondary btn-sm">Annuler</button>
                  </div>
                </form>
              </div>

              <!-- Actions List -->
              <div class="space-y-6">
                <!-- Non-flipping actions -->
                <div *ngIf="getNonFlippingActions(squad, 'pre_mep').length > 0">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Actions Standard</h4>
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <table class="min-w-full text-sm">
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                <tr *ngFor="let action of getNonFlippingActions(squad, 'pre_mep')" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center space-x-3">
                                            <span class="material-icons text-sm text-blue-500">start</span>
                                            <span class="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                                {{ getActionTypeLabel(action.type) }}
                                            </span>
                                            <span class="text-gray-900 dark:text-white">{{ action.description }}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right w-24">
                                        <div class="flex items-center justify-end space-x-2">
                                            <button appCanAccess="RELEASES" accessLevel="write" (click)="startEditingAction(squad, 'pre_mep', action)" class="text-blue-600 hover:text-blue-800"><span class="material-icons text-sm">edit</span></button>
                                            <button appCanAccess="RELEASES" accessLevel="write" (click)="deleteAction(squad.id!, action.id!)" class="text-red-600 hover:text-red-800"><span class="material-icons text-sm">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Flipping actions grouped by type in tables -->
                <div *ngFor="let entry of getFlippingActionsByType(squad, 'pre_mep') | keyvalue" class="overflow-x-auto">
                  <div class="flex items-center space-x-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100/30 dark:from-green-900/20 dark:to-green-900/10">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/50">
                      <span class="material-icons text-base text-green-600 dark:text-green-400">
                        rule_settings
                      </span>
                    </div>
                    <h4 class="text-sm font-bold uppercase tracking-wide text-green-700 dark:text-green-300">{{ getActionTypeLabel(entry.key) }}</h4>
                  </div>
                  <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <table class="min-w-full text-xs">
                        <thead class="bg-gradient-to-r from-green-100/50 to-green-50/30 dark:from-green-900/30 dark:to-green-900/10">
                        <tr>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">{{ getFlippingRuleColumnLabel(entry.key) }}</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Thème</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Action</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Clients</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Caisses</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">OS</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Versions</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        <tr *ngFor="let action of entry.value" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td class="px-3 py-2 font-mono text-gray-600 dark:text-gray-300" [class.line-through]="action.status === 'completed'">
                              {{ action.flipping?.ruleName }}
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                              <span class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">{{ action.flipping?.theme }}</span>
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400" [class.line-through]="action.status === 'completed'">
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
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-xs truncate" title="{{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}">
                              {{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {{ getFlippingCaissesDisplay(action.flipping?.targetCaisses) }}
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingOSDisplay(action.flipping?.targetOS || []) }}</td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {{ getFlippingVersionsDisplay(action.flipping?.targetVersions || []) }}
                            </td>
                            <td class="px-3 py-2 text-right">
                            <div class="flex items-center justify-end space-x-2">
                                <button
                                (click)="startEditingAction(squad, 'pre_mep', action)"
                                class="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                                >
                                <span class="material-icons text-sm">edit</span>
                                </button>
                                <button
                                (click)="deleteAction(squad.id!, action.id!)"
                                class="text-red-600 dark:text-red-400 hover:text-red-700"
                                >
                                <span class="material-icons text-sm">delete</span>
                                </button>
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                  </div>
                </div>

                <div *ngIf="getActionsByPhase(squad, 'pre_mep').length === 0" class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 transition-all hover:border-gray-400 dark:hover:border-gray-500">
                  <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                    <span class="material-icons text-3xl text-green-400 dark:text-green-500">fact_check</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Aucune action pré-MEP</p>
                  <label class="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      [checked]="squad.preMepEmptyConfirmed"
                      (change)="toggleEmptyStatus(squad, 'pre_mep')"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600 shadow-inner"></div>
                    <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Rien à signaler (Néant)</span>
                  </label>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- 3. Actions Post-MEP -->
        <div class="card overflow-hidden">
          <div class="p-4 border-b bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent flex justify-between items-center cursor-pointer hover:from-green-100 dark:hover:from-green-900/30 transition-all duration-200" (click)="toggleSection('post_mep')">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <span class="material-icons text-xl text-green-600 dark:text-green-400">check_circle</span>
              </div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Actions Post-MEP</h2>
            </div>
            <span class="material-icons text-gray-500">
              {{ expandedSections.has('post_mep') ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
          <div *ngIf="expandedSections.has('post_mep')" class="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/30">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let squad of release.squads" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm h-full">
              <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-3 mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-white font-bold text-sm">{{ squad.squadNumber }}</span>
                  </div>
                  <h3 class="text-base font-bold text-gray-900 dark:text-white">Squad {{ squad.squadNumber }}</h3>
                </div>
                <button
                  appCanAccess="RELEASES"
                  accessLevel="write"
                  (click)="startAddingAction(squad, 'post_mep')"
                  class="btn btn-sm btn-ghost flex items-center space-x-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  <span class="material-icons text-sm">add</span>
                  <span>Ajouter</span>
                </button>
              </div>

              <!-- Add Action Form -->
              <div *ngIf="addingActionToSquad?.id === squad.id && addingActionPhase === 'post_mep'"
                   class="mb-3 form-inline-glass">
                <form (submit)="addAction(squad.id!, 'post_mep', $event)" class="space-y-3">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900 dark:text-white">
                      {{ editingActionId ? "Modifier l'action" : "Nouvelle action" }}
                    </h4>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'action <span class="text-red-500">*</span></label>
                    <select [(ngModel)]="newAction.type" name="type" (change)="onActionTypeChange()" required class="input text-sm w-full">
                      <option value="">Sélectionner un type</option>
                      <option value="feature_flipping">{{ ACTION_TYPE_LABELS['feature_flipping'] }}</option>
                      <option value="memory_flipping">{{ ACTION_TYPE_LABELS['memory_flipping'] }}</option>
                      <option value="other">{{ ACTION_TYPE_LABELS['other'] }}</option>
                    </select>
                  </div>

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

                  <!-- Feature Flipping / Memory Flipping Form -->
                  <div *ngIf="newAction.type === 'feature_flipping' || newAction.type === 'memory_flipping'" class="space-y-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600">
                    <h4 class="font-medium text-gray-900 dark:text-white text-sm">Configuration {{ newAction.type === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping' }}</h4>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ newAction.type === 'feature_flipping' ? 'Nom du FF' : 'Nom du MF' }} <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="newAction.flipping.ruleName"
                        name="ruleName"
                        required
                        class="input text-sm w-full"
                        placeholder="Ex: FEATURE_NEW_DASHBOARD"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thème <span class="text-red-500">*</span></label>
                      <input
                        type="text"
                        [(ngModel)]="newAction.flipping.theme"
                        name="theme"
                        required
                        class="input text-sm w-full"
                        placeholder="Ex: Authentification, Navigation, Paiement"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action <span class="text-red-500">*</span></label>
                      <select [(ngModel)]="newAction.flipping.ruleAction" name="ruleAction" required class="input text-sm w-full">
                        <option value="">Sélectionner</option>
                        <option value="create_rule">{{ getDynamicRuleActionLabel('create_rule') }}</option>
                        <option value="obsolete_rule">{{ getDynamicRuleActionLabel('obsolete_rule') }}</option>
                        <option value="disable_rule">{{ getDynamicRuleActionLabel('disable_rule') }}</option>
                        <option value="enable_rule">{{ getDynamicRuleActionLabel('enable_rule') }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clients (CAELs)</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            [(ngModel)]="flippingTargetsAll"
                            name="targetsAll"
                            (change)="toggleAllClients()"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Tous les clients</span>
                        </label>
                        <input
                          *ngIf="!flippingTargetsAll"
                          type="text"
                          [(ngModel)]="flippingClientsInput"
                          name="clients"
                          placeholder="Ex: 89123456789"
                          class="input text-sm w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caisses</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            [(ngModel)]="flippingTargetsAllCaisses"
                            name="targetsAllCaisses"
                            (change)="toggleAllCaisses()"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Toutes les caisses</span>
                        </label>
                        <input
                          *ngIf="!flippingTargetsAllCaisses"
                          type="text"
                          [(ngModel)]="flippingCaissesInput"
                          name="caisses"
                          placeholder="Ex: Caisse 1, Caisse 2"
                          class="input text-sm w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OS ciblés</label>
                      <div class="flex space-x-4">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value="ios"
                            [(ngModel)]="flippingOSiOS"
                            name="osIOS"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">iOS</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value="android"
                            [(ngModel)]="flippingOSAndroid"
                            name="osAndroid"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Android</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versions ciblées</label>
                      <div class="space-y-2">
                        <label class="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            [(ngModel)]="flippingTargetsAllVersions"
                            name="targetsAllVersions"
                            (change)="toggleAllVersions()"
                            class="rounded"
                          />
                          <span class="text-sm text-gray-700 dark:text-gray-300">Toutes les versions</span>
                        </label>
                        <input
                          *ngIf="!flippingTargetsAllVersions"
                          type="text"
                          [(ngModel)]="flippingVersionsInput"
                          name="versions"
                          placeholder="Ex: >= 38.5, < 40.0"
                          class="input text-sm w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-2 pt-2">
                    <button appCanAccess="RELEASES" accessLevel="write" type="submit" class="btn btn-primary btn-sm">Enregistrer</button>
                    <button type="button" (click)="cancelAddAction()" class="btn btn-secondary btn-sm">Annuler</button>
                  </div>
                </form>
              </div>

              <!-- Actions List -->
              <div class="space-y-6">
                <!-- Non-flipping actions -->
                <div *ngIf="getNonFlippingActions(squad, 'post_mep').length > 0">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Actions Standard</h4>
                    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <table class="min-w-full text-sm">
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                <tr *ngFor="let action of getNonFlippingActions(squad, 'post_mep')" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center space-x-3">
                                            <span class="material-icons text-sm text-green-500">end</span>
                                            <span class="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                                {{ getActionTypeLabel(action.type) }}
                                            </span>
                                            <span class="text-gray-900 dark:text-white">{{ action.description }}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right w-24">
                                        <div class="flex items-center justify-end space-x-2">
                                            <button appCanAccess="RELEASES" accessLevel="write" (click)="startEditingAction(squad, 'post_mep', action)" class="text-blue-600 hover:text-blue-800"><span class="material-icons text-sm">edit</span></button>
                                            <button appCanAccess="RELEASES" accessLevel="write" (click)="deleteAction(squad.id!, action.id!)" class="text-red-600 hover:text-red-800"><span class="material-icons text-sm">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Flipping actions grouped by type in tables -->
                <div *ngFor="let entry of getFlippingActionsByType(squad, 'post_mep') | keyvalue" class="overflow-x-auto">
                  <div class="flex items-center space-x-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100/30 dark:from-green-900/20 dark:to-green-900/10">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/50">
                      <span class="material-icons text-base text-green-600 dark:text-green-400">
                        rule_settings
                      </span>
                    </div>
                    <h4 class="text-sm font-bold uppercase tracking-wide text-green-700 dark:text-green-300">{{ getActionTypeLabel(entry.key) }}</h4>
                  </div>
                  <div class="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <table class="min-w-full text-xs">
                        <thead class="bg-gradient-to-r from-green-100/50 to-green-50/30 dark:from-green-900/30 dark:to-green-900/10">
                        <tr>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">{{ getFlippingRuleColumnLabel(entry.key) }}</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Thème</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Action</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Clients</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Caisses</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">OS</th>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">Versions</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        <tr *ngFor="let action of entry.value" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td class="px-3 py-2 font-mono text-gray-600 dark:text-gray-300" [class.line-through]="action.status === 'completed'">
                              {{ action.flipping?.ruleName }}
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                              <span class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">{{ action.flipping?.theme }}</span>
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400" [class.line-through]="action.status === 'completed'">
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
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-xs truncate" title="{{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}">
                              {{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {{ getFlippingCaissesDisplay(action.flipping?.targetCaisses) }}
                            </td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingOSDisplay(action.flipping?.targetOS || []) }}</td>
                            <td class="px-3 py-2 text-gray-600 dark:text-gray-400">
                              {{ getFlippingVersionsDisplay(action.flipping?.targetVersions || []) }}
                            </td>
                            <td class="px-3 py-2 text-right">
                            <div class="flex items-center justify-end space-x-2">
                                <button
                                (click)="startEditingAction(squad, 'post_mep', action)"
                                class="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                                >
                                <span class="material-icons text-sm">edit</span>
                                </button>
                                <button
                                (click)="deleteAction(squad.id!, action.id!)"
                                class="text-red-600 dark:text-red-400 hover:text-red-700"
                                >
                                <span class="material-icons text-sm">delete</span>
                                </button>
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                  </div>
                </div>

                <div *ngIf="getActionsByPhase(squad, 'post_mep').length === 0" class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 transition-all hover:border-gray-400 dark:hover:border-gray-500">
                  <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                    <span class="material-icons text-3xl text-green-400 dark:text-green-500">task_alt</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Aucune action post-MEP</p>
                  <label class="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      [checked]="squad.postMepEmptyConfirmed"
                      (change)="toggleEmptyStatus(squad, 'post_mep')"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600 shadow-inner"></div>
                    <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Rien à signaler (Néant)</span>
                  </label>
                </div>
              </div>
            </div>
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

  // Action form
  addingActionToSquad: Squad | null = null;
  addingActionPhase: ActionPhase | null = null;
  editingActionId: string | null = null;
  newAction: any = {
    type: '',
    description: '',
    flipping: {
      flippingType: '',
      ruleName: '',
      theme: '',
      ruleAction: '',
      ruleState: '',
      targetClients: [],
      targetOS: [],
      targetVersions: []
    }
  };

  // Feature Flipping helpers
  flippingTargetsAll = true;
  flippingClientsInput = '';
  flippingTargetsAllCaisses = true;
  flippingCaissesInput = '';
  flippingOSiOS = true;
  flippingOSAndroid = true;
  flippingTargetsAllVersions = true;
  flippingVersionsInput = '';

  STATUS_LABELS = STATUS_LABELS;
  STATUS_COLORS = STATUS_COLORS;
  ACTION_TYPE_LABELS = ACTION_TYPE_LABELS;
  ACTION_PHASE_LABELS = ACTION_PHASE_LABELS;
  FLIPPING_TYPE_LABELS = FLIPPING_TYPE_LABELS;
  RULE_ACTION_LABELS = RULE_ACTION_LABELS;
  RULE_STATE_LABELS = RULE_STATE_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private releaseService: ReleaseService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        this.release = await this.releaseService.getRelease(id);
      } catch (error) {
        console.error('Error loading release:', error);
        this.router.navigate(['/releases']);
      }
    }
  }

  async loadRelease(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        this.release = await this.releaseService.getRelease(id);
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

  getActionsByPhase(squad: Squad, phase: ActionPhase): Action[] {
    return squad.actions.filter(a => a.phase === phase);
  }

  // Regrouper les actions avec flipping par type
  getFlippingActionsByType(squad: Squad, phase: ActionPhase): Map<ActionType, Action[]> {
    const actions = squad.actions.filter(a =>
      a.phase === phase &&
      a.flipping &&
      (a.type === 'feature_flipping' || a.type === 'memory_flipping')
    );

    const grouped = new Map<ActionType, Action[]>();
    actions.forEach(action => {
      if (!grouped.has(action.type)) {
        grouped.set(action.type, []);
      }
      grouped.get(action.type)!.push(action);
    });

    return grouped;
  }

  // Obtenir les actions sans flipping
  getNonFlippingActions(squad: Squad, phase: ActionPhase): Action[] {
    return squad.actions.filter(a =>
      a.phase === phase &&
      (!a.flipping || (a.type !== 'feature_flipping' && a.type !== 'memory_flipping'))
    );
  }

  // Action methods
  startAddingAction(squad: Squad, phase: ActionPhase): void {
    this.addingActionToSquad = squad;
    this.addingActionPhase = phase;
    this.editingActionId = null;
    this.resetActionForm();
  }

  startEditingAction(squad: Squad, phase: ActionPhase, action: Action): void {
    this.addingActionToSquad = squad;
    this.addingActionPhase = phase;
    this.editingActionId = action.id!;

    // Populate form
    this.newAction = {
      type: action.type,
      description: action.description || '',
      flipping: {
        flippingType: '',
        ruleName: '',
        theme: '',
        ruleAction: '',
        ruleState: '',
        targetClients: [],
        targetOS: [],
        targetVersions: []
      }
    };

    if (action.flipping) {
      this.newAction.flipping = {
        flippingType: action.flipping.flippingType,
        ruleName: action.flipping.ruleName,
        theme: action.flipping.theme,
        ruleAction: action.flipping.ruleAction,
        ruleState: action.flipping.ruleState,
        targetClients: [], // Will be set below
        targetOS: [], // Will be set below
        targetVersions: [] // Will be set below
      };

      // Handle Clients
      const clients = this.getFlippingTargets(action.flipping.targetClients);
      if (clients.includes('all')) {
        this.flippingTargetsAll = true;
        this.flippingClientsInput = '';
      } else {
        this.flippingTargetsAll = false;
        this.flippingClientsInput = clients.join(', ');
      }

      // Handle Caisses
      if (!action.flipping.targetCaisses) {
        this.flippingTargetsAllCaisses = true;
        this.flippingCaissesInput = '';
      } else {
        this.flippingTargetsAllCaisses = false;
        this.flippingCaissesInput = action.flipping.targetCaisses;
      }

      // Handle OS
      const osList = this.getFlippingTargets(action.flipping.targetOS);
      this.flippingOSiOS = osList.length === 0 || osList.includes('ios');
      this.flippingOSAndroid = osList.length === 0 || osList.includes('android');

      // Handle Versions
      const versions = this.getFlippingVersions(action.flipping.targetVersions);
      if (versions === 'ALL' || !versions) {
        this.flippingTargetsAllVersions = true;
        this.flippingVersionsInput = '';
      } else {
        this.flippingTargetsAllVersions = false;
        this.flippingVersionsInput = versions;
      }
    } else {
      // Reset flipping helpers if not a flipping action
      this.flippingTargetsAll = true;
      this.flippingClientsInput = '';
      this.flippingTargetsAllCaisses = true;
      this.flippingCaissesInput = '';
      this.flippingOSiOS = true;
      this.flippingOSAndroid = true;
      this.flippingTargetsAllVersions = true;
      this.flippingVersionsInput = '';
    }
  }

  resetActionForm(): void {
    this.newAction = {
      type: '',
      description: '',
      flipping: {
        flippingType: '',
        ruleName: '',
        theme: '',
        ruleAction: '',
        ruleState: '',
        targetClients: [],
        targetOS: [],
        targetVersions: []
      }
    };
    this.flippingTargetsAll = true;
    this.flippingClientsInput = '';
    this.flippingTargetsAllCaisses = true;
    this.flippingCaissesInput = '';
    this.flippingOSiOS = true;
    this.flippingOSAndroid = true;
    this.flippingTargetsAllVersions = true;
    this.flippingVersionsInput = '';
  }

  onActionTypeChange(): void {
    if (this.newAction.type === 'feature_flipping') {
      this.newAction.flipping.flippingType = 'feature_flipping';
    } else if (this.newAction.type === 'memory_flipping') {
      this.newAction.flipping.flippingType = 'memory_flipping';
    }
  }

  async addAction(squadId: string, phase: ActionPhase, event: Event): Promise<void> {
    event.preventDefault();

    if (!this.newAction.type || !this.newAction.description?.trim()) {
      this.toastService.warning(
        'Champs requis',
        'Veuillez remplir tous les champs obligatoires'
      );
      return;
    }

    // Validation feature flipping or memory flipping
    if (this.newAction.type === 'feature_flipping' || this.newAction.type === 'memory_flipping') {
      if (!this.newAction.flipping.ruleName?.trim() ||
        !this.newAction.flipping.theme?.trim() ||
        !this.newAction.flipping.ruleAction?.trim()) {
        this.toastService.warning(
          'Configuration incomplète',
          'Veuillez remplir tous les champs obligatoires du Feature/Memory Flipping (Nom, Thème, Action)'
        );
        return;
      }
    }

    try {
      const actionDto: CreateActionDto = {
        phase,
        type: this.newAction.type as ActionType,
        title: this.newAction.description, // Le titre est la description
        description: this.newAction.description
      };

      // Add flipping config if needed
      if (this.newAction.type === 'feature_flipping' || this.newAction.type === 'memory_flipping') {
        const targetClients = this.flippingTargetsAll
          ? ['all']
          : this.flippingClientsInput.split(',').map(c => c.trim()).filter(c => c);

        const targetCaisses = this.flippingTargetsAllCaisses
          ? undefined
          : this.flippingCaissesInput.trim() || undefined;

        const targetOS: OSType[] = [];
        if (this.flippingOSiOS) targetOS.push('ios');
        if (this.flippingOSAndroid) targetOS.push('android');

        const targetVersions = this.flippingTargetsAllVersions
          ? []
          : this.flippingVersionsInput.trim()
            ? this.parseVersions(this.flippingVersionsInput)
            : [];

        actionDto.flipping = {
          flippingType: this.newAction.flipping.flippingType as FlippingType,
          ruleName: this.newAction.flipping.ruleName,
          theme: this.newAction.flipping.theme,
          ruleAction: this.newAction.flipping.ruleAction as RuleAction,
          targetClients,
          targetCaisses,
          targetOS,
          targetVersions
        };
      }

      if (this.editingActionId) {
        await this.releaseService.updateAction(this.editingActionId, actionDto);
      } else {
        await this.releaseService.addAction(squadId, actionDto);
      }

      await this.loadRelease();
      this.cancelAddAction();
      await this.checkAndUpdateCompletion(squadId);

      this.toastService.success(
        this.editingActionId ? 'Action modifiée' : 'Action ajoutée',
        `Action ${phase === 'pre_mep' ? 'pré-MEP' : 'post-MEP'} ${this.editingActionId ? 'modifiée' : 'créée'} avec succès`
      );
    } catch (error) {
      console.error('Error adding action:', error);
      this.toastService.error(
        'Erreur d\'ajout',
        'Impossible d\'ajouter l\'action. Veuillez réessayer.'
      );
    }
  }

  cancelAddAction(): void {
    this.addingActionToSquad = null;
    this.addingActionPhase = null;
    this.editingActionId = null;
    this.resetActionForm();
  }

  async deleteAction(squadId: string, actionId: string): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer l\'action',
      message: 'Êtes-vous sûr de vouloir supprimer cette action ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmButtonClass: 'danger'
    });

    if (!confirmed) return;

    try {
      await this.releaseService.deleteAction(actionId);
      await this.loadRelease();
      await this.checkAndUpdateCompletion(squadId);

      this.toastService.success(
        'Action supprimée',
        'L\'action a été supprimée avec succès'
      );
    } catch (error) {
      console.error('Error deleting action:', error);
      this.toastService.error(
        'Erreur de suppression',
        'Impossible de supprimer l\'action. Veuillez réessayer.'
      );
    }
  }


  // Feature Flipping helpers
  toggleAllClients(): void {
    if (this.flippingTargetsAll) {
      this.flippingClientsInput = '';
    }
  }

  toggleAllCaisses(): void {
    if (this.flippingTargetsAllCaisses) {
      this.flippingCaissesInput = '';
    }
  }

  toggleAllVersions(): void {
    if (this.flippingTargetsAllVersions) {
      this.flippingVersionsInput = '';
    }
  }

  getFlippingTargets(data: string | string[]): string[] {
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getFlippingVersions(data: string | any[]): string {
    let versions: any[];
    if (Array.isArray(data)) {
      versions = data;
    } else {
      try {
        versions = JSON.parse(data);
      } catch {
        return '';
      }
    }
    return versions.map((v: any) => `${v.operator} ${v.version}`).join(', ');
  }

  getActionTypeLabel(type: string): string {
    return ACTION_TYPE_LABELS[type as ActionType] || type;
  }

  getFlippingTypeLabel(type: string): string {
    return FLIPPING_TYPE_LABELS[type as FlippingType] || type;
  }

  getRuleActionLabel(action: string): string {
    return RULE_ACTION_LABELS[action as RuleAction] || action;
  }

  getRuleStateLabel(state: string): string {
    return RULE_STATE_LABELS[state as RuleState] || state;
  }

  // Display methods that show "ALL" for all-selected options
  getFlippingClientsDisplay(targetClients: string | string[]): string {
    const clients = this.getFlippingTargets(targetClients);
    if (clients.length === 0 || clients.includes('all')) {
      return 'ALL';
    }
    return clients.join(', ');
  }

  getFlippingCaissesDisplay(targetCaisses?: string | null): string {
    if (!targetCaisses) {
      return 'ALL';
    }
    return targetCaisses;
  }

  getFlippingOSDisplay(targetOS: string | string[]): string {
    const osList = this.getFlippingTargets(targetOS);
    if (osList.length === 0 || (osList.includes('ios') && osList.includes('android'))) {
      return 'ALL';
    }
    return osList.join(', ').toUpperCase();
  }

  getFlippingOSDisplayWithIcons(targetOS: string | string[]): string {
    const osList = this.getFlippingTargets(targetOS);
    if (osList.length === 0 || (osList.includes('ios') && osList.includes('android'))) {
      return '📱 iOS, 🤖 Android';
    }
    const icons = osList.map(os => os === 'ios' ? '📱 iOS' : '🤖 Android');
    return icons.join(', ');
  }

  getFlippingVersionsDisplay(targetVersions: string | any[]): string {
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

  // Dynamic rule action labels based on flipping type
  getDynamicRuleActionLabel(action: string): string {
    const baseLabel = RULE_ACTION_LABELS[action as RuleAction] || action;
    const flippingType = this.newAction?.flipping?.flippingType;

    if (!flippingType) {
      return baseLabel;
    }

    const suffix = flippingType === 'feature_flipping' ? 'FF' : 'MF';
    return baseLabel.replace('FF/MF', suffix);
  }

  parseVersions(input: string): any[] {
    if (!input.trim()) return [];

    const versions = [];
    const parts = input.split(',').map(p => p.trim());

    for (const part of parts) {
      const match = part.match(/^(>=|<=|>|<|=|!=)\s*(.+)$/);
      if (match) {
        versions.push({
          operator: match[1] as VersionOperator,
          version: match[2].trim()
        });
      }
    }

    return versions;
  }

  // Dynamic column label for flipping rule name
  getFlippingRuleColumnLabel(actionType: string): string {
    if (actionType === 'feature_flipping') {
      return 'Nom du FF';
    } else if (actionType === 'memory_flipping') {
      return 'Nom du MF';
    }
    return 'Règle';
  }

  // Squad management methods
  // Squad management methods
  async updateTontonMep(squadId: string, tontonMepValue: string): Promise<void> {
    const tontonMep = tontonMepValue.trim();
    const squad = this.release?.squads.find(s => s.id === squadId);

    if (!squad) return;

    // Check if value hasn't changed
    const currentTonton = squad.tontonMep || '';
    if (currentTonton === tontonMep) {
      return;
    }

    try {
      await this.releaseService.updateSquad(squadId, { tontonMep });

      // Update local state
      squad.tontonMep = tontonMep;

      await this.checkAndUpdateCompletion(squadId);

      this.toastService.success(
        'Tonton MEP mis à jour',
        tontonMep ? `Assigné à ${tontonMep}` : 'Tonton MEP retiré'
      );
    } catch (error) {
      console.error('Error updating Tonton MEP:', error);
      this.toastService.error(
        'Erreur de mise à jour',
        'Impossible de mettre à jour le Tonton MEP. Veuillez réessayer.'
      );
    }
  }

  getSquadProgress(squad: Squad): number {
    let progress = 0;

    // Pre-MEP: 50%
    const preMepActions = this.getActionsByPhase(squad, 'pre_mep');
    const completedPreMepActions = preMepActions.filter(a => a.status === 'completed').length;

    if (preMepActions.length === 0 && squad.preMepEmptyConfirmed) {
      progress += 50; // Pre-MEP confirmé comme vide
    } else if (preMepActions.length > 0) {
      progress += (completedPreMepActions / preMepActions.length) * 50;
    }

    // Post-MEP: 50%
    const postMepActions = this.getActionsByPhase(squad, 'post_mep');
    const completedPostMepActions = postMepActions.filter(a => a.status === 'completed').length;

    if (postMepActions.length === 0 && squad.postMepEmptyConfirmed) {
      progress += 50; // Post-MEP confirmé comme vide
    } else if (postMepActions.length > 0) {
      progress += (completedPostMepActions / postMepActions.length) * 50;
    }

    return Math.round(progress);
  }

  getGlobalProgress(): number {
    if (!this.release || this.release.squads.length === 0) {
      return 0;
    }

    const totalProgress = this.release.squads.reduce((sum, squad) => {
      return sum + this.getSquadProgress(squad);
    }, 0);

    return Math.round(totalProgress / this.release.squads.length);
  }

  getMissingSteps(squad: Squad): string {
    const missing: string[] = [];

    const preMepActions = this.getActionsByPhase(squad, 'pre_mep');
    const completedPreMepActions = preMepActions.filter(a => a.status === 'completed').length;

    if (preMepActions.length > 0 && completedPreMepActions < preMepActions.length) {
      missing.push(`Pré-MEP (${completedPreMepActions}/${preMepActions.length})`);
    } else if (preMepActions.length === 0 && !squad.preMepEmptyConfirmed) {
      missing.push('Actions Pré-MEP');
    }

    const postMepActions = this.getActionsByPhase(squad, 'post_mep');
    const completedPostMepActions = postMepActions.filter(a => a.status === 'completed').length;

    if (postMepActions.length > 0 && completedPostMepActions < postMepActions.length) {
      missing.push(`Post-MEP (${completedPostMepActions}/${postMepActions.length})`);
    } else if (postMepActions.length === 0 && !squad.postMepEmptyConfirmed) {
      missing.push('Actions Post-MEP');
    }

    if (missing.length === 0) {
      return 'Complet !';
    }

    return 'Manquant : ' + missing.join(', ');
  }

  async toggleEmptyStatus(squad: Squad, section: 'pre_mep' | 'post_mep'): Promise<void> {
    const updateData: any = {};
    if (section === 'pre_mep') {
      updateData.preMepEmptyConfirmed = !squad.preMepEmptyConfirmed;
    } else if (section === 'post_mep') {
      updateData.postMepEmptyConfirmed = !squad.postMepEmptyConfirmed;
    }

    try {
      await this.releaseService.updateSquad(squad.id!, updateData);
      await this.loadRelease();

      // Check and update completion status
      await this.checkAndUpdateCompletion(squad.id!);

    } catch (error) {
      console.error('Error updating empty status:', error);
      this.toastService.error('Erreur', 'Impossible de mettre à jour le statut.');
    }
  }

  async checkAndUpdateCompletion(squadId: string): Promise<void> {
    if (!this.release) return;
    const squad = this.release.squads.find(s => s.id === squadId);
    if (!squad) return;

    const progress = this.getSquadProgress(squad);
    const isCompleted = progress === 100;

    if (squad.isCompleted !== isCompleted) {
      try {
        await this.releaseService.updateSquad(squadId, { isCompleted });
        // No need to reload release here as we just did or will do
        // But to be safe and update UI immediately:
        squad.isCompleted = isCompleted;

        if (isCompleted) {
          this.toastService.success(
            'Félicitations ! 🎉',
            `La Squad ${squad.squadNumber} a complété toutes ses tâches !`
          );
        }
      } catch (error) {
        console.error('Error auto-updating completion:', error);
      }
    }
  }

  // Export methods
  toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  exportRelease(format: 'markdown' | 'html'): void {
    if (!this.release) return;

    this.exportMenuOpen = false;

    let content = '';
    const fileName = `${this.release.name.replace(/\s+/g, '_')}`;

    if (format === 'markdown') {
      content = this.generateMarkdown(this.release);
      this.downloadFile(content, `${fileName}.md`, 'text/markdown');
    } else {
      content = this.generateHTML(this.release);
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
    release.squads.forEach(squad => {
      md += `### Squad ${squad.squadNumber}\n\n`;
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        md += this.generateActionsMarkdown(preMepActions);
      } else if (squad.preMepEmptyConfirmed) {
        md += '_Néant_\n\n';
      } else {
        md += '_Non renseigné_\n\n';
      }
    });

    // 3. Actions Post-MEP
    md += `## Actions Post-MEP\n\n`;
    release.squads.forEach(squad => {
      md += `### Squad ${squad.squadNumber}\n\n`;
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        md += this.generateActionsMarkdown(postMepActions);
      } else if (squad.postMepEmptyConfirmed) {
        md += '_Néant_\n\n';
      } else {
        md += '_Non renseigné_\n\n';
      }
    });

    return md;
  }

  private generateActionsMarkdown(actions: Action[]): string {
    let md = '';
    const grouped = this.groupActionsByType(actions);

    // Memory Flipping
    if (grouped.memory_flipping.length > 0) {
      md += `#### Memory Flipping\n\n`;
      const headers = ['Nom du MF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.memory_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
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
      md += `#### Feature Flipping\n\n`;
      const headers = ['Nom du FF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.feature_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
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
      md += `#### Autres Actions\n\n`;
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
    release.squads.forEach(squad => {
      html += `<h3>Squad ${squad.squadNumber}</h3>`;
      const preMepActions = squad.actions.filter(a => a.phase === 'pre_mep');
      if (preMepActions.length > 0) {
        html += this.generateActionsHTML(preMepActions);
      } else if (squad.preMepEmptyConfirmed) {
        html += `<p class="empty-section">Néant</p>`;
      } else {
        html += `<p class="empty-section" style="color: #ef4444;">Non renseigné</p>`;
      }
    });

    // 3. Actions Post-MEP
    html += `<h2>Actions Post-MEP</h2>`;
    release.squads.forEach(squad => {
      html += `<h3>Squad ${squad.squadNumber}</h3>`;
      const postMepActions = squad.actions.filter(a => a.phase === 'post_mep');
      if (postMepActions.length > 0) {
        html += this.generateActionsHTML(postMepActions);
      } else if (squad.postMepEmptyConfirmed) {
        html += `<p class="empty-section">Néant</p>`;
      } else {
        html += `<p class="empty-section" style="color: #ef4444;">Non renseigné</p>`;
      }
    });

    html += '</body></html>';
    return html;
  }

  private generateActionsHTML(actions: Action[]): string {
    let html = '';
    const grouped = this.groupActionsByType(actions);

    // Memory Flipping
    if (grouped.memory_flipping.length > 0) {
      html += `<h4>Memory Flipping</h4>`;
      const headers = ['Nom du MF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.memory_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
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
      html += `<h4>Feature Flipping</h4>`;
      const headers = ['Nom du FF', 'Description', 'Thème', 'Action', 'Clients', 'Caisses', 'OS', 'Versions'];
      const rows = grouped.feature_flipping.map(a => [
        a.flipping?.ruleName || '',
        a.description || '',
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
      html += `<h4>Autres Actions</h4>`;
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
