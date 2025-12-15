package com.catsbanque.eventplanning.service;

import com.catsbanque.eventplanning.dto.CreateReleaseNoteEntryRequest;
import com.catsbanque.eventplanning.dto.ReleaseNoteEntryDto;
import com.catsbanque.eventplanning.entity.Microservice;
import com.catsbanque.eventplanning.entity.Release;
import com.catsbanque.eventplanning.entity.ReleaseNoteEntry;
import com.catsbanque.eventplanning.repository.MicroserviceRepository;
import com.catsbanque.eventplanning.repository.ReleaseNoteEntryRepository;
import com.catsbanque.eventplanning.repository.ReleaseRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReleaseNoteService {

    private final ReleaseNoteEntryRepository releaseNoteEntryRepository;
    private final ReleaseRepository releaseRepository;
    private final MicroserviceRepository microserviceRepository;
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
    public ReleaseNoteEntryDto updateEntry(String releaseIdentifier, String entryId, CreateReleaseNoteEntryRequest request) {
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
     * Récupère tous les tags précédents (N-1) pour tous les microservices d'une release
     * Retourne une Map<microserviceId, previousTag>
     *
     * Utilisé par MicroserviceService pour enrichir les microservices avec previousTag
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
     * Exporte la release note en Markdown
     */
    public String exportMarkdown(String releaseIdentifier) {
        // Résoudre le slug vers l'ID réel (support slug OU ID)
        Release release = releaseRepository.findBySlug(releaseIdentifier)
                .or(() -> releaseRepository.findById(releaseIdentifier))
                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

        List<ReleaseNoteEntry> entries = releaseNoteEntryRepository
                .findByReleaseIdOrderBySquadAndDeployOrder(release.getId());

        // Grouper par squad
        Map<String, List<ReleaseNoteEntry>> entriesBySquad = entries.stream()
                .collect(Collectors.groupingBy(
                        ReleaseNoteEntry::getSquad,
                        LinkedHashMap::new,
                        Collectors.toList()));

        StringBuilder markdown = new StringBuilder();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

        // Header
        markdown.append("# Release Note - ").append(release.getName()).append("\n\n");
        markdown.append("**Date de MEP**: ").append(release.getReleaseDate().format(dateFormatter)).append("\n\n");
        if (release.getDescription() != null && !release.getDescription().isEmpty()) {
            markdown.append(release.getDescription()).append("\n\n");
        }
        markdown.append("---\n\n");

        // Contenu par squad
        for (Map.Entry<String, List<ReleaseNoteEntry>> squadEntry : entriesBySquad.entrySet()) {
            String squad = squadEntry.getKey();
            List<ReleaseNoteEntry> squadEntries = squadEntry.getValue();

            markdown.append("## ").append(squad).append("\n\n");

            // Microservices déployés (partEnMep=true)
            List<ReleaseNoteEntry> deployed = squadEntries.stream()
                    .filter(e -> e.getPartEnMep() != null && e.getPartEnMep())
                    .collect(Collectors.toList());

            if (!deployed.isEmpty()) {
                markdown.append("### Microservices déployés\n\n");
                markdown.append("| Ordre | Microservice | Tag | Parent | Changes |\n");
                markdown.append("|-------|-------------|-----|--------|----------|\n");

                for (ReleaseNoteEntry entry : deployed) {
                    markdown.append("| ")
                            .append(entry.getDeployOrder() != null ? entry.getDeployOrder() : "-")
                            .append(" | ")
                            .append(entry.getMicroservice())
                            .append(" | ")
                            .append(entry.getTag() != null ? entry.getTag() : "-")
                            .append(" | ")
                            .append(entry.getParentVersion() != null ? entry.getParentVersion() : "-")
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
                markdown.append("\n");
            }

            // Microservices non déployés (partEnMep=false)
            List<ReleaseNoteEntry> notDeployed = squadEntries.stream()
                    .filter(e -> e.getPartEnMep() == null || !e.getPartEnMep())
                    .collect(Collectors.toList());

            if (!notDeployed.isEmpty()) {
                markdown.append("### Microservices non déployés\n\n");
                for (ReleaseNoteEntry entry : notDeployed) {
                    markdown.append("- **").append(entry.getMicroservice()).append("**");
                    if (entry.getParentVersion() != null) {
                        markdown.append(" (Parent: ").append(entry.getParentVersion()).append(")");
                    }
                    markdown.append("\n");
                }
                markdown.append("\n");
            }

            markdown.append("---\n\n");
        }

        return markdown.toString();
    }

    /**
     * Exporte la release note en HTML
     */
    public String exportHtml(String releaseIdentifier) {
        // Résoudre le slug vers l'ID réel (support slug OU ID)
        Release release = releaseRepository.findBySlug(releaseIdentifier)
                .or(() -> releaseRepository.findById(releaseIdentifier))
                .orElseThrow(() -> new RuntimeException("Release non trouvée: " + releaseIdentifier));

        List<ReleaseNoteEntry> entries = releaseNoteEntryRepository
                .findByReleaseIdOrderBySquadAndDeployOrder(release.getId());

        // Grouper par squad
        Map<String, List<ReleaseNoteEntry>> entriesBySquad = entries.stream()
                .collect(Collectors.groupingBy(
                        ReleaseNoteEntry::getSquad,
                        LinkedHashMap::new,
                        Collectors.toList()));

        StringBuilder html = new StringBuilder();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

        // Header HTML
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"fr\">\n");
        html.append("<head>\n");
        html.append("  <meta charset=\"UTF-8\">\n");
        html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("  <title>Release Note - ").append(release.getName()).append("</title>\n");
        html.append("  <style>\n");
        html.append(
                "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; background: #f9fafb; }\n");
        html.append(
                "    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }\n");
        html.append("    .header h1 { margin: 0 0 0.5rem 0; font-size: 2rem; }\n");
        html.append("    .header .date { font-size: 1.1rem; opacity: 0.9; }\n");
        html.append("    .header .description { margin-top: 1rem; font-size: 1rem; opacity: 0.95; }\n");
        html.append(
                "    .squad { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }\n");
        html.append(
                "    .squad-header { background: #10b981; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600; }\n");
        html.append(
                "    .section-title { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 0.75rem 0; color: #374151; }\n");
        html.append("    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }\n");
        html.append(
                "    th { background: #f3f4f6; padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }\n");
        html.append("    td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; vertical-align: top; }\n");
        html.append("    .change-item { margin: 0.25rem 0; }\n");
        html.append("    .jira-id { font-weight: 600; color: #10b981; }\n");
        html.append("    .not-deployed { list-style: none; padding: 0; }\n");
        html.append("    .not-deployed li { padding: 0.5rem 0; color: #6b7280; }\n");
        html.append("    .not-deployed strong { color: #374151; }\n");
        html.append("  </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");

        // Header
        html.append("  <div class=\"header\">\n");
        html.append("    <h1>Release Note - ").append(release.getName()).append("</h1>\n");
        html.append("    <div class=\"date\">Date de MEP: <strong>")
                .append(release.getReleaseDate().format(dateFormatter)).append("</strong></div>\n");
        if (release.getDescription() != null && !release.getDescription().isEmpty()) {
            html.append("    <div class=\"description\">").append(release.getDescription()).append("</div>\n");
        }
        html.append("  </div>\n\n");

        // Contenu par squad
        for (Map.Entry<String, List<ReleaseNoteEntry>> squadEntry : entriesBySquad.entrySet()) {
            String squad = squadEntry.getKey();
            List<ReleaseNoteEntry> squadEntries = squadEntry.getValue();

            html.append("  <div class=\"squad\">\n");
            html.append("    <div class=\"squad-header\">").append(squad).append("</div>\n");

            // Microservices déployés
            List<ReleaseNoteEntry> deployed = squadEntries.stream()
                    .filter(e -> e.getPartEnMep() != null && e.getPartEnMep())
                    .collect(Collectors.toList());

            if (!deployed.isEmpty()) {
                html.append("    <div class=\"section-title\">Microservices déployés</div>\n");
                html.append("    <table>\n");
                html.append("      <thead>\n");
                html.append("        <tr>\n");
                html.append("          <th>Ordre</th>\n");
                html.append("          <th>Microservice</th>\n");
                html.append("          <th>Tag</th>\n");
                html.append("          <th>MaBanque Librairie</th>\n");
                html.append("          <th>Changes</th>\n");
                html.append("        </tr>\n");
                html.append("      </thead>\n");
                html.append("      <tbody>\n");

                for (ReleaseNoteEntry entry : deployed) {
                    html.append("        <tr>\n");
                    html.append("          <td>")
                            .append(entry.getDeployOrder() != null ? entry.getDeployOrder().toString() : "-")
                            .append("</td>\n");
                    html.append("          <td><strong>").append(entry.getMicroservice()).append("</strong></td>\n");
                    html.append("          <td>").append(entry.getTag() != null ? entry.getTag() : "-")
                            .append("</td>\n");
                    html.append("          <td>")
                            .append(entry.getParentVersion() != null ? entry.getParentVersion() : "-")
                            .append("</td>\n");
                    html.append("          <td>\n");

                    // Changes
                    List<ReleaseNoteEntryDto.ChangeItem> changes = parseChanges(entry.getChanges());
                    if (changes.isEmpty()) {
                        html.append("            -\n");
                    } else {
                        for (ReleaseNoteEntryDto.ChangeItem change : changes) {
                            html.append("            <div class=\"change-item\"><span class=\"jira-id\">")
                                    .append(change.getJiraId())
                                    .append("</span>: ")
                                    .append(change.getDescription())
                                    .append("</div>\n");
                        }
                    }
                    html.append("          </td>\n");
                    html.append("        </tr>\n");
                }

                html.append("      </tbody>\n");
                html.append("    </table>\n");
            }

            // Microservices non déployés
            List<ReleaseNoteEntry> notDeployed = squadEntries.stream()
                    .filter(e -> e.getPartEnMep() == null || !e.getPartEnMep())
                    .collect(Collectors.toList());

            if (!notDeployed.isEmpty()) {
                html.append("    <div class=\"section-title\">Microservices non déployés</div>\n");
                html.append("    <ul class=\"not-deployed\">\n");
                for (ReleaseNoteEntry entry : notDeployed) {
                    html.append("      <li><strong>").append(entry.getMicroservice()).append("</strong>");
                    if (entry.getParentVersion() != null) {
                        html.append(" (Parent: ").append(entry.getParentVersion()).append(")");
                    }
                    html.append("</li>\n");
                }
                html.append("    </ul>\n");
            }

            html.append("  </div>\n\n");
        }

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
            return objectMapper.readValue(changesJson, new TypeReference<List<ReleaseNoteEntryDto.ChangeItem>>() {
            });
        } catch (JsonProcessingException e) {
            log.error("Erreur lors du parsing des changes JSON: {}", changesJson, e);
            return new ArrayList<>();
        }
    }
}
