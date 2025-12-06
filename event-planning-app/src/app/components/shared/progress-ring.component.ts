import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center">
      <svg
        [attr.width]="size"
        [attr.height]="size"
        class="transform -rotate-90"
      >
        <!-- Background circle -->
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke]="backgroundColor"
          fill="transparent"
          class="transition-all duration-300"
        />

        <!-- Progress circle -->
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke]="progressColor"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          fill="transparent"
          stroke-linecap="round"
          class="transition-all duration-500 ease-out"
          [class.animate-pulse]="animated && percentage === 100"
        />
      </svg>

      <!-- Center text -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span
          [class]="textClass"
          class="font-bold transition-all duration-300"
          [style.fontSize.px]="fontSize"
        >
          {{ displayText }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ProgressRingComponent {
  @Input() percentage: number = 0;
  @Input() size: number = 80;
  @Input() strokeWidth: number = 6;
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'custom' = 'primary';
  @Input() customColor?: string;
  @Input() showPercentage: boolean = true;
  @Input() customText?: string;
  @Input() animated: boolean = true;
  @Input() textClass: string = 'text-gray-900 dark:text-white';

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    const clampedPercentage = Math.min(100, Math.max(0, this.percentage));
    return this.circumference - (clampedPercentage / 100) * this.circumference;
  }

  get fontSize(): number {
    // Taille du texte proportionnelle à la taille du cercle
    return Math.max(12, this.size / 4);
  }

  get displayText(): string {
    if (this.customText) {
      return this.customText;
    }
    return this.showPercentage ? `${Math.round(this.percentage)}%` : '';
  }

  get backgroundColor(): string {
    // Couleur de fond du cercle (gris clair/foncé selon le thème)
    return 'currentColor';
  }

  get progressColor(): string {
    if (this.customColor) {
      return this.customColor;
    }

    const colorMap: Record<string, string> = {
      primary: '#10b981',   // Emerald-500
      success: '#22c55e',   // Green-500
      warning: '#f59e0b',   // Amber-500
      danger: '#ef4444',    // Red-500
      custom: '#10b981'     // Default fallback
    };

    return colorMap[this.color] || colorMap['primary'];
  }
}
