import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div class="w-full max-w-md">
        <!-- Logo/Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-gray-750 rounded-full shadow-xl mb-4">
            <span class="material-icons text-5xl text-primary-600 dark:text-primary-400">calendar_month</span>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Ma Banque Tools</h1>
          <p class="text-primary-100 dark:text-gray-400">Créer un compte</p>
        </div>

        <!-- Register Form -->
        <div class="bg-gray-50 dark:bg-gray-750 rounded-2xl shadow-2xl p-8">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Inscription</h2>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse email
              </label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  email
                </span>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  autocomplete="email"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition"
                  placeholder="Votre adresse email"
                  [class.border-red-500]="showError && !email"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format requis: prenom.nom@ca-ts.fr
              </p>
            </div>

            <!-- Password Input -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="new-password"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition"
                  placeholder="Entrez votre mot de passe"
                  [class.border-red-500]="showError && !password"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum 8 caractères alphanumériques avec au moins une lettre et un chiffre
              </p>
            </div>

            <!-- Confirm Password Input -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  autocomplete="new-password"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition"
                  placeholder="Confirmez votre mot de passe"
                  [class.border-red-500]="showError && password !== confirmPassword"
                />
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-start space-x-2">
                <span class="material-icons text-red-600 dark:text-red-400 text-sm mt-0.5">error</span>
                <p class="text-sm text-red-800 dark:text-red-300">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="flex items-start space-x-2">
                <span class="material-icons text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                <p class="text-sm text-green-800 dark:text-green-300">{{ successMessage }}</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading">Créer mon compte</span>
              <span *ngIf="isLoading" class="flex items-center space-x-2">
                <span class="animate-spin material-icons">refresh</span>
                <span>Création en cours...</span>
              </span>
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte?
              <a routerLink="/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Se connecter
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8">
          <p class="text-sm text-primary-100 dark:text-gray-500">
            © 2025 DSI Bancaire - Tous droits réservés
          </p>
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
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  showError = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async onSubmit(): Promise<void> {
    this.showError = false;
    this.errorMessage = '';
    this.successMessage = '';

    // Validations basiques
    if (!this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.showError = true;
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showError = true;
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;

    const result = await this.authService.register(this.email, this.password);

    this.isLoading = false;

    if (result.success) {
      this.successMessage = result.message + ' - Redirection vers la page de connexion...';

      // Rediriger vers la page de login après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.showError = true;
      this.errorMessage = result.message;
    }
  }
}
