import { Directive, Input, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionService, PermissionModule, PermissionLevel } from '@services/permission.service';

/**
 * Directive structurelle pour afficher/masquer des éléments selon les permissions
 *
 * Usage:
 * - *hasPermission="'CALENDAR'" : Affiche si l'utilisateur a au moins READ sur CALENDAR
 * - *hasPermission="'RELEASES'; level: 'WRITE'" : Affiche uniquement si WRITE sur RELEASES
 * - *hasPermission="'ADMIN'; level: 'NONE'" : Affiche uniquement si NONE sur ADMIN (inverse)
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() hasPermission!: PermissionModule;
  @Input() hasPermissionLevel: 'READ' | 'WRITE' | 'NONE' = 'READ';

  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements de permissions
    this.permissionService.permissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });

    // Vérifier initialement
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      // Afficher l'élément
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      // Masquer l'élément
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    const permissions = this.permissionService.getCurrentUserPermissions();
    if (!permissions) {
      return false;
    }

    const userLevel = permissions[this.hasPermission];

    // Cas spécial: si on demande level 'NONE', on inverse la logique
    if (this.hasPermissionLevel === 'NONE') {
      return userLevel === 'NONE';
    }

    // Vérifier si l'utilisateur a le niveau requis
    switch (this.hasPermissionLevel) {
      case 'WRITE':
        return userLevel === 'WRITE';
      case 'READ':
        return userLevel === 'READ' || userLevel === 'WRITE';
      default:
        return false;
    }
  }
}
