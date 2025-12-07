import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardEntry } from '@models/game.model';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-container">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span class="material-icons text-amber-500">emoji_events</span>
          Top 10
        </h3>
        @if (isLoading) {
          <div class="animate-spin">
            <span class="material-icons text-primary-500">refresh</span>
          </div>
        }
      </div>

      <!-- Podium (Top 3) -->
      @if (entries.length >= 3) {
        <div class="podium-container mb-8">
          <!-- 2nd Place -->
          <div class="podium-item second" [class.highlight]="isCurrentUser(entries[1])">
            <div class="avatar silver">
              {{ getInitials(entries[1]) }}
            </div>
            <div class="podium-rank">2</div>
            <div class="podium-name">{{ getDisplayName(entries[1]) }}</div>
            <div class="podium-score">{{ entries[1].score }} mots</div>
            <div class="podium-wpm">{{ entries[1].wpm }} WPM</div>
            <div class="podium-bar silver"></div>
          </div>

          <!-- 1st Place -->
          <div class="podium-item first" [class.highlight]="isCurrentUser(entries[0])">
            <div class="crown">
              <span class="material-icons text-amber-400">workspace_premium</span>
            </div>
            <div class="avatar gold">
              {{ getInitials(entries[0]) }}
            </div>
            <div class="podium-rank">1</div>
            <div class="podium-name">{{ getDisplayName(entries[0]) }}</div>
            <div class="podium-score">{{ entries[0].score }} mots</div>
            <div class="podium-wpm">{{ entries[0].wpm }} WPM</div>
            <div class="podium-bar gold"></div>
          </div>

          <!-- 3rd Place -->
          <div class="podium-item third" [class.highlight]="isCurrentUser(entries[2])">
            <div class="avatar bronze">
              {{ getInitials(entries[2]) }}
            </div>
            <div class="podium-rank">3</div>
            <div class="podium-name">{{ getDisplayName(entries[2]) }}</div>
            <div class="podium-score">{{ entries[2].score }} mots</div>
            <div class="podium-wpm">{{ entries[2].wpm }} WPM</div>
            <div class="podium-bar bronze"></div>
          </div>
        </div>
      }

      <!-- Rest of the leaderboard -->
      <div class="leaderboard-list">
        @for (entry of entries; track entry.id; let i = $index) {
          @if (i >= 3) {
            <div
              class="leaderboard-row"
              [class.highlight]="isCurrentUser(entry)"
              [class.new-entry]="newEntryId === entry.id"
              [style.animation-delay]="(i - 3) * 50 + 'ms'"
            >
              <div class="rank-badge">{{ i + 1 }}</div>
              <div class="avatar-small">{{ getInitials(entry) }}</div>
              <div class="player-info">
                <div class="player-name">{{ getDisplayName(entry) }}</div>
                <div class="player-stats">
                  {{ entry.wpm }} WPM · {{ entry.accuracy?.toFixed(0) }}%
                </div>
              </div>
              <div class="score-display">
                <span class="score-value">{{ entry.score }}</span>
                <span class="score-label">mots</span>
              </div>
            </div>
          }
        }

        @if (entries.length === 0 && !isLoading) {
          <div class="empty-state">
            <span class="material-icons text-4xl text-gray-400 dark:text-gray-600 mb-2">
              leaderboard
            </span>
            <p class="text-gray-500 dark:text-gray-400">
              Aucun score enregistré
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Soyez le premier à jouer !
            </p>
          </div>
        }

        @if (entries.length > 0 && entries.length < 3 && !isLoading) {
          <!-- Simplified list for less than 3 entries -->
          @for (entry of entries; track entry.id; let i = $index) {
            <div
              class="leaderboard-row"
              [class.highlight]="isCurrentUser(entry)"
              [class.new-entry]="newEntryId === entry.id"
            >
              <div class="rank-badge" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                {{ i + 1 }}
              </div>
              <div class="avatar-small" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                {{ getInitials(entry) }}
              </div>
              <div class="player-info">
                <div class="player-name">{{ getDisplayName(entry) }}</div>
                <div class="player-stats">
                  {{ entry.wpm }} WPM · {{ entry.accuracy?.toFixed(0) }}%
                </div>
              </div>
              <div class="score-display">
                <span class="score-value">{{ entry.score }}</span>
                <span class="score-label">mots</span>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      @apply bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700;
    }

    /* Podium */
    .podium-container {
      @apply flex items-end justify-center gap-4;
    }

    .podium-item {
      @apply flex flex-col items-center relative;
      animation: slideUp 0.5s ease-out forwards;
      opacity: 0;
    }

    .podium-item.first { animation-delay: 0.2s; }
    .podium-item.second { animation-delay: 0.1s; }
    .podium-item.third { animation-delay: 0.3s; }

    .podium-item.highlight {
      @apply ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800 rounded-xl p-2 -m-2;
    }

    .crown {
      @apply absolute -top-8;
      animation: bounce 1s ease-in-out infinite;
    }

    .avatar {
      @apply w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg;
    }

    .avatar.gold { @apply bg-gradient-to-br from-amber-400 to-amber-600; }
    .avatar.silver { @apply bg-gradient-to-br from-gray-300 to-gray-500; }
    .avatar.bronze { @apply bg-gradient-to-br from-orange-400 to-orange-600; }

    .podium-rank {
      @apply text-2xl font-black text-gray-900 dark:text-white mt-2;
    }

    .podium-name {
      @apply text-sm font-semibold text-gray-700 dark:text-gray-300 text-center max-w-20 truncate;
    }

    .podium-score {
      @apply text-lg font-bold text-primary-600 dark:text-primary-400;
    }

    .podium-wpm {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }

    .podium-bar {
      @apply w-20 rounded-t-lg mt-2;
    }

    .podium-bar.gold { @apply h-24 bg-gradient-to-t from-amber-500 to-amber-300; }
    .podium-bar.silver { @apply h-16 bg-gradient-to-t from-gray-400 to-gray-300; }
    .podium-bar.bronze { @apply h-12 bg-gradient-to-t from-orange-500 to-orange-300; }

    /* Leaderboard List */
    .leaderboard-list {
      @apply flex flex-col gap-2;
    }

    .leaderboard-row {
      @apply flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-750 transition-all duration-300;
      animation: fadeInLeft 0.3s ease-out forwards;
      opacity: 0;
    }

    .leaderboard-row:hover {
      @apply bg-gray-100 dark:bg-gray-700 transform scale-[1.02];
    }

    .leaderboard-row.highlight {
      @apply bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500;
    }

    .leaderboard-row.new-entry {
      animation: newEntryPulse 0.6s ease-out;
    }

    .rank-badge {
      @apply w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-sm;
    }

    .rank-badge.gold { @apply bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400; }
    .rank-badge.silver { @apply bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300; }
    .rank-badge.bronze { @apply bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400; }

    .avatar-small {
      @apply w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white;
    }

    .avatar-small.gold { @apply from-amber-400 to-amber-600; }
    .avatar-small.silver { @apply from-gray-300 to-gray-500; }
    .avatar-small.bronze { @apply from-orange-400 to-orange-600; }

    .player-info {
      @apply flex-1 min-w-0;
    }

    .player-name {
      @apply font-semibold text-gray-900 dark:text-white truncate;
    }

    .player-stats {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }

    .score-display {
      @apply flex flex-col items-end;
    }

    .score-value {
      @apply text-xl font-bold text-primary-600 dark:text-primary-400;
    }

    .score-label {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }

    .empty-state {
      @apply flex flex-col items-center justify-center py-8;
    }

    /* Animations */
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes newEntryPulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }
  `]
})
export class LeaderboardComponent implements OnChanges {
  @Input() entries: LeaderboardEntry[] = [];
  @Input() isLoading = false;
  @Input() newEntryId: string | null = null;
  @Output() refresh = new EventEmitter<void>();

  private currentUserId: string | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newEntryId'] && this.newEntryId) {
      // Clear the highlight after animation
      setTimeout(() => {
        this.newEntryId = null;
      }, 2000);
    }
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    return !!(this.currentUserId && entry.userId === this.currentUserId);
  }

  getDisplayName(entry: LeaderboardEntry): string {
    if (entry.user) {
      return `${entry.user.firstName} ${entry.user.lastName.charAt(0)}.`;
    }
    return entry.visitorName || 'Anonyme';
  }

  getInitials(entry: LeaderboardEntry): string {
    if (entry.user) {
      return `${entry.user.firstName.charAt(0)}${entry.user.lastName.charAt(0)}`.toUpperCase();
    }
    if (entry.visitorName) {
      return entry.visitorName.substring(0, 2).toUpperCase();
    }
    return '??';
  }
}
