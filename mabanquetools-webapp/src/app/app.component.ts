import { Component, OnInit } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '@components/toast/toast-container.component';
import { ConfirmationModalComponent } from '@components/confirmation/confirmation-modal.component';
import { AuthService } from '@services/auth.service';
import { routeAnimations } from './animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmationModalComponent],
  animations: [routeAnimations],
  template: `
    <!-- Global Ambient Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen dark:bg-emerald-500/20"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen dark:bg-teal-500/20"></div>
        <div class="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen dark:bg-cyan-500/20"></div>
    </div>

    <!-- Main Content with Animation -->
    <main [@routeAnimations]="getRouteAnimationData()">
      <router-outlet></router-outlet>
    </main>

    <app-toast-container></app-toast-container>
    <app-confirmation-modal></app-confirmation-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private contexts: ChildrenOutletContexts
  ) { }

  ngOnInit(): void {
    // Appliquer le thème de l'utilisateur au démarrage
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.applyTheme(user.themePreference);
      }
    });
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
}
