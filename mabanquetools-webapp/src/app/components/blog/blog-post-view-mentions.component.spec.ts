import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { BlogPostViewComponent } from './blog-post-view.component';
import { BlogService } from '../../services/blog.service';
import { BlogCommentService } from '../../services/blog-comment.service';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { ToastService } from '../../services/toast.service';
import { BlogAuthor } from '../../models/blog.model';

/**
 * Tests spécifiques aux fonctionnalités de mentions @user
 * dans le composant BlogPostView
 */
describe('BlogPostViewComponent - Mentions Autocomplete', () => {
  let component: BlogPostViewComponent;
  let fixture: ComponentFixture<BlogPostViewComponent>;

  const mockUsers: BlogAuthor[] = [
    {
      id: 'user1',
      email: 'bilal.djebbari@ca-ts.fr',
      firstName: 'Bilal',
      lastName: 'Djebbari'
    },
    {
      id: 'user2',
      email: 'john.doe@ca-ts.fr',
      firstName: 'John',
      lastName: 'Doe'
    },
    {
      id: 'user3',
      email: 'jane.smith@ca-ts.fr',
      firstName: 'Jane',
      lastName: 'Smith'
    }
  ];

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('test-post')
        }
      }
    };

    const mockBlogService = {
      getPostBySlugOrId: jest.fn().mockResolvedValue({
        id: 'post1',
        title: 'Test Post',
        content: 'Test content',
        author: mockUsers[0],
        publishedAt: new Date().toISOString(),
        viewCount: 10,
        likeCount: 5,
        isLikedByCurrentUser: false,
        tags: []
      }),
      toggleLike: jest.fn(),
      deletePost: jest.fn()
    };

    const mockCommentService = {
      getCommentsByPostId: jest.fn().mockResolvedValue([]),
      createComment: jest.fn(),
      toggleLike: jest.fn(),
      deleteComment: jest.fn()
    };

    const mockAuthService = {
      getCurrentUser: jest.fn().mockReturnValue({ id: 'user1', email: 'test@example.com' })
    };

    const mockPermissionService = {};
    const mockToastService = {
      success: jest.fn(),
      error: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BlogPostViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: BlogService, useValue: mockBlogService },
        { provide: BlogCommentService, useValue: mockCommentService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPostViewComponent);
    component = fixture.componentInstance;
    component.allUsers = mockUsers;
    fixture.detectChanges();
  });

  describe('onCommentInput', () => {
    it('should detect @ and show autocomplete', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello @';
      textarea.selectionStart = 7;

      component.newCommentContent = 'Hello @';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.showUserAutocomplete).toBe(true);
      expect(component.mentionStartIndex).toBe(6);
    });

    it('should filter users by query after @', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello @bil';
      textarea.selectionStart = 10;

      component.newCommentContent = 'Hello @bil';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].email).toBe('bilal.djebbari@ca-ts.fr');
    });

    it('should filter by first name', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello @john';
      textarea.selectionStart = 11;

      component.newCommentContent = 'Hello @john';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].firstName).toBe('John');
    });

    it('should filter by last name', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello @smith';
      textarea.selectionStart = 12;

      component.newCommentContent = 'Hello @smith';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].lastName).toBe('Smith');
    });

    it('should hide autocomplete if space after @', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello @ world';
      textarea.selectionStart = 13;

      component.newCommentContent = 'Hello @ world';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.showUserAutocomplete).toBe(false);
    });

    it('should hide autocomplete if no @ found', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      textarea.selectionStart = 11;

      component.newCommentContent = 'Hello world';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.showUserAutocomplete).toBe(false);
    });

    it('should reset selected index when showing autocomplete', () => {
      component.selectedUserIndex = 5;

      const textarea = document.createElement('textarea');
      textarea.value = 'Hello @';
      textarea.selectionStart = 7;

      component.newCommentContent = 'Hello @';

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: textarea, writable: false });

      component.onCommentInput(event);

      expect(component.selectedUserIndex).toBe(0);
    });
  });

  describe('onCommentKeydown', () => {
    beforeEach(() => {
      component.showUserAutocomplete = true;
      component.filteredUsers = mockUsers;
      component.selectedUserIndex = 0;
    });

    it('should move down on ArrowDown', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      jest.spyOn(event, 'preventDefault');

      component.onCommentKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.selectedUserIndex).toBe(1);
    });

    it('should not go beyond last user on ArrowDown', () => {
      component.selectedUserIndex = 2; // Last index

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      component.onCommentKeydown(event);

      expect(component.selectedUserIndex).toBe(2);
    });

    it('should move up on ArrowUp', () => {
      component.selectedUserIndex = 1;

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      jest.spyOn(event, 'preventDefault');

      component.onCommentKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.selectedUserIndex).toBe(0);
    });

    it('should not go below 0 on ArrowUp', () => {
      component.selectedUserIndex = 0;

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      component.onCommentKeydown(event);

      expect(component.selectedUserIndex).toBe(0);
    });

    it('should insert mention on Enter', () => {
      const insertMentionSpy = jest.spyOn(component, 'insertMention');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      jest.spyOn(event, 'preventDefault');

      component.onCommentKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(insertMentionSpy).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should insert mention on Tab', () => {
      const insertMentionSpy = jest.spyOn(component, 'insertMention');
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      jest.spyOn(event, 'preventDefault');

      component.onCommentKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(insertMentionSpy).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should close autocomplete on Escape', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onCommentKeydown(event);

      expect(component.showUserAutocomplete).toBe(false);
    });

    it('should do nothing if autocomplete is not shown', () => {
      component.showUserAutocomplete = false;
      const initialIndex = component.selectedUserIndex;

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      component.onCommentKeydown(event);

      expect(component.selectedUserIndex).toBe(initialIndex);
    });
  });

  describe('insertMention', () => {
    it('should insert mention at @ position', () => {
      component.newCommentContent = 'Hello @';
      component.mentionStartIndex = 6;

      component.insertMention(mockUsers[0]);

      expect(component.newCommentContent).toContain('@bilal.djebbari ');
    });

    it('should replace partial query with mention', () => {
      component.newCommentContent = 'Hello @bil';
      component.mentionStartIndex = 6;

      component.insertMention(mockUsers[0]);

      expect(component.newCommentContent).toBe('Hello @bilal.djebbari ');
    });

    it('should close autocomplete after insertion', () => {
      component.showUserAutocomplete = true;
      component.newCommentContent = 'Hello @';
      component.mentionStartIndex = 6;

      component.insertMention(mockUsers[0]);

      expect(component.showUserAutocomplete).toBe(false);
    });

    it('should extract username from email', () => {
      component.newCommentContent = '@';
      component.mentionStartIndex = 0;

      component.insertMention(mockUsers[0]);

      // Should extract "bilal.djebbari" from "bilal.djebbari@ca-ts.fr"
      expect(component.newCommentContent).toContain('@bilal.djebbari');
    });

    it('should preserve text after mention', () => {
      component.newCommentContent = 'Hello @ world';
      component.mentionStartIndex = 6;

      component.insertMention(mockUsers[0]);

      expect(component.newCommentContent).toContain('world');
    });
  });

  describe('autocomplete state', () => {
    it('should initialize with autocomplete hidden', () => {
      expect(component.showUserAutocomplete).toBe(false);
      expect(component.filteredUsers).toEqual([]);
      expect(component.selectedUserIndex).toBe(0);
      expect(component.mentionStartIndex).toBe(-1);
    });

    it('should maintain allUsers list', () => {
      expect(component.allUsers).toEqual(mockUsers);
    });
  });
});
