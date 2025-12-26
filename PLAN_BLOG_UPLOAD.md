# Plan d'Implémentation: Upload d'Images pour le Blog

## 📋 Vue d'Ensemble

Ajout d'un système complet d'upload d'images pour le blog avec:
- Upload de fichiers (drag & drop + sélection)
- **Stockage en base de données (BLOB/LONGBLOB MySQL)**
- Redimensionnement et génération de thumbnails
- Galerie d'images réutilisables
- Intégration dans Quill.js
- Upload de cover image pour les posts

## ⚙️ Choix Techniques (Décision Utilisateur)

- **Stockage**: BLOB/LONGBLOB dans MySQL (pas de fichiers disque)
- **Redimensionnement**: imgscalr
- **Frontend**: Version complète (Upload + Galerie)
- **Suppression**: Oui

## 🎯 Objectifs

1. **Backend**: Service d'upload sécurisé avec validation et redimensionnement
2. **Frontend**: Interface intuitive d'upload avec preview et galerie
3. **Intégration**: Custom image handler pour Quill.js
4. **Permissions**: Intégrer au système BLOG (WRITE requis)

## 🏗️ Architecture Existante Analysée

### Backend (Spring Boot 4.0.1)

**Patterns identifiés:**
- Controllers REST avec `@PreAuthorize` pour permissions
- Services avec `@RequiredArgsConstructor` (injection Lombok)
- Entities JPA avec `@Entity`, cascade relations
- DTOs pour requêtes/réponses avec validation `@Valid`
- Gestion d'erreurs: Exceptions custom + try/catch dans controllers
- Validation: Annotations Jakarta (`@NotBlank`, `@Size`, etc.)

**Dependencies Maven:**
- ✅ Spring Boot Web, JPA, Security, Validation
- ❌ **Manque**: imgscalr ou autre lib de traitement d'images
- ✅ Lombok, JWT, MySQL connector

**Configuration actuelle:**
- `application.properties`: MySQL, JPA (ddl-auto=update), CORS localhost:4200
- `SecurityConfig.java`: JWT auth, CORS configuré, endpoints publics `/auth/**`, `/health`

**Entité BlogImage (DÉJÀ EXISTANTE mais non utilisée):**
```java
@Entity
class BlogImage {
    String id; // CUID
    String fileName; // Nom serveur (unique)
    String originalFileName; // Nom original
    String url; // URL publique - À MODIFIER pour data:image URL
    String thumbnailUrl; // URL thumbnail - À MODIFIER pour data:image URL
    String mimeType; // image/jpeg, image/png
    Long fileSize; // Taille en bytes
    Integer width, height; // Dimensions
    User uploadedBy; // FK User
    LocalDateTime createdAt;
    // À AJOUTER:
    @Lob byte[] imageData; // LONGBLOB pour image originale
    @Lob byte[] thumbnailData; // MEDIUMBLOB pour thumbnail
}
```

**Modifications requises sur BlogImage:**
1. Ajouter champs `imageData` et `thumbnailData` (@Lob BLOB)
2. Modifier `url` et `thumbnailUrl` pour retourner data URLs (format: `data:image/jpeg;base64,{base64Data}`)
3. Supprimer colonnes `fileName`, `url`, `thumbnailUrl` de la table (optionnel, garder pour metadata)

### Frontend (Angular 20)

**Patterns identifiés:**
- Composants standalone avec `CommonModule`, `FormsModule`
- Modals custom (pas de lib externe type Angular Material Dialog)
  - Pattern: overlay + modal-content avec animations CSS
  - Exemple: `event-modal.component.ts`, `microservice-management-modal.component.ts`
- Forms: Template-driven (`[(ngModel)]`)
- Services avec Observables RxJS (`BehaviorSubject`, `loading$`, `error$`)
- Quill.js configuré dans `blog-post-form.component.ts`:
  - Toolbar: headers, bold/italic, lists, colors, align, **link, image**, code-block
  - Theme: 'snow'
  - Custom styles pour dark mode
  - Sync content avec `text-change` event

**Cover Image actuel:**
- Champ texte URL (`<input type="url">`)
- Aucun upload côté frontend

## 📦 Implémentation Proposée

### Phase 1: Backend - Service Upload

#### 1.1 Dépendances Maven (pom.xml)

