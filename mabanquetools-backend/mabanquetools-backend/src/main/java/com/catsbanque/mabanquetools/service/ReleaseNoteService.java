package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.CreateReleaseNoteEntryRequest;
import com.catsbanque.mabanquetools.dto.ReleaseNoteEntryDto;
import com.catsbanque.mabanquetools.entity.Microservice;
import com.catsbanque.mabanquetools.entity.Release;
import com.catsbanque.mabanquetools.entity.ReleaseNoteEntry;
import com.catsbanque.mabanquetools.repository.MicroserviceRepository;
import com.catsbanque.mabanquetools.repository.ReleaseNoteEntryRepository;
import com.catsbanque.mabanquetools.repository.ReleaseRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReleaseNoteService {

        private final ReleaseNoteEntryRepository releaseNoteEntryRepository;
        private final ReleaseRepository releaseRepository;
        private final MicroserviceRepository microserviceRepository;
        private final com.catsbanque.mabanquetools.repository.FeatureRepository featureRepository;
        private final ObjectMapper objectMapper;

        /**
         * Récupère toutes les entrées d'une release
         */
        public List<ReleaseNoteEntryDto> getAllEntries(String releaseIdentifier) {
                // Résoudre le slug vers l'ID réel (support pour slug OU ID)
                Release release = releaseRepository.findBySlug(releaseIdentifier)
                                .or(() -> releaseRepository.findById(releaseIdentifier))
                                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

                List<ReleaseNoteEntry> entries = releaseNoteEntryRepository
                                .findByReleaseIdOrderBySquadAndDeployOrder(release.getId());
                return entries.stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        /**
         * Crée une nouvelle entrée
         */
        @Transactional
        public ReleaseNoteEntryDto createEntry(String releaseIdentifier, CreateReleaseNoteEntryRequest request) {
                // Vérifier que la release existe (support slug OU ID)
                Release release = releaseRepository.findBySlug(releaseIdentifier)
                                .or(() -> releaseRepository.findById(releaseIdentifier))
                                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

                ReleaseNoteEntry entry = new ReleaseNoteEntry();
                entry.setReleaseId(release.getId());

                // Handle microservice reference (preferred) or legacy free text
                if (request.getMicroserviceId() != null) {
                        // Use microservice reference
                        entry.setMicroserviceId(request.getMicroserviceId());

                        // Optionally load microservice to get display name
                        microserviceRepository.findById(request.getMicroserviceId())
                                        .ifPresent(ms -> entry.setMicroservice(ms.getName()));
                } else if (request.getMicroservice() != null) {
                        // Legacy: free text microservice name
                        entry.setMicroservice(request.getMicroservice());
                }

                entry.setSquad(request.getSquad());
                entry.setPartEnMep(request.getPartEnMep());
                entry.setDeployOrder(request.getDeployOrder());
                entry.setTag(request.getTag());
                entry.setPreviousTag(request.getPreviousTag());
                entry.setParentVersion(request.getParentVersion());
                entry.setComment(request.getComment());
                entry.setStatus(request.getStatus());

                // Convertir les changes en JSON
                try {
                        String changesJson = objectMapper.writeValueAsString(request.getChanges());
                        entry.setChanges(changesJson);
                } catch (JsonProcessingException e) {
                        log.error("Erreur lors de la conversion des changes en JSON", e);
                        entry.setChanges("[]");
                }

                ReleaseNoteEntry saved = releaseNoteEntryRepository.save(entry);
                return convertToDto(saved);
        }

        /**
         * Met à jour une entrée existante
         */
        @Transactional
        public ReleaseNoteEntryDto updateEntry(String releaseIdentifier, String entryId,
                        CreateReleaseNoteEntryRequest request) {
                // Résoudre le slug vers l'ID réel (support slug OU ID)
                Release release = releaseRepository.findBySlug(releaseIdentifier)
                                .or(() -> releaseRepository.findById(releaseIdentifier))
                                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

                ReleaseNoteEntry entry = releaseNoteEntryRepository.findById(entryId)
                                .orElseThrow(() -> new RuntimeException("Entrée non trouvée avec l'id: " + entryId));

                // Vérifier que l'entrée appartient bien à la release
                if (!entry.getReleaseId().equals(release.getId())) {
                        throw new RuntimeException("L'entrée n'appartient pas à cette release");
                }

                // Handle microservice reference (preferred) or legacy free text
                if (request.getMicroserviceId() != null) {
                        // Use microservice reference
                        entry.setMicroserviceId(request.getMicroserviceId());

                        // Optionally load microservice to get display name
                        microserviceRepository.findById(request.getMicroserviceId())
                                        .ifPresent(ms -> entry.setMicroservice(ms.getName()));
                } else if (request.getMicroservice() != null) {
                        // Legacy: free text microservice name
                        entry.setMicroservice(request.getMicroservice());
                }

                entry.setSquad(request.getSquad());
                entry.setPartEnMep(request.getPartEnMep());
                entry.setDeployOrder(request.getDeployOrder());
                entry.setTag(request.getTag());
                entry.setPreviousTag(request.getPreviousTag());
                entry.setParentVersion(request.getParentVersion());
                entry.setComment(request.getComment());
                entry.setStatus(request.getStatus());

                // Convertir les changes en JSON
                try {
                        String changesJson = objectMapper.writeValueAsString(request.getChanges());
                        entry.setChanges(changesJson);
                } catch (JsonProcessingException e) {
                        log.error("Erreur lors de la conversion des changes en JSON", e);
                        entry.setChanges("[]");
                }

                ReleaseNoteEntry updated = releaseNoteEntryRepository.save(entry);
                return convertToDto(updated);
        }

        /**
         * Supprime une entrée
         */
        @Transactional
        public void deleteEntry(String releaseIdentifier, String entryId) {
                // Résoudre le slug vers l'ID réel (support slug OU ID)
                Release release = releaseRepository.findBySlug(releaseIdentifier)
                                .or(() -> releaseRepository.findById(releaseIdentifier))
                                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

                ReleaseNoteEntry entry = releaseNoteEntryRepository.findById(entryId)
                                .orElseThrow(() -> new RuntimeException("Entrée non trouvée avec l'id: " + entryId));

                // Vérifier que l'entrée appartient bien à la release
                if (!entry.getReleaseId().equals(release.getId())) {
                        throw new RuntimeException("L'entrée n'appartient pas à cette release");
                }

                releaseNoteEntryRepository.delete(entry);
        }

        /**
         * Récupère tous les tags précédents (N-1) pour tous les microservices d'une
         * release
         * Retourne une Map<microserviceId, previousTag>
         *
         * Utilisé par MicroserviceService pour enrichir les microservices avec
         * previousTag
         */
        public Map<String, String> getAllPreviousTags(String currentReleaseId) {
                List<ReleaseNoteEntry> previousEntries = releaseNoteEntryRepository
                                .findAllPreviousTagsForRelease(currentReleaseId);

                Map<String, String> previousTags = new java.util.HashMap<>();
                for (ReleaseNoteEntry entry : previousEntries) {
                        if (entry.getMicroserviceId() != null && entry.getTag() != null) {
                                previousTags.put(entry.getMicroserviceId(), entry.getTag());
                        }
                }

                return previousTags;
        }

        /**
         * Exporte la release note en Markdown (colonnes filtrées: microservice,
         * solution, squad, changes)
         */
        public String exportMarkdown(String releaseIdentifier) {
                // Résoudre le slug vers l'ID réel (support slug OU ID)
                Release release = releaseRepository.findBySlug(releaseIdentifier)
                                .or(() -> releaseRepository.findById(releaseIdentifier))
                                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

                List<ReleaseNoteEntry> entries = releaseNoteEntryRepository
                                .findByReleaseIdOrderBySquadAndDeployOrder(release.getId());

                // Filtrer uniquement les entrées déployées (partEnMep=true)
                List<ReleaseNoteEntry> deployed = entries.stream()
                                .filter(e -> e.getPartEnMep() != null && e.getPartEnMep())
                                .collect(Collectors.toList());

                // Grouper par squad
                Map<String, List<ReleaseNoteEntry>> entriesBySquad = deployed.stream()
                                .collect(Collectors.groupingBy(
                                                ReleaseNoteEntry::getSquad,
                                                TreeMap::new,
                                                Collectors.toList()));

                StringBuilder markdown = new StringBuilder();
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

                // Header
                markdown.append("# Release Note - ").append(release.getName()).append("\n\n");
                markdown.append("**Date de MEP**: ").append(release.getReleaseDate().format(dateFormatter))
                                .append("\n\n");
                if (release.getDescription() != null && !release.getDescription().isEmpty()) {
                        markdown.append(release.getDescription()).append("\n\n");
                }
                markdown.append("---\n\n");

                // Contenu par squad (uniquement colonnes: microservice, solution, squad,
                // changes)
                for (Map.Entry<String, List<ReleaseNoteEntry>> squadEntry : entriesBySquad.entrySet()) {
                        String squad = squadEntry.getKey();
                        List<ReleaseNoteEntry> squadEntries = squadEntry.getValue();

                        markdown.append("## ").append(squad).append("\n\n");

                        markdown.append("| Microservice | Solution | Changes |\n");
                        markdown.append("|-------------|----------|----------|\n");

                        for (ReleaseNoteEntry entry : squadEntries) {
                                // Récupérer solution depuis le microservice
                                String solution = "-";
                                if (entry.getMicroserviceId() != null) {
                                        solution = microserviceRepository.findById(entry.getMicroserviceId())
                                                        .map(Microservice::getSolution)
                                                        .orElse("-");
                                }

                                markdown.append("| ")
                                                .append(entry.getMicroservice() != null ? entry.getMicroservice() : "-")
                                                .append(" | ")
                                                .append(solution)
                                                .append(" | ");

                                // Changes
                                List<ReleaseNoteEntryDto.ChangeItem> changes = parseChanges(entry.getChanges());
                                if (changes.isEmpty()) {
                                        markdown.append("-");
                                } else {
                                        markdown.append(changes.stream()
                                                        .map(c -> "**" + c.getJiraId() + "**: " + c.getDescription())
                                                        .collect(Collectors.joining("<br>")));
                                }
                                markdown.append(" |\n");
                        }
                        markdown.append("\n---\n\n");
                }

                return markdown.toString();
        }

        /**
         * Exporte la release note en HTML avec design "wow" (colonnes filtrées:
         * microservice, solution, squad, changes)
         */
        public String exportHtml(String releaseIdentifier) {
                // Résoudre le slug vers l'ID réel (support slug OU ID)
                Release release = releaseRepository.findBySlug(releaseIdentifier)
                                .or(() -> releaseRepository.findById(releaseIdentifier))
                                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

                List<ReleaseNoteEntry> entries = releaseNoteEntryRepository
                                .findByReleaseIdOrderBySquadAndDeployOrder(release.getId());

                // Filtrer uniquement les entrées déployées (partEnMep=true)
                List<ReleaseNoteEntry> deployed = entries.stream()
                                .filter(e -> e.getPartEnMep() != null && e.getPartEnMep())
                                .collect(Collectors.toList());

                // Grouper par squad
                Map<String, List<ReleaseNoteEntry>> entriesBySquad = deployed.stream()
                                .collect(Collectors.groupingBy(
                                                ReleaseNoteEntry::getSquad,
                                                TreeMap::new,
                                                Collectors.toList()));

                StringBuilder html = new StringBuilder();
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

                // Couleurs par squad
                String[] squadColors = {
                                "#10b981", // Squad 1 - Emerald
                                "#3b82f6", // Squad 2 - Blue
                                "#8b5cf6", // Squad 3 - Purple
                                "#f59e0b", // Squad 4 - Amber
                                "#ef4444", // Squad 5 - Red
                                "#06b6d4" // Squad 6 - Cyan
                };

                // Fetch Major Features
                List<com.catsbanque.mabanquetools.entity.Feature> majorFeatures = featureRepository
                                .findByReleaseIdAndType(release.getId(), "major");

                // Header HTML avec design moderne
                html.append("<!DOCTYPE html>\n");
                html.append("<html lang=\"fr\">\n");
                html.append("<head>\n");
                html.append("  <meta charset=\"UTF-8\">\n");
                html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
                html.append("  <title>Release Note - ").append(release.getName()).append("</title>\n");
                html.append(
                                "  <link href=\"https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap\" rel=\"stylesheet\">\n");
                html.append("  <style>\n");
                html.append("    * { margin: 0; padding: 0; box-sizing: border-box; }\n");
                html.append(
                                "    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.4; padding: 1.5rem; }\n");
                html.append("    .container { max-width: 1200px; margin: 0 auto; }\n");

                // Header Styles
                html.append(
                                "    .header { background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; border-radius: 16px; padding: 2rem; margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }\n");
                html.append(
                                "    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%); pointer-events: none; }\n");
                html.append(
                                "    .header h1 { font-family: 'Outfit', sans-serif; font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; position: relative; }\n");
                html.append(
                                "    .header-meta { display: flex; align-items: center; gap: 1.5rem; position: relative; font-family: 'Outfit', sans-serif; font-size: 0.95rem; }\n");
                html.append(
                                "    .date-badge { background: rgba(255,255,255,0.25); backdrop-filter: blur(8px); padding: 0.35rem 0.85rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(255,255,255,0.2); }\n");

                // Major Features Styles
                html.append(
                                "    .section-title { font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem; }\n");
                html.append(
                                "    .section-title span { background: #10b981; color: white; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.1rem; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3); }\n");
                html.append(
                                "    .major-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }\n");
                html.append(
                                "    .feature-card { background: white; border-radius: 12px; padding: 1.25rem; transition: transform 0.2s; border: 1px solid #e2e8f0; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }\n");
                html.append(
                                "    .feature-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, #10b981, #34d399); }\n");
                html.append(
                                "    .feature-card h3 { font-family: 'Outfit', sans-serif; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }\n");
                html.append("    .feature-card p { color: #64748b; font-size: 0.95rem; line-height: 1.5; }\n");

                // Detailed Changes Styles
                html.append(
                                "    .details-section { opacity: 0.95; margin-top: 2.5rem; padding-top: 2.5rem; border-top: 1px dashed #cbd5e1; }\n");
                html.append(
                                "    .squads-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; align-items: start; }\n");
                html.append("    @media (max-width: 1000px) { .squads-grid { grid-template-columns: 1fr; } }\n");
                html.append(
                                "    .squad-group { margin-bottom: 0; background: white; border-radius: 12px; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f1f5f9; }\n");
                html.append(
                                "    .squad-header { padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }\n");
                html.append(
                                "    .squad-title { font-family: 'Outfit', sans-serif; font-size: 1.05rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 0.6rem; }\n");
                html.append(
                                "    .squad-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--squad-color); display: inline-block; box-shadow: 0 0 0 3px rgba(255,255,255,0.5); }\n");
                html.append(
                                "    .microservice-row { display: grid; grid-template-columns: 180px 1fr; gap: 1.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; align-items: start; transition: background 0.2s; }\n");
                html.append("    .microservice-row:last-child { border-bottom: none; }\n");
                html.append("    .microservice-row:hover { background: #f8fafc; }\n");
                html.append("    .ms-info { font-weight: 600; color: #475569; font-size: 0.9rem; }\n");
                html.append(
                                "    .ms-solution { font-size: 0.75rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.15rem; }\n");
                html.append("    .changes-list { display: flex; flex-direction: column; gap: 0.5rem; }\n");
                html.append(
                                "    .change-item { display: flex; gap: 0.75rem; align-items: baseline; font-size: 0.9rem; color: #334155; }\n");
                html.append(
                                "    .jira-tag { background: #f1f5f9; color: #64748b; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; white-space: nowrap; font-family: 'Inter', monospace; border: 1px solid #e2e8f0; }\n");
                html.append("    .no-changes { color: #94a3b8; font-style: italic; font-size: 0.85rem; }\n");

                html.append("  </style>\n");
                html.append("</head>\n");
                html.append("<body>\n");
                html.append("  <div class=\"container\">\n");

                // Header
                html.append("    <div class=\"header\">\n");
                html.append("      <h1>").append(release.getName()).append("</h1>\n");
                html.append("      <div class=\"header-meta\">\n");
                html.append("        <div class=\"date-badge\">📅 ")
                                .append(release.getReleaseDate().format(dateFormatter))
                                .append("</div>\n");
                if (release.getDescription() != null && !release.getDescription().isEmpty()) {
                        html.append("        <div>").append(release.getDescription()).append("</div>\n");
                }
                html.append("      </div>\n");
                html.append("    </div>\n");

                // MAJOR FEATURES SECTION
                if (!majorFeatures.isEmpty()) {
                        html.append("    <div class=\"section-title\"><span>★</span> Fonctionnalités Majeures</div>\n");
                        html.append("    <div class=\"major-features-grid\">\n");
                        for (com.catsbanque.mabanquetools.entity.Feature feature : majorFeatures) {
                                html.append("      <div class=\"feature-card\">\n");
                                html.append("        <h3>").append(feature.getTitle()).append("</h3>\n");
                                if (feature.getDescription() != null && !feature.getDescription().isEmpty()) {
                                        html.append("        <p>").append(feature.getDescription()).append("</p>\n");
                                }
                                html.append("      </div>\n");
                        }
                        html.append("    </div>\n");
                }

                // DETAILED SQUADS SECTION
                html.append("    <div class=\"details-section\">\n");
                html.append(
                                "      <div class=\"section-title\" style=\"font-size: 1.5rem; color: #64748b;\"><span>📋</span> Détails techniques par Squad</div>\n\n");
                html.append("      <div class=\"squads-grid\">\n");

                int squadIndex = 0;
                for (Map.Entry<String, List<ReleaseNoteEntry>> squadEntry : entriesBySquad.entrySet()) {
                        String squad = squadEntry.getKey();
                        List<ReleaseNoteEntry> squadEntries = squadEntry.getValue();
                        String squadColor = squadColors[squadIndex % squadColors.length];

                        html.append("      <div class=\"squad-group\" style=\"--squad-color: ").append(squadColor)
                                        .append(";\">\n");
                        html.append("        <div class=\"squad-header\">\n");
                        html.append("          <div class=\"squad-title\"><span class=\"squad-dot\"></span>")
                                        .append(squad)
                                        .append("</div>\n");
                        html.append("          <div style=\"color: #94a3b8; font-weight: 500; font-size: 0.9rem;\">")
                                        .append(squadEntries.size()).append(" microservices</div>\n");
                        html.append("        </div>\n");

                        // Microservice rows
                        for (ReleaseNoteEntry entry : squadEntries) {
                                String solution = "-";
                                if (entry.getMicroserviceId() != null) {
                                        solution = microserviceRepository.findById(entry.getMicroserviceId())
                                                        .map(Microservice::getSolution)
                                                        .orElse("-");
                                }

                                html.append("        <div class=\"microservice-row\">\n");

                                // Column 1: Microservice Info
                                html.append("          <div>\n");
                                html.append("            <div class=\"ms-info\">")
                                                .append(entry.getMicroservice() != null ? entry.getMicroservice() : "-")
                                                .append("</div>\n");
                                html.append("            <div class=\"ms-solution\">").append(solution)
                                                .append("</div>\n");
                                html.append("          </div>\n");

                                // Column 2: Changes
                                html.append("          <div class=\"changes-list\">\n");
                                List<ReleaseNoteEntryDto.ChangeItem> changes = parseChanges(entry.getChanges());

                                if (changes.isEmpty()) {
                                        html.append("            <div class=\"no-changes\">Aucun changement notable</div>\n");
                                } else {
                                        for (ReleaseNoteEntryDto.ChangeItem change : changes) {
                                                html.append("            <div class=\"change-item\">\n");
                                                html.append("              <span class=\"jira-tag\">")
                                                                .append(change.getJiraId())
                                                                .append("</span>\n");
                                                html.append("              <span>").append(change.getDescription())
                                                                .append("</span>\n");
                                                html.append("            </div>\n");
                                        }
                                }
                                html.append("          </div>\n");

                                html.append("        </div>\n"); // End microservice-row
                        }

                        html.append("      </div>\n"); // End squad-group
                        squadIndex++;
                }
                html.append("      </div>\n"); // End squads-grid

                html.append("    </div>\n"); // End details-section
                html.append("  </div>\n"); // End container
                html.append("</body>\n");
                html.append("</html>\n");

                return html.toString();
        }

        /**
         * Convertit une entité en DTO
         */
        private ReleaseNoteEntryDto convertToDto(ReleaseNoteEntry entry) {
                ReleaseNoteEntryDto dto = new ReleaseNoteEntryDto();
                dto.setId(entry.getId());
                dto.setReleaseId(entry.getReleaseId());

                // Microservice information
                dto.setMicroserviceId(entry.getMicroserviceId());
                dto.setMicroservice(entry.getMicroservice()); // Legacy field

                // If microservice reference exists, load additional info
                if (entry.getMicroserviceId() != null) {
                        microserviceRepository.findById(entry.getMicroserviceId())
                                        .ifPresent(ms -> {
                                                dto.setMicroserviceName(ms.getName());
                                                dto.setSolution(ms.getSolution());
                                                // If legacy field is empty, populate it from entity
                                                if (dto.getMicroservice() == null) {
                                                        dto.setMicroservice(ms.getName());
                                                }
                                        });
                } else {
                        // Legacy: use free text microservice name
                        dto.setMicroserviceName(entry.getMicroservice());
                }

                dto.setSquad(entry.getSquad());
                dto.setPartEnMep(entry.getPartEnMep());
                dto.setDeployOrder(entry.getDeployOrder());
                dto.setTag(entry.getTag());
                dto.setPreviousTag(entry.getPreviousTag());
                dto.setParentVersion(entry.getParentVersion());
                dto.setComment(entry.getComment());
                dto.setStatus(entry.getStatus());
                dto.setCreatedAt(entry.getCreatedAt());
                dto.setUpdatedAt(entry.getUpdatedAt());

                // Parser les changes JSON
                List<ReleaseNoteEntryDto.ChangeItem> changes = parseChanges(entry.getChanges());
                dto.setChanges(changes);

                return dto;
        }

        /**
         * Parse les changes JSON en liste de ChangeItem
         */
        private List<ReleaseNoteEntryDto.ChangeItem> parseChanges(String changesJson) {
                if (changesJson == null || changesJson.isEmpty()) {
                        return new ArrayList<>();
                }

                try {
                        return objectMapper.readValue(changesJson,
                                        new TypeReference<List<ReleaseNoteEntryDto.ChangeItem>>() {
                                        });
                } catch (JsonProcessingException e) {
                        log.error("Erreur lors du parsing des changes JSON: {}", changesJson, e);
                        return new ArrayList<>();
                }
        }
}
