import { TestBed } from '@angular/core/testing';
import { TagService, TagInfo } from './tag.service';
import { SettingsService } from './settings.service';
import { BehaviorSubject } from 'rxjs';
import { UserPreferences, CustomTag } from '@models/settings.model';

describe('TagService', () => {
    let service: TagService;
    let settingsServiceMock: any;
    let preferencesSubject: BehaviorSubject<UserPreferences>;

    const mockPreferences: UserPreferences = {
        theme: 'light',
        customCategories: [],
        customTags: [
            { id: 'tag1', name: 'ios', label: 'iOS', color: '#000000', icon: 'apple', createdAt: '2025-01-01' },
            { id: 'tag2', name: 'android', label: 'Android', color: '#00ff00', icon: 'android', createdAt: '2025-01-01' }
        ],
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
    };

    beforeEach(() => {
        preferencesSubject = new BehaviorSubject<UserPreferences>(mockPreferences);

        settingsServiceMock = {
            preferences$: preferencesSubject.asObservable(),
            getCurrentPreferences: jest.fn().mockReturnValue(mockPreferences),
            updatePreferences: jest.fn().mockResolvedValue(true)
        };

        TestBed.configureTestingModule({
            providers: [
                TagService,
                { provide: SettingsService, useValue: settingsServiceMock }
            ]
        });
        service = TestBed.inject(TagService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve all tags from settings', (done) => {
        service.allTags$.subscribe(tags => {
            expect(tags.length).toBe(2);
            expect(tags[0].label).toBe('iOS');
            expect(tags[1].label).toBe('Android');
            done();
        });
    });

    it('should get tag by id', () => {
        const tag = service.getTagById('tag1');
        expect(tag).toBeDefined();
        expect(tag?.label).toBe('iOS');
    });

    it('should return undefined for non-existent tag id', () => {
        const tag = service.getTagById('nonexistent');
        expect(tag).toBeUndefined();
    });

    it('should get tag label', () => {
        expect(service.getTagLabel('tag1')).toBe('iOS');
        expect(service.getTagLabel('nonexistent')).toBe('nonexistent');
    });

    it('should get tag color', () => {
        expect(service.getTagColor('tag1')).toBe('#000000');
        expect(service.getTagColor('nonexistent')).toBe('#8b5cf6'); // Default color
    });

    it('should add custom tag', async () => {
        const newLabel = 'Backend';
        const newColor = '#ff0000';
        const newIcon = 'dns';

        await service.addCustomTag(newLabel, newColor, newIcon);

        expect(settingsServiceMock.updatePreferences).toHaveBeenCalled();
        const mockCalls = settingsServiceMock.updatePreferences.mock.calls;
        const updatedPrefs = mockCalls[0][0];
        expect(updatedPrefs.customTags.length).toBe(3);
        expect(updatedPrefs.customTags[2].label).toBe(newLabel);
    });

    it('should delete custom tag', async () => {
        await service.deleteCustomTag('tag1');

        expect(settingsServiceMock.updatePreferences).toHaveBeenCalled();
        const mockCalls = settingsServiceMock.updatePreferences.mock.calls;
        const updatedPrefs = mockCalls[0][0];
        expect(updatedPrefs.customTags.length).toBe(1);
        expect(updatedPrefs.customTags[0].id).toBe('tag2');
    });

    it('should update custom tag', async () => {
        await service.updateCustomTag('tag1', { label: 'iOS Updated' });

        expect(settingsServiceMock.updatePreferences).toHaveBeenCalled();
        const mockCalls = settingsServiceMock.updatePreferences.mock.calls;
        const updatedPrefs = mockCalls[0][0];
        const updatedTag = updatedPrefs.customTags.find((t: CustomTag) => t.id === 'tag1');
        expect(updatedTag.label).toBe('iOS Updated');
    });
});
