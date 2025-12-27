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
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      
      <!-- Animated Background Blobs -->
      <!-- Animated Background Blobs -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-72 h-72 bg-vibrant-400 rounded-full filter blur-3xl opacity-20 animate-wander-1 will-change-transform"></div>
        <div class="absolute top-0 right-1/4 w-72 h-72 bg-planning-blue-500 rounded-full filter blur-3xl opacity-20 animate-wander-2 animation-delay-200 will-change-transform"></div>
        <div class="absolute -bottom-32 left-1/3 w-72 h-72 bg-teal-400 rounded-full filter blur-3xl opacity-20 animate-wander-3 animation-delay-400 will-change-transform"></div>
      </div>

      <div class="w-full max-w-md relative z-10 perspective-1000">
        
        <!-- Glass Card -->
        <div class="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-3xl shadow-2xl dark:shadow-black/50 p-8 md:p-10 transition-all duration-300 hover:shadow-emerald-500/30 dark:hover:shadow-emerald-900/30 hover:-translate-y-1">
          
          <!-- Header / Logo -->
          <div class="text-center mb-10">
            <img src="assets/logo.png" alt="Logo" class="mx-auto block w-24 h-24 mb-6 transform hover:scale-105 transition-transform duration-300 rounded-2xl shadow-lg shadow-emerald-500/20">
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Ma Banque Tools</h1>
            <p class="text-slate-500 dark:text-slate-400">Créer un compte</p>
          </div>

          <!-- Register Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Email Input -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                Identifiant
              </label>
              <div class="relative group flex items-center">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <span class="material-icons text-slate-400 group-focus-within:text-emerald-500 transition-colors">person</span>
                </div>
                <div class="flex w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 dark:focus-within:border-emerald-400 transition-all duration-200">
                  <input
                    id="email"
                    type="text"
                    [(ngModel)]="emailPrefix"
                    name="email"
                    required
                    autocomplete="nickname"
                    class="block flex-1 w-auto min-w-0 pl-11 pr-2 py-3 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="prenom.nom"
                    [class.text-red-500]="showError && !emailPrefix"
                  />
                  <div class="bg-slate-100 dark:bg-slate-700/50 px-4 py-3 text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 font-medium select-none whitespace-nowrap flex-shrink-0">
                    &#64;ca-ts.fr
                  </div>
                </div>
              </div>
              <p class="ml-1 text-xs text-slate-500 dark:text-slate-400">
                Format suggéré: prenom.nom
              </p>
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                Mot de passe
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <span class="material-icons text-slate-400 group-focus-within:text-emerald-500 transition-colors">lock</span>
                </div>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="new-password"
                  class="block w-full pl-11 pr-12 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200"
                  placeholder="Entrez votre mot de passe"
                  [class.border-red-500]="showError && !password"
                  [class.focus:border-red-500]="showError && !password"
                  [class.focus:ring-red-500]="showError && !password"
                />
                
                 <!-- Password Toggle -->
                <button 
                  type="button" 
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer transition-colors"
                  tabindex="-1"
                >
                  <span class="material-icons text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-start space-x-3 animate-fade-in">
               <span class="material-icons text-red-500 text-sm mt-0.5">error_outline</span>
               <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-start space-x-3 animate-fade-in">
               <span class="material-icons text-emerald-500 text-sm mt-0.5">check_circle_outline</span>
               <p class="text-sm text-emerald-600 dark:text-emerald-400">{{ successMessage }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none group"
            >
              <!-- Shine Effect -->
              <div class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>

              <span class="relative z-10 flex items-center justify-center space-x-2">
                <span *ngIf="!isLoading">Créer mon compte</span>
                <span *ngIf="isLoading" class="flex items-center space-x-2">
                  <span class="animate-spin material-icons text-base">refresh</span>
                  <span>Création en cours...</span>
                </span>
              </span>
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-8 text-center">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Vous avez déjà un compte ?
              <a routerLink="/login" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold hover:underline transition-colors ml-1">
                Se connecter
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 relative z-10">
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
export class RegisterComponent {
  emailPrefix = '';
  password = '';

  isLoading = false;
  showError = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async onSubmit(): Promise<void> {
    this.showError = false;
    this.errorMessage = '';
    this.successMessage = '';

    // Validations basiques
    if (!this.emailPrefix.trim() || !this.password.trim()) {
      this.showError = true;
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;

    // Construct full email
    const fullEmail = this.emailPrefix.includes('@')
      ? this.emailPrefix
      : `${this.emailPrefix}@ca-ts.fr`;

    const result = await this.authService.register(fullEmail, this.password);

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
