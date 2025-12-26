# Prochaines Étapes - Système de Notifications Blog

## ✅ Déjà Complété

### Phase 1 - Backend (100%)
- ✅ UserMentionParser.java
- ✅ BlogNotificationService.java
- ✅ BlogNotificationController.java
- ✅ BlogNotificationDto.java
- ✅ Modification BlogCommentService.java (intégration mentions)
- ✅ Tests JUnit (31/31 passent)
- ✅ **FIX: Permission BLOG ajoutée au DataInitializer** (26 Dec 2024)

### Phase 2 - Frontend (100%)
- ✅ Interface BlogNotification (blog.model.ts)
- ✅ BlogNotificationService Angular
- ✅ NotificationBellComponent
- ✅ HighlightMentionsPipe
- ✅ Autocomplete @user mentions dans blog-post-view
- ✅ Intégration NotificationBell dans main-layout
- ✅ Tests Jest (11/11 passent après fixes)

## 🔥 Fix Important - Permission BLOG (26 Dec 2024)

### Problème Résolu

**Symptôme:** Erreur HTTP 200 retournant du HTML au lieu de JSON lors de l'appel `/api/blog/notifications`
```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

**Cause:** Le module `BLOG` a été ajouté au système de permissions (`PermissionModule.java`), mais le `DataInitializer` ne créait pas cette permission lors de l'initialisation de l'admin.

**Solution Appliquée:**

1. **Mise à jour `DataInitializer.ensureAdminPermissions()`** :
   ```java
   private void ensureAdminPermissions(User admin) {
       // Vérifier si toutes les permissions admin sont présentes, y compris BLOG
       boolean needsUpdate = !permissionService.hasWriteAccess(admin.getId(),
               PermissionModule.ADMIN)
               || !permissionService.hasWriteAccess(admin.getId(),
               PermissionModule.BLOG);

       if (needsUpdate) {
           permissionService.createAdminPermissions(admin);
           log.info("✅ Permissions admin appliquées/mises à jour pour {} (y compris BLOG)", admin.getId());
       }
   }
   ```

2. **Mise à jour `DataInitializer.createGuestUser()`** :
   - Ajout explicite de `BLOG: NONE` pour l'utilisateur invité

**Impact:**
- ✅ Au prochain démarrage avec base H2, l'admin aura automatiquement `BLOG: WRITE`
- ✅ Les utilisateurs existants (base MySQL) devront se reconnecter pour obtenir un nouveau JWT token incluant les permissions BLOG
- ✅ Le endpoint `/api/blog/notifications` retournera maintenant du JSON correctement

**Migration Base MySQL Existante:**
Si vous avez déjà des utilisateurs admin dans MySQL sans permission BLOG, exécutez :
```sql
-- Ajouter BLOG WRITE pour l'admin existant
INSERT INTO user_permissions (id, user_id, module, permission_level, created_at, updated_at)
SELECT
    CONCAT('c', LOWER(CONV(FLOOR(UNIX_TIMESTAMP(NOW(6)) * 1000), 10, 36)), SUBSTRING(MD5(RAND()), 1, 8)),
    (SELECT id FROM app_user WHERE email = 'bilal.djebbari@ca-ts.fr'),
    'BLOG',
    'WRITE',
    NOW(6),
    NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_id = (SELECT id FROM app_user WHERE email = 'bilal.djebbari@ca-ts.fr')
    AND module = 'BLOG'
);
```

---

## 🔄 Phase 2 - TERMINÉE ✅

### Frontend Autocomplete & Highlight (Complété)

**Modifications template (ligne 138-154):**

```html
<!-- New Comment Form -->
<div class="mb-8 relative">
  <textarea
    #commentTextarea
    [(ngModel)]="newCommentContent"
    (input)="onCommentInput($event)"
    (keydown)="onCommentKeydown($event)"
    placeholder="Ajouter un commentaire... (utilisez @ pour mentionner)"
    rows="3"
    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
  ></textarea>

  <!-- Autocomplete dropdown -->
  <div *ngIf="showUserAutocomplete" class="autocomplete-dropdown">
    <div
      *ngFor="let user of filteredUsers; let i = index"
      class="autocomplete-item"
      [class.selected]="i === selectedUserIndex"
      (mouseenter)="selectedUserIndex = i"
      (click)="insertMention(user)">
      <span class="user-avatar">{{ user.firstName[0] }}{{ user.lastName[0] }}</span>
      <div class="user-info">
        <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
        <p class="user-email">{{ user.email }}</p>
      </div>
    </div>
  </div>

  <div class="flex justify-end mt-2">
    <button
      (click)="submitComment()"
      [disabled]="!newCommentContent.trim()"
      class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Publier
    </button>
  </div>
</div>
```

**Modifications template affichage commentaires (ligne 176):**

```html
<!-- AVANT -->
<p class="text-gray-700 dark:text-gray-300 mb-2">{{ comment.content }}</p>

<!-- APRÈS -->
<p class="text-gray-700 dark:text-gray-300 mb-2 comment-content" [innerHTML]="comment.content | highlightMentions"></p>
```

**Ajouter imports:**

```typescript
import { HighlightMentionsPipe } from '../../pipes/highlight-mentions.pipe';
import { BlogAuthor } from '../../models/blog.model';