Ajouter imgscalr pour redimensionnement d'images:

```xml
<dependency>
    <groupId>org.imgscalr</groupId>
    <artifactId>imgscalr-lib</artifactId>
    <version>4.2</version>
</dependency>
```

#### 1.2 Configuration (application.properties)

```properties
# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB

# Blog Images
app.blog.thumbnail-size=300
```

#### 1.3 Mise à jour BlogImage Entity

Modifier `entity/BlogImage.java`:

```java
@Entity
@Table(name = "blog_image", indexes = {
    @Index(name = "idx_image_uploader", columnList = "uploaded_by_id"),
    @Index(name = "idx_image_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogImage {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 255)
    private String originalFileName; // Nom original uploadé par l'utilisateur

    @Column(nullable = false, length = 20)
    private String mimeType; // image/jpeg, image/png, image/webp

    @Column(nullable = false)
    private Long fileSize; // Taille fichier original en bytes

    @Column(nullable = false)
    private Integer width; // Largeur image originale

    @Column(nullable = false)
    private Integer height; // Hauteur image originale

    // NOUVEAUX CHAMPS: Stockage BLOB
    @Lob
    @Column(name = "image_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] imageData; // Image originale (max ~4GB MySQL LONGBLOB)

    @Lob
    @Column(name = "thumbnail_data", columnDefinition = "MEDIUMBLOB")
    private byte[] thumbnailData; // Thumbnail redimensionné (max ~16MB MySQL MEDIUMBLOB)

    @Column(nullable = false)
    private Integer thumbnailWidth; // Largeur thumbnail

    @Column(nullable = false)
    private Integer thumbnailHeight; // Hauteur thumbnail

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Transient fields (non-persistés, calculés à la volée)
    @Transient
    public String getUrl() {
        // Retourner data URL pour l'image originale
        if (imageData == null) return null;
        String base64 = Base64.getEncoder().encodeToString(imageData);
        return String.format("data:%s;base64,%s", mimeType, base64);
    }

    @Transient
    public String getThumbnailUrl() {
        // Retourner data URL pour le thumbnail
        if (thumbnailData == null) return null;
        String base64 = Base64.getEncoder().encodeToString(thumbnailData);
        return String.format("data:%s;base64,%s", mimeType, base64);
    }
}
```

**Important:**
- ⚠️ Supprimer les colonnes `fileName`, `url`, `thumbnailUrl` si elles existent (migration DB)
- ✅ `getUrl()` et `getThumbnailUrl()` deviennent des méthodes calculées (@Transient)
- ✅ Base64 encode à la volée lors de la sérialisation DTO

#### 1.4 BlogImageService

Créer `service/BlogImageService.java`:

**Méthodes principales:**
- `uploadImage(MultipartFile file, String userId)` → BlogImageDto
  - Validation: type MIME (jpg/png/webp), taille max 5MB
  - Lecture bytes du fichier (file.getBytes())
  - Génération thumbnail (300px max) avec imgscalr
  - Extraction dimensions (BufferedImage)
  - Stockage bytes en DB (BLOB)
  - Retour DTO avec data URLs (base64)

- `getAllImages(String userId)` → List<BlogImageDto>
  - ⚠️ **ATTENTION**: Ne PAS charger `imageData` (trop lourd), uniquement thumbnails
  - Utiliser projection JPA pour exclure `imageData`
  - Trier par createdAt DESC

- `getImageById(String imageId)` → BlogImageDto
  - Charger image complète (avec `imageData`) pour affichage pleine résolution
  - Utilisé uniquement pour visualisation individuelle

- `deleteImage(String imageId, String userId)` → void
  - Vérifier ownership (uploadedBy == userId)
  - Supprimer entité DB (cascade supprime bytes BLOB automatiquement)

