import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Event } from '@models/event.model';
import { EventService } from './event.service';

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'png';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private eventService: EventService) {}

  async exportAsJSON(): Promise<void> {
    try {
      const events = await this.eventService.exportEvents();
      const dataStr = JSON.stringify(events, null, 2);
      this.downloadFile(dataStr, 'planning-events.json', 'application/json');
    } catch (error) {
      console.error('Error exporting as JSON:', error);
      throw error;
    }
  }

  async exportAsCSV(): Promise<void> {
    try {
      const events = await this.eventService.exportEvents();
      const csv = this.convertToCSV(events);
      this.downloadFile(csv, 'planning-events.csv', 'text/csv');
    } catch (error) {
      console.error('Error exporting as CSV:', error);
      throw error;
    }
  }

  async exportAsPDF(elementId: string, filename: string = 'planning'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      throw error;
    }
  }

  async exportAsPNG(elementId: string, filename: string = 'planning'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting as PNG:', error);
      throw error;
    }
  }

  async importFromJSON(file: File): Promise<Event[]> {
    try {
      const text = await file.text();
      const events: Event[] = JSON.parse(text);

      // Validation basique
      if (!Array.isArray(events)) {
        throw new Error('Le fichier doit contenir un tableau d\'événements');
      }

      await this.eventService.importEvents(events);
      return events;
    } catch (error) {
      console.error('Error importing from JSON:', error);
      throw error;
    }
  }

  private convertToCSV(events: Event[]): string {
    if (events.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Titre',
      'Date',
      'Heure début',
      'Heure fin',
      'Catégorie',
      'Couleur',
      'Icône',
      'Description',
      'Créé le',
      'Modifié le'
    ];

    const rows = events.map(event => [
      event.id || '',
      this.escapeCsvValue(event.title),
      event.date,
      event.startTime || '',
      event.endTime || '',
      event.category,
      event.color,
      event.icon,
      this.escapeCsvValue(event.description || ''),
      event.createdAt,
      event.updatedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
