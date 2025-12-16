import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  public collapsed$: Observable<boolean> = this.collapsedSubject.asObservable();

  private mobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  public mobileMenuOpen$: Observable<boolean> = this.mobileMenuOpenSubject.asObservable();

  constructor() {
    // Load initial state from localStorage
    const collapsed = localStorage.getItem('sidebarCollapsed');
    if (collapsed === 'true') {
      this.collapsedSubject.next(true);
    }
  }

  toggle(): void {
    const newState = !this.collapsedSubject.value;
    this.collapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }

  isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  openMobileMenu(): void {
    this.mobileMenuOpenSubject.next(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpenSubject.next(false);
  }

  isMobileMenuOpen(): boolean {
    return this.mobileMenuOpenSubject.value;
  }
}