**Code pattern (VERSION BLOB):**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class BlogImageService {
    private final BlogImageRepository blogImageRepository;
    private final UserRepository userRepository;

    @Value("${app.blog.thumbnail-size:300}")
    private int thumbnailSize;

    public BlogImageDto uploadImage(MultipartFile file, String userId) throws IOException {
        // 1. Validation
        validateFile(file);

        // 2. Lecture bytes
        byte[] imageBytes = file.getBytes();

        // 3. Extraction dimensions image originale
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // 4. Génération thumbnail
        BufferedImage thumbnailImage = Scalr.resize(originalImage,
            Scalr.Method.QUALITY,
            Scalr.Mode.FIT_TO_WIDTH,
            thumbnailSize,
            Scalr.OP_ANTIALIAS);

        int thumbnailWidth = thumbnailImage.getWidth();
        int thumbnailHeight = thumbnailImage.getHeight();

        // 5. Conversion thumbnail en bytes
        ByteArrayOutputStream thumbnailBaos = new ByteArrayOutputStream();
        ImageIO.write(thumbnailImage, "jpg", thumbnailBaos);
        byte[] thumbnailBytes = thumbnailBaos.toByteArray();

        // 6. Sauvegarde en DB
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        BlogImage image = BlogImage.builder()
            .originalFileName(file.getOriginalFilename())
            .mimeType(file.getContentType())
            .fileSize(file.getSize())
            .width(width)
            .height(height)
            .imageData(imageBytes) // BLOB original
            .thumbnailData(thumbnailBytes) // BLOB thumbnail
            .thumbnailWidth(thumbnailWidth)
            .thumbnailHeight(thumbnailHeight)
            .uploadedBy(uploader)
            .build();

        image = blogImageRepository.save(image);
        log.info("Image uploadée: {} ({}x{}, {} bytes)",
                 image.getOriginalFileName(), width, height, file.getSize());

        return toDto(image);
    }

    public List<BlogImageDto> getAllImages(String userId) {
        // IMPORTANT: Ne charger QUE les thumbnails (pas imageData)
        // Utiliser une projection ou un DTO query
        List<BlogImage> images = blogImageRepository.findAllByOrderByCreatedAtDesc();

        return images.stream()
                .map(this::toDtoWithoutFullImage) // Exclure imageData
                .collect(Collectors.toList());
    }

    public BlogImageDto getImageById(String imageId) {
        // Charger l'image COMPLÈTE (avec imageData)
        BlogImage image = blogImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));

        return toDto(image); // Inclure imageData
    }

    public void deleteImage(String imageId, String userId) {
        BlogImage image = blogImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));

        // Vérifier ownership
        if (!image.getUploadedBy().getId().equals(userId)) {
            throw new RuntimeException("Vous n'êtes pas propriétaire de cette image");
        }

        blogImageRepository.delete(image);
        log.info("Image supprimée: {} par user {}", image.getId(), userId);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier vide");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Fichier trop volumineux (max 5MB)");
        }

        String contentType = file.getContentType();
        if (!Arrays.asList("image/jpeg", "image/png", "image/webp").contains(contentType)) {
            throw new IllegalArgumentException("Format non supporté (jpg/png/webp uniquement)");
        }
    }

    private BlogImageDto toDto(BlogImage image) {
        return BlogImageDto.builder()
                .id(image.getId())
                .originalFileName(image.getOriginalFileName())
                .url(image.getUrl()) // Méthode @Transient qui génère data URL
                .thumbnailUrl(image.getThumbnailUrl()) // Méthode @Transient
                .mimeType(image.getMimeType())
                .fileSize(image.getFileSize())
                .width(image.getWidth())
                .height(image.getHeight())
                .uploadedById(image.getUploadedBy().getId())
                .uploadedByName(image.getUploadedBy().getFirstName() + " " + image.getUploadedBy().getLastName())
                .createdAt(image.getCreatedAt())
                .build();
    }

    private BlogImageDto toDtoWithoutFullImage(BlogImage image) {
        // Version allégée pour liste (seulement thumbnail, pas full image)
        return BlogImageDto.builder()
                .id(image.getId())
                .originalFileName(image.getOriginalFileName())
                .thumbnailUrl(image.getThumbnailUrl()) // Seulement thumbnail
                // url (full image) non inclus dans la liste
                .mimeType(image.getMimeType())
                .fileSize(image.getFileSize())
                .width(image.getWidth())
                .height(image.getHeight())
                .uploadedById(image.getUploadedBy().getId())
                .uploadedByName(image.getUploadedBy().getFirstName() + " " + image.getUploadedBy().getLastName())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
```

**Optimisation Performance:**
- ⚠️ **CRITIQUE**: Ne JAMAIS charger `imageData` dans les listes (trop lourd)
- ✅ Utiliser projection JPA ou DTO query pour exclure `imageData`
- ✅ Charger `imageData` uniquement pour visualisation individuelle

#### 1.5 BlogImageController

Créer `controller/BlogImageController.java`:

**Endpoints:**
- `POST /blog/images/upload` → Upload image (BLOG_WRITE requis)
- `GET /blog/images` → Liste images (BLOG_READ requis)
- `DELETE /blog/images/:id` → Supprimer image (BLOG_WRITE requis, ownership check)

**Code pattern:**

```java
@RestController
@RequestMapping("/blog/images")
@RequiredArgsConstructor
@Slf4j
public class BlogImageController {

    private final BlogImageService blogImageService;
    private final JwtUtil jwtUtil;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<BlogImageDto> uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        BlogImageDto image = blogImageService.uploadImage(file, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(image);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PERMISSION_BLOG_READ', 'PERMISSION_BLOG_WRITE')")
    public ResponseEntity<List<BlogImageDto>> getAllImages(HttpServletRequest request) {
        String userId = jwtUtil.extractUserIdFromRequest(request).orElse(null);
        List<BlogImageDto> images = blogImageService.getAllImages(userId);
        return ResponseEntity.ok(images);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_BLOG_WRITE')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable String id,
            HttpServletRequest request) {

        String userId = jwtUtil.extractUserIdFromRequest(request)
                .orElseThrow(() -> new RuntimeException("Non authentifié"));

        blogImageService.deleteImage(id, userId);
        return ResponseEntity.noContent().build();
    }
}
```

#### 1.6 DTO BlogImageDto

Créer `dto/BlogImageDto.java`:

```java
@Data
@Builder
public class BlogImageDto {
    private String id;
    private String fileName;
    private String originalFileName;
    private String url;
    private String thumbnailUrl;
    private String mimeType;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private String uploadedById;
    private String uploadedByName; // Prénom + Nom
    private LocalDateTime createdAt;
}
```

#### 1.7 Mise à jour SecurityConfig

⚠️ **Aucune modification nécessaire** pour BLOB storage (pas d'endpoints statiques à servir)

### Phase 2: Frontend - Service Upload

#### 2.1 Service BlogImageService

Créer `services/blog-image.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class BlogImageService {
  private apiUrl = '/api/blog/images';

  private imagesSubject = new BehaviorSubject<BlogImage[]>([]);
  public images$ = this.imagesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadImages();
  }

  async uploadImage(file: File): Promise<BlogImage> {
    const formData = new FormData();
    formData.append('file', file);

    const image = await firstValueFrom(
      this.http.post<BlogImage>(`${this.apiUrl}/upload`, formData)
    );

    // Refresh list
    await this.loadImages();

    return image;
  }

  async loadImages(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      const images = await firstValueFrom(
        this.http.get<BlogImage[]>(this.apiUrl)
      );
      this.imagesSubject.next(images);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteImage(imageId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${imageId}`)
    );
    await this.loadImages();
  }
}
```

#### 2.2 Model BlogImage

Ajouter dans `models/blog.model.ts`:

```typescript
export interface BlogImage {
  id?: string;
  fileName: string;
  originalFileName: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}
```

### Phase 3: Frontend - Modal Upload

#### 3.1 ImageUploadModalComponent

Créer `components/blog/image-upload-modal.component.ts`:

**Features:**
- Drag & drop zone
- Sélection fichier (click)
- Preview avant upload
- Progress bar
- Galerie images existantes (réutilisation)
- Filtrage par recherche
- Suppression avec confirmation

**Template:**
```html
<div class="modal-overlay" (click)="close()">
  <div class="modal-content" (click)="$event.stopPropagation()">
    <!-- Header -->
    <div class="modal-header">
      <h2>Ajouter une image</h2>
      <button (click)="close()">×</button>
    </div>

    <!-- Tabs: Upload | Galerie -->
    <div class="tabs">
      <button [class.active]="activeTab === 'upload'"
              (click)="activeTab = 'upload'">
        Upload
      </button>
      <button [class.active]="activeTab === 'gallery'"
              (click)="activeTab = 'gallery'">
        Galerie ({{ (images$ | async)?.length || 0 }})
      </button>
    </div>

    <!-- Tab Upload -->
    <div *ngIf="activeTab === 'upload'" class="tab-content">
      <!-- Drag & Drop Zone -->
      <div class="dropzone"
           (drop)="onDrop($event)"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           [class.dragover]="isDragging">
        <span class="material-icons">cloud_upload</span>
        <p>Glissez une image ici ou cliquez pour sélectionner</p>
        <p class="text-sm">JPG, PNG, WEBP - Max 5MB</p>
        <input type="file"
               #fileInput
               accept="image/jpeg,image/png,image/webp"
               (change)="onFileSelected($event)"
               hidden>
        <button (click)="fileInput.click()">Choisir un fichier</button>
      </div>

      <!-- Preview -->
      <div *ngIf="selectedFile" class="preview">
        <img [src]="previewUrl" alt="Preview">
        <div class="file-info">
          <p>{{ selectedFile.name }}</p>
          <p>{{ formatFileSize(selectedFile.size) }}</p>
        </div>
        <button (click)="clearSelection()">Annuler</button>
      </div>

      <!-- Progress Bar -->
      <div *ngIf="uploading" class="progress-bar">
        <div class="progress" [style.width.%]="uploadProgress"></div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button (click)="close()">Annuler</button>
        <button (click)="upload()"
                [disabled]="!selectedFile || uploading">
          {{ uploading ? 'Upload...' : 'Upload' }}
        </button>
      </div>
    </div>

    <!-- Tab Gallery -->
    <div *ngIf="activeTab === 'gallery'" class="tab-content">
      <!-- Search -->
      <input type="search"
             [(ngModel)]="searchQuery"
             placeholder="Rechercher...">

      <!-- Grid -->
      <div class="image-grid">
        <div *ngFor="let image of filteredImages$ | async"
             class="image-card"
             (click)="selectImage(image)">
          <img [src]="image.thumbnailUrl" [alt]="image.originalFileName">
          <div class="overlay">
            <span class="material-icons">check_circle</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Component:**
```typescript
@Component({ /* ... */ })
export class ImageUploadModalComponent {
  @Output() imageSelected = new EventEmitter<BlogImage>();
  @Output() close = new EventEmitter<void>();

  activeTab: 'upload' | 'gallery' = 'upload';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;
  isDragging = false;
  searchQuery = '';

  images$ = this.blogImageService.images$;

  get filteredImages$() {
    return this.images$.pipe(
      map(images => images.filter(img =>
        img.originalFileName.toLowerCase().includes(this.searchQuery.toLowerCase())
      ))
    );
  }

  constructor(private blogImageService: BlogImageService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    // Validation
    if (!this.isValidFile(file)) {
      return;
    }

    this.selectedFile = file;

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  isValidFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format non supporté');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5MB)');
      return false;
    }

    return true;
  }

  async upload() {
    if (!this.selectedFile) return;

    try {
      this.uploading = true;
      this.uploadProgress = 0;

      // Simulate progress (real implementation would use HTTP progress events)
      const progressInterval = setInterval(() => {
        this.uploadProgress = Math.min(this.uploadProgress + 10, 90);
      }, 100);

      const image = await this.blogImageService.uploadImage(this.selectedFile);

      clearInterval(progressInterval);
      this.uploadProgress = 100;

      this.imageSelected.emit(image);
      this.close.emit();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      this.uploading = false;
    }
  }

  selectImage(image: BlogImage) {
    this.imageSelected.emit(image);
    this.close.emit();
  }

  clearSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
```

### Phase 4: Intégration Quill.js

#### 4.1 Custom Image Handler

Modifier `blog-post-form.component.ts`:

```typescript
initializeQuill(): void {
  const toolbarOptions = [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'code-block'], // Bouton image existant
    ['clean']
  ];

  this.quillEditor = new Quill(this.editorElement.nativeElement, {
    theme: 'snow',
    modules: {
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: this.imageHandler.bind(this) // Custom handler
        }
      }
    },
    placeholder: 'Écrivez votre article ici...'
  });

  // ... reste du code
}

