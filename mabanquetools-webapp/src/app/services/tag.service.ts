import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SettingsService } from './settings.service';
import { CustomTag } from '@models/settings.model';

export interface TagInfo {
    id: string;
    label: string;
    color: string;
    icon?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TagService {
    public allTags$: Observable<TagInfo[]>;

    constructor(private settingsService: SettingsService) {
        this.allTags$ = this.settingsService.preferences$.pipe(
            map(prefs => {
                const tags: TagInfo[] = [];
                if (prefs.customTags) {
                    prefs.customTags.forEach(customTag => {
                        tags.push({
                            id: customTag.id,
                            label: customTag.label,
                            color: customTag.color,
                            icon: customTag.icon
                        });
                    });
                }
                return tags;
            })
        );
    }

    getAllTagsSync(): TagInfo[] {
        const prefs = this.settingsService.getCurrentPreferences();
        const tags: TagInfo[] = [];
        if (prefs.customTags) {
            prefs.customTags.forEach(customTag => {
                tags.push({
                    id: customTag.id,
                    label: customTag.label,
                    color: customTag.color,
                    icon: customTag.icon
                });
            });
        }
        return tags;
    }

    getTagById(id: string): TagInfo | undefined {
        return this.getAllTagsSync().find(tag => tag.id === id);
    }

    getTagLabel(id: string): string {
        const tag = this.getTagById(id);
        return tag ? tag.label : id;
    }

    getTagColor(id: string): string {
        const tag = this.getTagById(id);
        return tag ? tag.color : '#8b5cf6';
    }

    async addCustomTag(label: string, color: string, icon: string): Promise<CustomTag> {
        const customTag: CustomTag = {
            id: `tag_${Date.now()}`,
            name: label.toLowerCase().replace(/\s+/g, '_'),
            label,
            color,
            icon,
            createdAt: new Date().toISOString()
        };

        const prefs = this.settingsService.getCurrentPreferences();
        const updatedPrefs = {
            ...prefs,
            customTags: [...(prefs.customTags || []), customTag]
        };

        await this.settingsService.updatePreferences(updatedPrefs);
        return customTag;
    }

    async deleteCustomTag(id: string): Promise<void> {
        const prefs = this.settingsService.getCurrentPreferences();
        const updatedPrefs = {
            ...prefs,
            customTags: (prefs.customTags || []).filter(tag => tag.id !== id)
        };

        await this.settingsService.updatePreferences(updatedPrefs);
    }

    async updateCustomTag(id: string, updates: Partial<CustomTag>): Promise<void> {
        const prefs = this.settingsService.getCurrentPreferences();
        const updatedPrefs = {
            ...prefs,
            customTags: (prefs.customTags || []).map(tag =>
                tag.id === id ? { ...tag, ...updates } : tag
            )
        };

        await this.settingsService.updatePreferences(updatedPrefs);
    }
}
