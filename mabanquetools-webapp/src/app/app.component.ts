import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '@components/toast/toast-container.component';
import { ConfirmationModalComponent } from '@components/confirmation/confirmation-modal.component';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmationModalComponent],
  template: `
    <router-outlet></router-outlet>
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
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Appliquer le thème de l'utilisateur au démarrage
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.applyTheme(user.themePreference);
      }
    });
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
