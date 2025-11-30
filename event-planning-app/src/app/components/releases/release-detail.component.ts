import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReleaseService } from '@services/release.service';
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

@Component({
  selector: 'app-release-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6" *ngIf="release">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            (click)="goBack()"
            class="btn btn-secondary flex items-center space-x-2"
          >
            <span class="material-icons">arrow_back</span>
            <span>Retour</span>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ release.name }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              Version {{ release.version }} • {{ formatDate(release.releaseDate) }}
            </p>
          </div>
        </div>
        <span
          class="px-3 py-1 text-sm font-semibold text-white rounded"
          [ngClass]="STATUS_COLORS[release.status]"
        >
          {{ STATUS_LABELS[release.status] }}
        </span>
      </div>

      <!-- Description -->
      <div class="card p-6" *ngIf="release.description">
        <p class="text-gray-700 dark:text-gray-300">{{ release.description }}</p>
      </div>

      <!-- Squads -->
      <div class="space-y-4">
        <div *ngFor="let squad of release.squads" class="card">
          <!-- Squad Header -->
          <div
            class="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors"
            [ngClass]="{
              'bg-green-100 dark:bg-green-900/30': squad.isCompleted,
              'bg-orange-100/50 dark:bg-orange-900/20': !squad.isCompleted
            }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3 flex-1">
                <span class="material-icons text-primary-600 dark:text-primary-400">groups</span>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Squad {{ squad.squadNumber }}</h2>

                <!-- Tonton MEP Field -->
                <div class="flex items-center space-x-2 ml-4">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Tonton MEP:</span>
                  <input
                    type="text"
                    [value]="squad.tontonMep || ''"
                    (blur)="updateTontonMep(squad.id!, $event)"
                    (click)="$event.stopPropagation()"
                    placeholder="Non assigné"
                    class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <!-- Completion Indicator -->
                <div class="flex items-center space-x-2 ml-4">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="squad.isCompleted"
                      (change)="toggleCompletion(squad.id!, $event)"
                      (click)="$event.stopPropagation()"
                      class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span class="text-sm text-gray-600 dark:text-gray-400">Complétée</span>
                  </label>
                  <span *ngIf="squad.isCompleted" class="material-icons text-green-600 dark:text-green-400 text-lg">
                    check_circle
                  </span>
                </div>
              </div>

              <button
                (click)="toggleSquad(squad.squadNumber)"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <span class="material-icons text-gray-500">
                  {{ expandedSquads.has(squad.squadNumber) ? 'expand_less' : 'expand_more' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Squad Content -->
          <div *ngIf="expandedSquads.has(squad.squadNumber)" class="p-6 pt-0 space-y-6">
            <!-- Features Section -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Fonctionnalités majeures</h3>
                <button
                  (click)="startAddingFeature(squad)"
                  class="btn btn-sm btn-primary flex items-center space-x-1"
                >
                  <span class="material-icons text-sm">add</span>
                  <span>Ajouter</span>
                </button>
              </div>

              <!-- Add Feature Form -->
              <div *ngIf="addingFeatureToSquad?.id === squad.id" class="mb-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="space-y-2">
                  <input
                    type="text"
                    [(ngModel)]="newFeature.title"
                    placeholder="Titre de la fonctionnalité"
                    class="input text-sm"
                  />
                  <textarea
                    [(ngModel)]="newFeature.description"
                    placeholder="Description (optionnel)"
                    rows="2"
                    class="input text-sm"
                  ></textarea>
                  <div class="flex space-x-2">
                    <button (click)="addFeature(squad.id!)" class="btn btn-primary btn-sm">Enregistrer</button>
                    <button (click)="cancelAddFeature()" class="btn btn-secondary btn-sm">Annuler</button>
                  </div>
                </div>
              </div>

              <!-- Features List -->
              <div class="space-y-2">
                <div
                  *ngFor="let feature of squad.features"
                  class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start justify-between"
                >
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 dark:text-white">{{ feature.title }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1" *ngIf="feature.description">
                      {{ feature.description }}
                    </p>
                  </div>
                  <button
                    (click)="deleteFeature(feature.id!)"
                    class="text-red-600 dark:text-red-400 hover:text-red-700"
                  >
                    <span class="material-icons text-sm">delete</span>
                  </button>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-2" *ngIf="squad.features.length === 0">
                  Aucune fonctionnalité ajoutée
                </p>
              </div>
            </div>

            <!-- Actions Pre-MEP -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actions Pré-MEP</h3>
                <button
                  (click)="startAddingAction(squad, 'pre_mep')"
                  class="btn btn-sm btn-primary flex items-center space-x-1"
                >
                  <span class="material-icons text-sm">add</span>
                  <span>Ajouter</span>
                </button>
              </div>

              <!-- Add Action Form -->
              <div *ngIf="addingActionToSquad?.id === squad.id && addingActionPhase === 'pre_mep'"
                   class="mb-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <form (submit)="addAction(squad.id!, 'pre_mep', $event)" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'action</label>
                    <select [(ngModel)]="newAction.type" name="type" (change)="onActionTypeChange()" required class="input text-sm">
                      <option value="">Sélectionner un type</option>
                      <option value="topic_creation">{{ ACTION_TYPE_LABELS['topic_creation'] }}</option>
                      <option value="database_update">{{ ACTION_TYPE_LABELS['database_update'] }}</option>
                      <option value="vault_credentials">{{ ACTION_TYPE_LABELS['vault_credentials'] }}</option>
                      <option value="feature_flipping">{{ ACTION_TYPE_LABELS['feature_flipping'] }}</option>
                      <option value="memory_flipping">{{ ACTION_TYPE_LABELS['memory_flipping'] }}</option>
                      <option value="other">{{ ACTION_TYPE_LABELS['other'] }}</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    [(ngModel)]="newAction.title"
                    name="title"
                    placeholder="Titre de l'action"
                    required
                    class="input text-sm"
                  />
                  <textarea
                    *ngIf="newAction.type !== 'feature_flipping' && newAction.type !== 'memory_flipping'"
                    [(ngModel)]="newAction.description"
                    name="description"
                    placeholder="Description (optionnel)"
                    rows="2"
                    class="input text-sm"
                  ></textarea>

                  <!-- Feature Flipping / Memory Flipping Form -->
                  <div *ngIf="newAction.type === 'feature_flipping' || newAction.type === 'memory_flipping'" class="space-y-3 p-3 border border-gray-300 dark:border-gray-600 rounded">
                    <h4 class="font-medium text-gray-900 dark:text-white text-sm">Configuration {{ newAction.type === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping' }}</h4>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la règle</label>
                      <input
                        type="text"
                        [(ngModel)]="newAction.flipping.ruleName"
                        name="ruleName"
                        required
                        class="input text-sm"
                        placeholder="Ex: FEATURE_NEW_DASHBOARD"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                      <select [(ngModel)]="newAction.flipping.ruleAction" name="ruleAction" required class="input text-sm">
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
                          class="input text-sm"
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
                          class="input text-sm"
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
                          class="input text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-2">
                    <button type="submit" class="btn btn-primary btn-sm">Enregistrer</button>
                    <button type="button" (click)="cancelAddAction()" class="btn btn-secondary btn-sm">Annuler</button>
                  </div>
                </form>
              </div>

              <!-- Actions List -->
              <div class="space-y-4">
                <!-- Non-flipping actions -->
                <div class="space-y-2" *ngIf="getNonFlippingActions(squad, 'pre_mep').length > 0">
                  <div
                    *ngFor="let action of getNonFlippingActions(squad, 'pre_mep')"
                    class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2">
                          <span class="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {{ getActionTypeLabel(action.type) }}
                          </span>
                          <h4 class="font-medium text-gray-900 dark:text-white">
                            {{ action.title }}
                          </h4>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1" *ngIf="action.description">
                          {{ action.description }}
                        </p>
                      </div>
                      <button
                        (click)="deleteAction(action.id!)"
                        class="text-red-600 dark:text-red-400 hover:text-red-700"
                      >
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Flipping actions grouped by type in tables -->
                <div *ngFor="let entry of getFlippingActionsByType(squad, 'pre_mep') | keyvalue" class="overflow-x-auto">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ getActionTypeLabel(entry.key) }}</h4>
                  <table class="min-w-full text-xs border border-gray-300 dark:border-gray-600 rounded">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Règle</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Action</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Clients</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Caisses</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">OS</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Versions</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900">
                      <tr *ngFor="let action of entry.value" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td class="px-2 py-2" [class.line-through]="action.status === 'completed'">{{ action.flipping?.ruleName }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400" [class.line-through]="action.status === 'completed'">{{ getRuleActionLabel(action.flipping?.ruleAction || '') }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingCaissesDisplay(action.flipping?.targetCaisses) }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingOSDisplay(action.flipping?.targetOS || []) }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingVersionsDisplay(action.flipping?.targetVersions || []) }}</td>
                        <td class="px-2 py-2">
                          <button
                            (click)="deleteAction(action.id!)"
                            class="text-red-600 dark:text-red-400 hover:text-red-700"
                          >
                            <span class="material-icons text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-2" *ngIf="getActionsByPhase(squad, 'pre_mep').length === 0">
                  Aucune action pré-MEP
                </p>
              </div>
            </div>

            <!-- Actions Post-MEP -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actions Post-MEP</h3>
                <button
                  (click)="startAddingAction(squad, 'post_mep')"
                  class="btn btn-sm btn-primary flex items-center space-x-1"
                >
                  <span class="material-icons text-sm">add</span>
                  <span>Ajouter</span>
                </button>
              </div>

              <!-- Add Action Form (Post-MEP) -->
              <div *ngIf="addingActionToSquad?.id === squad.id && addingActionPhase === 'post_mep'"
                   class="mb-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <!-- Same form as Pre-MEP -->
                <form (submit)="addAction(squad.id!, 'post_mep', $event)" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'action</label>
                    <select [(ngModel)]="newAction.type" name="type" (change)="onActionTypeChange()" required class="input text-sm">
                      <option value="">Sélectionner un type</option>
                      <option value="topic_creation">{{ ACTION_TYPE_LABELS['topic_creation'] }}</option>
                      <option value="database_update">{{ ACTION_TYPE_LABELS['database_update'] }}</option>
                      <option value="vault_credentials">{{ ACTION_TYPE_LABELS['vault_credentials'] }}</option>
                      <option value="feature_flipping">{{ ACTION_TYPE_LABELS['feature_flipping'] }}</option>
                      <option value="memory_flipping">{{ ACTION_TYPE_LABELS['memory_flipping'] }}</option>
                      <option value="other">{{ ACTION_TYPE_LABELS['other'] }}</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    [(ngModel)]="newAction.title"
                    name="title"
                    placeholder="Titre de l'action"
                    required
                    class="input text-sm"
                  />
                  <textarea
                    *ngIf="newAction.type !== 'feature_flipping' && newAction.type !== 'memory_flipping'"
                    [(ngModel)]="newAction.description"
                    name="description"
                    placeholder="Description (optionnel)"
                    rows="2"
                    class="input text-sm"
                  ></textarea>

                  <!-- Feature Flipping / Memory Flipping Form -->
                  <div *ngIf="newAction.type === 'feature_flipping' || newAction.type === 'memory_flipping'" class="space-y-3 p-3 border border-gray-300 dark:border-gray-600 rounded">
                    <h4 class="font-medium text-gray-900 dark:text-white text-sm">Configuration {{ newAction.type === 'feature_flipping' ? 'Feature Flipping' : 'Memory Flipping' }}</h4>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la règle</label>
                      <input
                        type="text"
                        [(ngModel)]="newAction.flipping.ruleName"
                        name="ruleName"
                        required
                        class="input text-sm"
                        placeholder="Ex: FEATURE_NEW_DASHBOARD"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                      <select [(ngModel)]="newAction.flipping.ruleAction" name="ruleAction" required class="input text-sm">
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
                          class="input text-sm"
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
                          class="input text-sm"
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
                          class="input text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="flex space-x-2">
                    <button type="submit" class="btn btn-primary btn-sm">Enregistrer</button>
                    <button type="button" (click)="cancelAddAction()" class="btn btn-secondary btn-sm">Annuler</button>
                  </div>
                </form>
              </div>

              <!-- Actions List (Post-MEP) -->
              <div class="space-y-4">
                <!-- Non-flipping actions -->
                <div class="space-y-2" *ngIf="getNonFlippingActions(squad, 'post_mep').length > 0">
                  <div
                    *ngFor="let action of getNonFlippingActions(squad, 'post_mep')"
                    class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2">
                          <span class="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                            {{ getActionTypeLabel(action.type) }}
                          </span>
                          <h4 class="font-medium text-gray-900 dark:text-white">
                            {{ action.title }}
                          </h4>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1" *ngIf="action.description">
                          {{ action.description }}
                        </p>
                      </div>
                      <button
                        (click)="deleteAction(action.id!)"
                        class="text-red-600 dark:text-red-400 hover:text-red-700"
                      >
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Flipping actions grouped by type in tables -->
                <div *ngFor="let entry of getFlippingActionsByType(squad, 'post_mep') | keyvalue" class="overflow-x-auto">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ getActionTypeLabel(entry.key) }}</h4>
                  <table class="min-w-full text-xs border border-gray-300 dark:border-gray-600 rounded">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Règle</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Action</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Clients</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Caisses</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">OS</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600">Versions</th>
                        <th class="px-2 py-1 text-left border-b border-gray-300 dark:border-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-900">
                      <tr *ngFor="let action of entry.value" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td class="px-2 py-2" [class.line-through]="action.status === 'completed'">{{ action.flipping?.ruleName }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400" [class.line-through]="action.status === 'completed'">{{ getRuleActionLabel(action.flipping?.ruleAction || '') }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingClientsDisplay(action.flipping?.targetClients || []) }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingCaissesDisplay(action.flipping?.targetCaisses) }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingOSDisplay(action.flipping?.targetOS || []) }}</td>
                        <td class="px-2 py-2 text-gray-600 dark:text-gray-400">{{ getFlippingVersionsDisplay(action.flipping?.targetVersions || []) }}</td>
                        <td class="px-2 py-2">
                          <button
                            (click)="deleteAction(action.id!)"
                            class="text-red-600 dark:text-red-400 hover:text-red-700"
                          >
                            <span class="material-icons text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-2" *ngIf="getActionsByPhase(squad, 'post_mep').length === 0">
                  Aucune action post-MEP
                </p>
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
  `]

})
export class ReleaseDetailComponent implements OnInit {
  release: Release | null = null;
  expandedSquads = new Set<number>();

  // Feature form
  addingFeatureToSquad: Squad | null = null;
  newFeature: CreateFeatureDto = { title: '', description: '' };

  // Action form
  addingActionToSquad: Squad | null = null;
  addingActionPhase: ActionPhase | null = null;
  newAction: any = {
    type: '',
    title: '',
    description: '',
    flipping: {
      flippingType: '',
      ruleName: '',
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
    private releaseService: ReleaseService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        this.release = await this.releaseService.getRelease(id);
        // Expand first squad by default
        if (this.release.squads.length > 0) {
          this.expandedSquads.add(this.release.squads[0].squadNumber);
        }
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

  toggleSquad(squadNumber: number): void {
    if (this.expandedSquads.has(squadNumber)) {
      this.expandedSquads.delete(squadNumber);
    } else {
      this.expandedSquads.add(squadNumber);
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

  // Feature methods
  startAddingFeature(squad: Squad): void {
    this.addingFeatureToSquad = squad;
    this.newFeature = { title: '', description: '' };
  }

  async addFeature(squadId: string): Promise<void> {
    if (!this.newFeature.title.trim()) return;

    try {
      await this.releaseService.addFeature(squadId, this.newFeature);
      await this.loadRelease();
      this.cancelAddFeature();
    } catch (error) {
      console.error('Error adding feature:', error);
      alert('Erreur lors de l\'ajout de la fonctionnalité');
    }
  }

  cancelAddFeature(): void {
    this.addingFeatureToSquad = null;
    this.newFeature = { title: '', description: '' };
  }

  async deleteFeature(featureId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fonctionnalité ?')) return;

    try {
      await this.releaseService.deleteFeature(featureId);
      await this.loadRelease();
    } catch (error) {
      console.error('Error deleting feature:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // Action methods
  startAddingAction(squad: Squad, phase: ActionPhase): void {
    this.addingActionToSquad = squad;
    this.addingActionPhase = phase;
    this.resetActionForm();
  }

  resetActionForm(): void {
    this.newAction = {
      type: '',
      title: '',
      description: '',
      flipping: {
        flippingType: '',
        ruleName: '',
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

    if (!this.newAction.type || !this.newAction.title.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation feature flipping or memory flipping
    if (this.newAction.type === 'feature_flipping' || this.newAction.type === 'memory_flipping') {
      if (!this.newAction.flipping.ruleName?.trim() || !this.newAction.flipping.ruleAction?.trim()) {
        alert('Veuillez remplir tous les champs obligatoires du Feature/Memory Flipping');
        return;
      }
    }

    try {
      const actionDto: CreateActionDto = {
        phase,
        type: this.newAction.type as ActionType,
        title: this.newAction.title,
        description: this.newAction.description || undefined
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
          ruleAction: this.newAction.flipping.ruleAction as RuleAction,
          targetClients,
          targetCaisses,
          targetOS,
          targetVersions
        };
      }

      await this.releaseService.addAction(squadId, actionDto);
      await this.loadRelease();
      this.cancelAddAction();
    } catch (error) {
      console.error('Error adding action:', error);
      alert('Erreur lors de l\'ajout de l\'action');
    }
  }

  cancelAddAction(): void {
    this.addingActionToSquad = null;
    this.addingActionPhase = null;
    this.resetActionForm();
  }

  async deleteAction(actionId: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) return;

    try {
      await this.releaseService.deleteAction(actionId);
      await this.loadRelease();
    } catch (error) {
      console.error('Error deleting action:', error);
      alert('Erreur lors de la suppression');
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

  // Squad management methods
  async updateTontonMep(squadId: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const tontonMep = input.value.trim();

    try {
      await this.releaseService.updateSquadTontonMep(squadId, tontonMep);
      await this.loadRelease();
    } catch (error) {
      console.error('Error updating Tonton MEP:', error);
      alert('Erreur lors de la mise à jour du Tonton MEP');
    }
  }

  async toggleCompletion(squadId: string, event: Event): Promise<void> {
    const checkbox = event.target as HTMLInputElement;
    const isCompleted = checkbox.checked;

    try {
      await this.releaseService.toggleSquadCompletion(squadId, isCompleted);
      await this.loadRelease();
    } catch (error) {
      console.error('Error toggling squad completion:', error);
      alert('Erreur lors de la mise à jour de la complétude');
    }
  }
}
