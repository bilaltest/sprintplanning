import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-multi-select-filter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="relative inline-block w-full">
      <!-- Trigger Button -->
      <button 
        type="button" 
        (click)="toggleDropdown()"
        class="w-full flex items-center justify-between text-[10px] py-1 pl-1 pr-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div class="truncate flex-1 text-left">
          <span *ngIf="selectedValues.length === 0" class="text-gray-500">Toutes</span>
          <span *ngIf="selectedValues.length === 1">{{ selectedValues[0] }}</span>
          <span *ngIf="selectedValues.length > 1">{{ selectedValues.length }} sél.</span>
        </div>
        <span class="material-icons text-gray-400 text-[14px]">expand_more</span>
      </button>

      <!-- Dropdown Menu -->
      <div *ngIf="isOpen" class="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto custom-scrollbar left-0">
        <!-- Actions -->
        <div class="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 flex justify-between">
            <button (click)="selectAll()" class="text-[10px] text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">Tout</button>
            <button (click)="deselectAll()" class="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium">Aucun</button>
        </div>

        <div class="py-1">
          <div 
            *ngFor="let option of options" 
            class="flex items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            (click)="toggleOption(option)"
          >
            <div class="flex items-center h-4 w-4 rounded border border-gray-300 dark:border-gray-600 mr-2 justify-center transition-colors"
                 [class.bg-primary-600]="isSelected(option)"
                 [class.border-primary-600]="isSelected(option)"
            >
                <span *ngIf="isSelected(option)" class="material-icons text-white text-[10px] font-bold">check</span>
            </div>
            <span class="text-[11px] text-gray-700 dark:text-gray-200 truncate select-none">{{ option }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 2px; }
  `]
})
export class MultiSelectFilterComponent {
    @Input() options: string[] = [];
    @Input() selectedValues: string[] = [];
    @Output() selectedValuesChange = new EventEmitter<string[]>();

    isOpen = false;

    constructor(private elementRef: ElementRef) { }

    @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    isSelected(option: string): boolean {
        return this.selectedValues.includes(option);
    }

    toggleOption(option: string) {
        if (this.isSelected(option)) {
            this.selectedValues = this.selectedValues.filter(v => v !== option);
        } else {
            this.selectedValues = [...this.selectedValues, option];
        }
        this.emitChange();
    }

    selectAll() {
        this.selectedValues = [...this.options];
        this.emitChange();
    }

    deselectAll() {
        this.selectedValues = [];
        this.emitChange();
    }

    emitChange() {
        this.selectedValuesChange.emit(this.selectedValues);
    }
}