// Dans @Component imports
imports: [CommonModule, FormsModule, HasPermissionDirective, HighlightMentionsPipe],
```

**Ajouter propriétés component:**

```typescript
// Autocomplete mentions
showUserAutocomplete = false;
filteredUsers: BlogAuthor[] = [];
selectedUserIndex = 0;
mentionStartIndex = -1;
allUsers: BlogAuthor[] = []; // Charger depuis UserService (à créer)
```

**Ajouter méthodes:**

```typescript
onCommentInput(event: Event): void {
  const textarea = event.target as HTMLTextAreaElement;
  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = this.newCommentContent.substring(0, cursorPos);

  // Chercher le dernier @ avant le curseur
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex !== -1) {
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

    // Vérifier qu'il n'y a pas d'espace après @
    if (!textAfterAt.includes(' ')) {
      this.mentionStartIndex = lastAtIndex;
      const query = textAfterAt.toLowerCase();

      // Filtrer utilisateurs
      this.filteredUsers = this.allUsers.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });

      this.showUserAutocomplete = this.filteredUsers.length > 0;
      this.selectedUserIndex = 0;
      return;
    }
  }

  this.showUserAutocomplete = false;
}

onCommentKeydown(event: KeyboardEvent): void {
  if (!this.showUserAutocomplete) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    this.selectedUserIndex = Math.min(
      this.selectedUserIndex + 1,
      this.filteredUsers.length - 1
    );
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    this.selectedUserIndex = Math.max(this.selectedUserIndex - 1, 0);
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault();
    this.insertMention(this.filteredUsers[this.selectedUserIndex]);
  } else if (event.key === 'Escape') {
    this.showUserAutocomplete = false;
  }
}

insertMention(user: BlogAuthor): void {
  const mention = `@${user.email.split('@')[0]}`;

  const before = this.newCommentContent.substring(0, this.mentionStartIndex);
  const after = this.newCommentContent.substring(this.mentionStartIndex);
  const afterQuery = after.substring(after.indexOf(' ') !== -1 ? after.indexOf(' ') : after.length);

  this.newCommentContent = before + mention + ' ' + afterQuery;
  this.showUserAutocomplete = false;
}
```

**Ajouter styles (dans le component):**

```typescript
styles: [`
  .autocomplete-dropdown {
    position: absolute;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    margin-top: -8px;
    width: 100%;
  }

  :host-context(.dark) .autocomplete-dropdown {
    background: var(--gray-800);
    border-color: var(--gray-700);
  }

  .autocomplete-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .autocomplete-item:hover,
  .autocomplete-item.selected {
    background: var(--gray-50);
  }

  :host-context(.dark) .autocomplete-item:hover,
  :host-context(.dark) .autocomplete-item.selected {
    background: var(--gray-700);
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .user-email {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .comment-content :deep(.mention) {
    color: var(--primary-color);
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .comment-content :deep(.mention):hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`]
```

### 2. Créer UserService (optionnel mais recommandé)

**Créer services/user.service.ts:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BlogAuthor } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/users'; // Endpoint à créer côté backend

  private usersSubject = new BehaviorSubject<BlogAuthor[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await firstValueFrom(
        this.http.get<BlogAuthor[]>(this.apiUrl)
      );
      this.usersSubject.next(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
}
```

**Backend: Créer UserController.getAllUsers() (optionnel):**

```java
@GetMapping
@PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
public ResponseEntity<List<UserDto>> getAllUsers() {
    List<User> users = userRepository.findAll();
    return ResponseEntity.ok(users.stream()
        .map(this::toSimpleDto)
        .collect(Collectors.toList()));
}
```

### 3. Intégrer NotificationBellComponent dans la Sidebar

**Modifier layouts/main-layout.component.ts:**

```typescript
// Dans template, ajouter dans le header
<app-notification-bell></app-notification-bell>

// Dans imports
import { NotificationBellComponent } from '../components/blog/notification-bell.component';

// Dans @Component imports
imports: [CommonModule, RouterModule, HasPermissionDirective, NotificationBellComponent],
```

## 🚀 Phase 3 - WebSocket (À faire)

### Backend

**1. Ajouter dépendance Maven:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**2. Créer WebSocketConfig.java**

**3. Modifier BlogNotificationService pour broadcast WebSocket:**

```java
private final SimpMessagingTemplate messagingTemplate;

// Dans chaque méthode create*Notification, ajouter:
messagingTemplate.convertAndSendToUser(
    recipient.getId(),
    "/topic/notifications",
    dto
);
```

### Frontend

**1. Installer dependencies:**

```bash
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

**2. Modifier BlogNotificationService:**

```typescript
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

private wsClient: Client | null = null;

private connectWebSocket(): void {
  const currentUser = this.authService.getCurrentUser();
  if (!currentUser) return;

  this.wsClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:3000/api/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      this.wsClient?.subscribe(
        `/user/${currentUser.id}/topic/notifications`,
        (message: IMessage) => {
          const notification: BlogNotification = JSON.parse(message.body);

          // Ajouter au début de la liste
          const current = this.notificationsSubject.value;
          this.notificationsSubject.next([notification, ...current]);

          // Incrémenter unread count
          this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        }
      );
    }
  });

  this.wsClient.activate();
}
```

## 📊 Résumé Progrès Global

| Phase | Statut | Fichiers | Tests |
|-------|--------|----------|-------|
| Phase 1 Backend | ✅ 100% | 7 fichiers | ✅ 31/31 |
| Phase 2 Frontend (Partie 1) | ✅ 80% | 4 fichiers | ⏳ Pending |
| Phase 2 Frontend (Partie 2) | ⏳ 20% | 2 modifs | ⏳ Pending |
| Phase 3 WebSocket | ⏳ 0% | 0 fichiers | ⏳ Pending |
| Phase 4 Newsletter | ⏳ 0% | 0 fichiers | ⏳ Pending |

**Estimation temps restant:**
- Phase 2 (complétion): 2h
- Phase 3 (WebSocket): 2h
- Tests frontend: 2h
- Phase 4 (Newsletter): 3h

**Total restant:** ~9h
