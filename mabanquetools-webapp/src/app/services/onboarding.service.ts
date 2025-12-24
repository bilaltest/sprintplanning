import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OnboardingService {
    private readonly API_URL = `${environment.apiUrl}/onboarding`;
    private seenKeysSubject = new BehaviorSubject<Set<string>>(new Set());
    public seenKeys$ = this.seenKeysSubject.asObservable();

    private loaded = false;

    constructor(private http: HttpClient) { }

    /**
     * Load the list of seen keys from the backend.
     * Should be called on app init or after login.
     */
    loadSeenKeys(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/status`).pipe(
            tap(keys => {
                this.seenKeysSubject.next(new Set(keys));
                this.loaded = true;
            })
        );
    }

    /**
     * Check if a specific tip key should be shown.
     * Returns true if NOT seen.
     */
    shouldShow(key: string): boolean {
        if (!this.loaded) {
            // If not loaded yet, assume false to avoid flashing, or trigger load?
            // Better to ensure loadSeenKeys is called before checking.
            return false;
        }
        return !this.seenKeysSubject.value.has(key);
    }

    /**
     * Mark a tip as seen.
     */
    markAsSeen(key: string): void {
        if (this.seenKeysSubject.value.has(key)) {
            return;
        }

        // Optimistic update
        const current = this.seenKeysSubject.value;
        current.add(key);
        this.seenKeysSubject.next(new Set(current));

        this.http.post<void>(`${this.API_URL}/seen/${key}`, {}).subscribe({
            error: err => console.error('Failed to mark onboarding key as seen', err)
        });
    }
    /**
     * Skip all onboarding tips.
     */
    skipAll(): void {
        const current = this.seenKeysSubject.value;
        const allKeys = ["WELCOME", "FEATURE_RELEASES", "FEATURE_ABSENCE", "FEATURE_CALENDAR", "TOUR_HOME", "TOUR_ABSENCE"];
        allKeys.forEach(k => current.add(k));
        this.seenKeysSubject.next(new Set(current));

        this.http.post<void>(`${this.API_URL}/skip-all`, {}).subscribe({
            error: err => console.error('Failed to skip all onboarding keys', err)
        });
    }
}
