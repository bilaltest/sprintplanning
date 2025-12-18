import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfirmationOptions } from '@models/confirmation.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new BehaviorSubject<ConfirmationOptions | null>(null);
  public confirmation$ = this.confirmationSubject.asObservable();

  private resolveFunction?: (value: boolean) => void;

  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveFunction = resolve;
      this.confirmationSubject.next(options);
    });
  }

  respond(confirmed: boolean): void {
    if (this.resolveFunction) {
      this.resolveFunction(confirmed);
      this.resolveFunction = undefined;
    }
    this.confirmationSubject.next(null);
  }

  dismiss(): void {
    this.respond(false);
  }
}
