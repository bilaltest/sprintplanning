import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe pour highlight les mentions @user dans les commentaires
 * Transforme @username en <span class="mention">@username</span>
 */
@Pipe({
  name: 'highlightMentions',
  standalone: true
})
export class HighlightMentionsPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return '';

    // Pattern: @[anything without spaces]
    // Remplacer @username par <span class="mention">@username</span>
    const highlighted = content.replace(
      /@([a-zA-Z0-9._-]+)/g,
      '<span class="mention">@$1</span>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
