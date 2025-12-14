import { Directive, ElementRef, Input, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { PermissionService, PermissionModule } from '@services/permission.service';
import { Subscription } from 'rxjs';

/**
 * Directive pour contrôler l'accès aux boutons en fonction des permissions
 *
 * Usage:
 * <button appCanAccess="CALENDAR" accessLevel="write">Créer événement</button>
 * <button appCanAccess="RELEASES" accessLevel="read">Voir détails</button>
 */
@Directive({
  selector: '[appCanAccess]',
  standalone: true
})
export class CanAccessDirective implements OnInit, OnDestroy {
  @Input() appCanAccess!: PermissionModule;
  @Input() accessLevel: 'read' | 'write' = 'write';

  private permissionSubscription?: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements de permissions
    this.permissionSubscription = this.permissionService.permissions$.subscribe(() => {
      this.updateButtonState();
    });
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
  }

  private updateButtonState(): void {
    const hasAccess = this.accessLevel === 'read'
      ? this.permissionService.hasReadAccess(this.appCanAccess)
      : this.permissionService.hasWriteAccess(this.appCanAccess);

    if (!hasAccess) {
      // Désactiver le bouton
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');

      // Ajouter des classes pour le style
      this.renderer.addClass(this.el.nativeElement, 'opacity-50');
      this.renderer.addClass(this.el.nativeElement, 'cursor-not-allowed');

      // Ajouter un title pour le tooltip
      const tooltipMessage = this.permissionService.getDisabledTooltip(this.appCanAccess, this.accessLevel);
      this.renderer.setAttribute(this.el.nativeElement, 'title', tooltipMessage);

      // Empêcher les clics
      this.renderer.listen(this.el.nativeElement, 'click', (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
    } else {
      // Réactiver le bouton
      this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
      this.renderer.removeClass(this.el.nativeElement, 'opacity-50');
      this.renderer.removeClass(this.el.nativeElement, 'cursor-not-allowed');
      this.renderer.removeAttribute(this.el.nativeElement, 'title');
    }
  }
}