imageHandler() {
  // Ouvrir la modal d'upload
  this.showImageUploadModal = true;
}

onImageSelected(image: BlogImage) {
  // Insérer l'image dans Quill
  const range = this.quillEditor.getSelection(true);
  this.quillEditor.insertEmbed(range.index, 'image', image.url);

  // Ajouter un espace après l'image
  this.quillEditor.setSelection(range.index + 1);

  this.showImageUploadModal = false;
}
```

**Template:**
```html
<!-- Image Upload Modal -->
<app-image-upload-modal
  *ngIf="showImageUploadModal"
  (imageSelected)="onImageSelected($event)"
  (close)="showImageUploadModal = false"
></app-image-upload-modal>
```

#### 4.2 Cover Image Upload

Ajouter dans `blog-post-form.component.ts`:

**Template:**
```html
<!-- Cover Image -->
<div>
  <label>Image de couverture</label>

  <!-- Preview si déjà uploadée -->
  <div *ngIf="formData.coverImage" class="cover-preview">
    <img [src]="formData.coverImage" alt="Cover">
    <button (click)="removeCoverImage()">
      <span class="material-icons">delete</span>
    </button>
  </div>

  <!-- Upload button -->
  <button type="button"
          (click)="showCoverImageUpload = true"
          class="btn-secondary">
    <span class="material-icons">add_photo_alternate</span>
    {{ formData.coverImage ? 'Changer' : 'Ajouter' }} l'image de couverture
  </button>
