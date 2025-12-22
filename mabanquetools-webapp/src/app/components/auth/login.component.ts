import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="h-screen flex items-center justify-center p-4">
      <!-- Content Container -->
      <div class="w-full max-w-md relative z-10 perspective-1000">
        
        <!-- Glass Card -->
        <div class="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-2xl dark:shadow-black/50 p-8 md:p-10 transition-all duration-300 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-900/20">
          
          <!-- Header / Logo -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 shadow-lg shadow-emerald-500/20 mb-6 transform hover:scale-105 transition-transform duration-300">
              <span class="material-icons text-white text-4xl">calendar_month</span>
            </div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Ma Banque Tools</h1>
            <p class="text-slate-500 dark:text-slate-400">Connectez-vous à votre espace</p>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Email Input -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                Adresse email
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-icons text-slate-400 group-focus-within:text-emerald-500 transition-colors">email</span>
                </div>
                <input
                  id="email"
                  type="text"
                  [(ngModel)]="email"
                  name="email"
                  required
                  autocomplete="email"
                  class="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200"
                  placeholder="nom@exemple.com"
                  [class.border-red-500]="showError"
                  [class.focus:border-red-500]="showError"
                  [class.focus:ring-red-500]="showError"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                Mot de passe
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="material-icons text-slate-400 group-focus-within:text-emerald-500 transition-colors">lock</span>
                </div>
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  class="block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200"
                  placeholder="••••••••"
                  [class.border-red-500]="showError"
                  [class.focus:border-red-500]="showError"
                  [class.focus:ring-red-500]="showError"
                  (keydown.enter)="onSubmit()"
                />
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center space-x-3 animate-fade-in">
               <span class="material-icons text-red-500 text-sm">error_outline</span>
               <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <span class="relative z-10 flex items-center justify-center space-x-2">
                <span *ngIf="!isLoading">Se connecter</span>
                <span *ngIf="isLoading" class="flex items-center space-x-2">
                  <span class="animate-spin material-icons text-base">refresh</span>
                  <span>Connexion en cours...</span>
                </span>
              </span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-8 text-center">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Pas encore de compte ?
              <a routerLink="/register" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold hover:underline transition-colors ml-1">
                Créer un compte
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8">
          <p class="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">
            © 2025 DSI BANCAIRE
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
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  showError = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async onSubmit(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      this.showError = true;
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.errorMessage = '';

    const result = await this.authService.login(this.email, this.password);

    this.isLoading = false;

    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.showError = true;
      this.errorMessage = result.message;
      this.password = '';
    }
  }
}
