import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-container" *ngIf="breadcrumbs.length > 0">
      <ol class="flex items-center space-x-2 text-sm">
        <li *ngFor="let crumb of breadcrumbs; let last = last" class="flex items-center">
          <a
            *ngIf="!last"
            [routerLink]="crumb.url"
            class="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ crumb.label }}
          </a>
          <span
            *ngIf="last"
            class="text-gray-900 dark:text-white font-medium"
          >
            {{ crumb.label }}
          </span>
          <span
            *ngIf="!last"
            class="material-icons text-gray-400 dark:text-gray-600 mx-2"
            style="font-size: 16px;"
          >
            chevron_right
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      @apply py-4;
    }
  `]
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumbs(this.activatedRoute.root))
      )
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });

    // Initial breadcrumbs
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({
          label,
          url,
          isActive: false
        });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