</div>

<!-- Cover Image Upload Modal -->
<app-image-upload-modal
  *ngIf="showCoverImageUpload"
  (imageSelected)="onCoverImageSelected($event)"
  (close)="showCoverImageUpload = false"
></app-image-upload-modal>
```

**Component:**
```typescript
showCoverImageUpload = false;

onCoverImageSelected(image: BlogImage) {
  this.formData.coverImage = image.url;
  this.showCoverImageUpload = false;
}

removeCoverImage() {
  this.formData.coverImage = '';
}
```

## ✅ Checklist de Tests

### Backend
- [ ] Upload image JPG/PNG/WEBP < 5MB → 201 Created
- [ ] Upload image > 5MB → 400 Bad Request
- [ ] Upload fichier non-image → 400 Bad Request
- [ ] GET /blog/images → 200 avec liste (thumbnails uniquement, pas imageData)
- [ ] GET /blog/images/:id → 200 avec image complète (imageData inclus)
- [ ] DELETE /blog/images/:id (owner) → 204 No Content
- [ ] DELETE /blog/images/:id (non-owner) → 403 Forbidden
- [ ] BLOBs stockés en DB (vérifier via MySQL Workbench ou SELECT LENGTH(image_data))
- [ ] Thumbnails générés et stockés (vérifier LENGTH(thumbnail_data))
- [ ] Data URLs retournées correctement (format: data:image/jpeg;base64,...)
- [ ] Permissions BLOG_WRITE pour upload
- [ ] Permissions BLOG_READ pour liste

### Frontend
- [ ] Modal s'ouvre au clic sur bouton image Quill
- [ ] Drag & drop zone fonctionne
- [ ] Preview image avant upload
- [ ] Progress bar affichée pendant upload
- [ ] Galerie affiche toutes les images
- [ ] Recherche dans galerie fonctionne
- [ ] Sélection image dans galerie insère dans Quill
- [ ] Upload cover image fonctionne
- [ ] Preview cover image affichée
- [ ] Suppression cover image fonctionne
- [ ] Dark mode compatible

## 📚 Documentation à Mettre à Jour

- [ ] CLAUDE.md - Section "Upload d'Images Blog"
- [ ] README.md (si existant) - Mention upload images
- [ ] API docs (Swagger/OpenAPI) - Endpoints `/blog/images`

## 🔐 Sécurité

- ✅ Validation type MIME côté backend
- ✅ Validation taille fichier (5MB max)
- ✅ Permissions BLOG_WRITE pour upload
- ✅ Ownership check pour suppression
- ✅ Génération noms fichiers sécurisés (UUID)
- ✅ Pas d'exécution de scripts (images uniquement)

## 🚀 Optimisations Futures (v2.1+)

- [ ] Upload progress real-time (HTTP progress events)
- [ ] Support WebP pour meilleure compression
- [ ] Lazy loading galerie (pagination)
- [ ] CDN pour hébergement images
- [ ] Watermark automatique
- [ ] Compression EXIF metadata removal
- [ ] Cache browser (Cache-Control headers)

---

**Date de création:** 2024-12-25
**Priorité:** HAUTE
**Estimation:** 4-6h implémentation + tests
