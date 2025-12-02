import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '@components/toast/toast-container.component';
import { ConfirmationModalComponent } from '@components/confirmation/confirmation-modal.component';

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
export class AppComponent {}
