import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '@services/sidebar.service';
import { AuthService, User } from '@services/auth.service';
import { PermissionService, PermissionModule } from '@services/permission.service';
import { ToastService } from '@services/toast.service';
import { EasterEggModalComponent } from './easter-egg-modal.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  isActive?: boolean;
  requiredModule?: PermissionModule;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EasterEggModalComponent],
  template: `
    <!-- Easter Egg Modal -->
    <app-easter-egg-modal #easterEggModal (closed)="onEasterEggClosed()"></app-easter-egg-modal>

    <!-- Mobile backdrop overlay -->
    <div
      *ngIf="isMobileMenuOpen && isMobile"
      class="sidebar-backdrop"
      (click)="closeMobileMenu()"
    ></div>

    <aside
      class="sidebar"
      [class.collapsed]="isCollapsed && !isMobile"
      [class.mobile-open]="isMobileMenuOpen"
      [class.mobile-closed]="!isMobileMenuOpen && isMobile"
    >
      <!-- Logo / Brand -->
      <div class="sidebar-header" [class.collapsed]="isCollapsed && !isMobile">
        <div class="flex items-center space-x-3" *ngIf="!isCollapsed || isMobile">
          <img src="assets/logo.png" alt="Logo" class="w-10 h-10 rounded-lg shadow-sm">
          <div>
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">Ma Banque</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">Tools</p>
          </div>
        </div>

        <!-- Toggle button (desktop) / Close button (mobile) -->
        <button
          (click)="isMobile ? closeMobileMenu() : toggleSidebar()"
          class="toggle-btn"
          [title]="isMobile ? 'Fermer le menu' : (isCollapsed ? 'Ouvrir la sidebar' : 'Fermer la sidebar')"
        >
          <span class="material-icons text-gray-600 dark:text-gray-300">
            {{ isMobile ? 'close' : (isCollapsed ? 'chevron_right' : 'chevron_left') }}
          </span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a
          *ngFor="let item of visibleNavItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact: item.route === '/home'}"
          class="nav-item"
          [class.collapsed]="isCollapsed && !isMobile"
          [title]="(isCollapsed && !isMobile) ? item.label : ''"
          (click)="onNavItemClick()"
        >
          <span class="material-icons">{{ item.icon }}</span>
          <span *ngIf="!isCollapsed || isMobile" class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <!-- Footer (User info + Actions) -->
      <div class="sidebar-footer" id="sidebar-bottom">
        <!-- User Info -->
        <div *ngIf="currentUser" class="user-info mb-3" [class.collapsed]="isCollapsed && !isMobile">
          <div *ngIf="!isCollapsed || isMobile" class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span class="text-white font-semibold text-sm">
                  {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ currentUser.firstName }} {{ currentUser.lastName }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ currentUser.email }}
                </p>
              </div>
            </div>
          </div>
          <div *ngIf="isCollapsed && !isMobile" class="flex justify-center">
            <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span class="text-white font-semibold text-sm">
                {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <button
          (click)="toggleDarkMode()"
          class="nav-item w-full"
          [class.collapsed]="isCollapsed && !isMobile"
          [title]="(isCollapsed && !isMobile) ? 'Changer de thème' : ''"
        >
          <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          <span *ngIf="!isCollapsed || isMobile" class="nav-label">
            {{ isDark ? 'Mode clair' : 'Mode sombre' }}
          </span>
        </button>

        <!-- Change Password Button -->
        <button
          *ngIf="!currentUser?.cannotChangePassword"
          (click)="openPasswordModal()"
          class="nav-item w-full"
          [class.collapsed]="isCollapsed && !isMobile"
          [title]="(isCollapsed && !isMobile) ? 'Modifier mot de passe' : ''"
        >
          <span class="material-icons">lock_reset</span>
          <span *ngIf="!isCollapsed || isMobile" class="nav-label">Mot de passe</span>
        </button>

        <!-- Logout Button -->
        <button
          (click)="logout()"
          class="nav-item w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          [class.collapsed]="isCollapsed && !isMobile"
          [title]="(isCollapsed && !isMobile) ? 'Se déconnecter' : ''"
        >
          <span class="material-icons">logout</span>
          <span *ngIf="!isCollapsed || isMobile" class="nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Password Change Modal -->
    <div *ngIf="showPasswordModal" class="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black bg-opacity-50" (click)="closePasswordModal()"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modifier mon mot de passe</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
          <input
            type="password" 
            [(ngModel)]="newPassword" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Nouveau mot de passe"
            (keyup.enter)="changePassword()"
          >
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            (click)="closePasswordModal()" 
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            [disabled]="isLoading"
          >
            Annuler
          </button>
          <button 
            (click)="changePassword()" 
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50"
            [disabled]="!newPassword || isLoading"
          >
            {{ isLoading ? 'Modification...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Base sidebar styles */
    .sidebar {
      @apply fixed left-0 top-0 h-screen bg-white dark:bg-gray-750 border-r border-gray-200 dark:border-gray-600 flex flex-col;
      width: 280px;
      overflow: hidden;
      z-index: 1000;
      transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
    }

    /* Desktop: Collapsed state */
    @media (min-width: 1024px) {
      .sidebar.collapsed {
        width: 72px;
      }
    }

    /* Mobile: Hidden by default, slide in when open */
    @media (max-width: 640px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
        width: 280px;
      }
    }

    /* Tablet (iPad Portrait): Auto-collapsed to icons only */
    @media (min-width: 641px) and (max-width: 1023px) {
      .sidebar {
        width: 72px;
      }
    }

    /* Backdrop for mobile */
    .sidebar-backdrop {
      @apply fixed inset-0 bg-black bg-opacity-50 z-[999];
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .sidebar-header {
      @apply p-6 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between;
      white-space: nowrap;
    }

    /* Desktop collapsed header */
    @media (min-width: 1024px) {
      .sidebar-header.collapsed {
        @apply justify-center p-4;
      }
    }

    /* Tablet: Always show collapsed header */
    @media (min-width: 641px) and (max-width: 1023px) {
      .sidebar-header {
        @apply justify-center p-4;
      }
    }

    .toggle-btn {
      @apply p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors;
    }

    .sidebar-nav {
      @apply flex-1 py-6 px-3 space-y-1 overflow-y-auto;
    }

    .nav-item {
      @apply flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer;
    }

    /* Desktop collapsed nav items */
    @media (min-width: 1024px) {
      .nav-item.collapsed {
        @apply justify-center px-0;
      }
    }

    /* Tablet: Always show collapsed nav items */
    @media (min-width: 641px) and (max-width: 1023px) {
      .nav-item {
        @apply justify-center px-0;
      }
    }

    .nav-item.active {
      @apply bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium;
    }

    .nav-item .material-icons {
      @apply text-xl;
    }

    .nav-label {
      @apply text-sm;
    }

    .sidebar-footer {
      @apply p-3 border-t border-gray-200 dark:border-gray-600;
    }

    .user-info {
      @apply transition-all duration-200;
    }

    .user-info.collapsed {
      @apply mb-3;
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isDark = false;
  currentUser: User | null = null;
  isMobile = false;
  isMobileMenuOpen = false;

  // Password Modal
  showPasswordModal = false;
  newPassword = '';
  isLoading = false;

  navItems: NavItem[] = [
    { label: 'Accueil', icon: 'home', route: '/home' },
    { label: 'Calendrier', icon: 'calendar_month', route: '/calendar', requiredModule: 'CALENDAR' },
    { label: 'Absences', icon: 'beach_access', route: '/absences', requiredModule: 'ABSENCE' },
    { label: 'Prépa MEP', icon: 'rocket_launch', route: '/releases', requiredModule: 'RELEASES' },
    { label: 'Playground', icon: 'sports_esports', route: '/playground', requiredModule: 'PLAYGROUND' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin', requiredModule: 'ADMIN' }
  ];

  // Easter Egg Logic
  @ViewChild('easterEggModal') easterEggModal!: EasterEggModalComponent;
  private clickCount = 0;
  private lastClickTime = 0;
  private readonly CLICK_LIMIT = 10;
  private readonly TIME_LIMIT = 10000; // 10 seconds
  private firstClickTime = 0;

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private toastService: ToastService
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile = width <= 640; // Samsung S25 (360px) + iPhone 17 Pro Max (440px)

    // Auto-close mobile menu if resizing to desktop
    if (!this.isMobile && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }

    // On tablet (iPad Portrait 810px), force collapsed sidebar
    if (width > 640 && width <= 1023) {
      this.isCollapsed = true;
    }
  }

  ngOnInit(): void {
    // Subscribe to sidebar state
    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });

    // Subscribe to mobile menu state
    this.sidebarService.mobileMenuOpen$.subscribe(open => {
      this.isMobileMenuOpen = open;
    });

    // Subscribe to current user and apply their theme preference
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      if (user && user.themePreference) {
        // Appliquer la préférence de thème de l'utilisateur
        this.isDark = user.themePreference === 'dark';
        this.applyTheme(this.isDark);
      } else {
        // Fallback sur le localStorage ou le thème par défaut
        const savedTheme = localStorage.getItem('theme');
        this.isDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark');
        this.applyTheme(this.isDark);
      }

      this.updateVisibleNavItems();
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  openMobileMenu(): void {
    if (this.isMobile) {
      this.sidebarService.openMobileMenu();
    }
  }

  closeMobileMenu(): void {
    this.sidebarService.closeMobileMenu();
  }

  onNavItemClick(): void {
    // Close mobile menu when navigating
    if (this.isMobile) {
      this.closeMobileMenu();
    }
  }

  async toggleDarkMode(): Promise<void> {
    this.handleEasterEggClick();

    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';

    // Appliquer le thème immédiatement
    this.applyTheme(this.isDark);

    // Sauvegarder localement (fallback)
    localStorage.setItem('theme', theme);

    // Sauvegarder dans la base de données si l'utilisateur est connecté
    if (this.currentUser) {
      await this.authService.updatePreferences(theme);
    }
  }

  private handleEasterEggClick() {
    const now = Date.now();

    // Reset if too long has passed since first click
    if (this.clickCount === 0 || (now - this.lastClickTime > 2000)) { // Reset if more than 2s between clicks
      // Logic update: The user said "10 times in less than 10 seconds".
      // So I should track the window of time.

      if (this.clickCount === 0) {
        this.firstClickTime = now;
      }
    }

    // Check if the sequence is valid so far
    // Actually, simpler logic: 
    // If (now - firstClickTime) > 10000, reset count to 1 and reset start time.
    if (this.clickCount > 0 && (now - this.firstClickTime > this.TIME_LIMIT)) {
      this.clickCount = 0;
      this.firstClickTime = now;
    }

    if (this.clickCount === 0) {
      this.firstClickTime = now;
    }

    this.clickCount++;
    this.lastClickTime = now;

    if (this.clickCount >= this.CLICK_LIMIT) {
      // Trigger Easter Egg
      if (now - this.firstClickTime <= this.TIME_LIMIT) {
        this.triggerEasterEgg();
      }
      // Reset after triggering or failing
      this.clickCount = 0;
    }
  }

  private triggerEasterEgg() {
    // Check if user already has permissions? Or let them play anyway?
    // Playing anyway is more fun.
    this.easterEggModal.open();
  }

  onEasterEggClosed() {
    // Reset anything if needed
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  visibleNavItems: NavItem[] = [];

  private updateVisibleNavItems(): void {
    // Filtrer les items de navigation en fonction des permissions
    this.visibleNavItems = this.navItems.filter(item => {
      // Si l'item n'a pas de module requis, il est toujours visible (Accueil, Playground)
      if (!item.requiredModule) {
        return true;
      }

      // Vérifier si l'utilisateur a au moins READ sur le module requis
      return this.permissionService.hasReadAccess(item.requiredModule);
    });
  }

  isAdmin(): boolean {
    return this.permissionService.hasReadAccess('ADMIN');
  }

  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.newPassword = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.newPassword = '';
  }

  async changePassword(): Promise<void> {
    if (!this.newPassword) return;

    this.isLoading = true;
    const result = await this.authService.changePassword(this.newPassword);
    this.isLoading = false;

    if (result.success) {
      this.toastService.success('Succès', 'Mot de passe modifié. Vous allez être déconnecté.');
      this.closePasswordModal();

      // Delay logout slightly to let user see the toast
      setTimeout(() => {
        this.logout();
      }, 1500);
    } else {
      this.toastService.error('Erreur', result.message);
    }
  }
}
