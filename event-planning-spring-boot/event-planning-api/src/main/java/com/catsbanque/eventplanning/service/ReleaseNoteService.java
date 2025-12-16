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
     * Exporte la release note en Markdown (colonnes filtrées: microservice, solution, squad, changes)
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

        // Contenu par squad (uniquement colonnes: microservice, solution, squad, changes)
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
     * Exporte la release note en HTML avec design "wow" (colonnes filtrées: microservice, solution, squad, changes)
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
                        LinkedHashMap::new,
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
            "#06b6d4"  // Squad 6 - Cyan
        };

        // Header HTML avec design moderne
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"fr\">\n");
        html.append("<head>\n");
        html.append("  <meta charset=\"UTF-8\">\n");
        html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("  <title>Release Note - ").append(release.getName()).append("</title>\n");
        html.append("  <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n");
        html.append("  <style>\n");
        html.append("    * { margin: 0; padding: 0; box-sizing: border-box; }\n");
        html.append("    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 1.5rem 1rem; }\n");
        html.append("    .container { max-width: 1600px; margin: 0 auto; }\n");
        html.append("    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1.5rem 2rem; border-radius: 16px; margin-bottom: 1.5rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); position: relative; overflow: hidden; }\n");
        html.append("    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); }\n");
        html.append("    .header-content { position: relative; z-index: 1; }\n");
        html.append("    .header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; text-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n");
        html.append("    .header .date { font-size: 0.95rem; font-weight: 500; opacity: 0.95; display: inline-block; background: rgba(255,255,255,0.2); padding: 0.35rem 1rem; border-radius: 50px; backdrop-filter: blur(10px); }\n");
        html.append("    .header .description { margin-top: 1rem; font-size: 0.95rem; opacity: 0.95; line-height: 1.6; max-width: 900px; }\n");
        html.append("    .squads-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }\n");
        html.append("    @media (max-width: 1200px) { .squads-grid { grid-template-columns: 1fr; } }\n");
        html.append("    .squad-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }\n");
        html.append("    .squad-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }\n");
        html.append("    .squad-header { padding: 0.75rem 1.25rem; font-size: 1.1rem; font-weight: 700; color: white; position: relative; overflow: hidden; }\n");
        html.append("    .squad-header::before { content: ''; position: absolute; top: 0; right: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 100%); }\n");
        html.append("    .squad-header-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 0.75rem; }\n");
        html.append("    .squad-icon { width: 28px; height: 28px; background: rgba(255,255,255,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }\n");
        html.append("    table { width: 100%; border-collapse: separate; border-spacing: 0; }\n");
        html.append("    thead th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e7eb; }\n");
        html.append("    tbody tr { transition: background-color 0.2s ease; }\n");
        html.append("    tbody tr:hover { background-color: #f9fafb; }\n");
        html.append("    tbody td { padding: 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: top; }\n");
        html.append("    tbody tr:last-child td { border-bottom: none; }\n");
        html.append("    .microservice-name { font-weight: 600; color: #1f2937; font-size: 0.9rem; }\n");
        html.append("    .solution-name { color: #6b7280; font-size: 0.85rem; }\n");
        html.append("    .change-item { margin: 0.4rem 0; padding: 0.6rem 0.75rem; background: #f9fafb; border-radius: 8px; display: flex; gap: 0.75rem; align-items: flex-start; }\n");
        html.append("    .jira-badge { display: inline-flex; align-items: center; justify-content: center; background: var(--squad-color); color: white; font-weight: 700; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 4px; min-width: 70px; flex-shrink: 0; }\n");
        html.append("    .change-desc { color: #374151; line-height: 1.5; font-size: 0.85rem; flex: 1; }\n");
        html.append("    .no-data { color: #9ca3af; font-style: italic; font-size: 0.85rem; }\n");
        html.append("    .stats-bar { display: flex; gap: 1.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); }\n");
        html.append("    .stat { display: flex; flex-direction: column; gap: 0.15rem; }\n");
        html.append("    .stat-label { font-size: 0.75rem; opacity: 0.8; }\n");
        html.append("    .stat-value { font-size: 1.25rem; font-weight: 700; }\n");
        html.append("  </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("  <div class=\"container\">\n");

        // Header
        html.append("    <div class=\"header\">\n");
        html.append("      <div class=\"header-content\">\n");
        html.append("        <h1>Release Note - ").append(release.getName()).append("</h1>\n");
        html.append("        <div class=\"date\">📅 Date de MEP: ")
                .append(release.getReleaseDate().format(dateFormatter)).append("</div>\n");
        if (release.getDescription() != null && !release.getDescription().isEmpty()) {
            html.append("        <div class=\"description\">").append(release.getDescription()).append("</div>\n");
        }

        // Stats
        int totalMicroservices = deployed.size();
        int totalSquads = entriesBySquad.size();
        html.append("        <div class=\"stats-bar\">\n");
        html.append("          <div class=\"stat\"><div class=\"stat-label\">Squads</div><div class=\"stat-value\">").append(totalSquads).append("</div></div>\n");
        html.append("          <div class=\"stat\"><div class=\"stat-label\">Microservices</div><div class=\"stat-value\">").append(totalMicroservices).append("</div></div>\n");
        html.append("        </div>\n");
        html.append("      </div>\n");
        html.append("    </div>\n\n");

        // Contenu par squad - Grille 2 colonnes
        html.append("    <div class=\"squads-grid\">\n");

        int squadIndex = 0;
        for (Map.Entry<String, List<ReleaseNoteEntry>> squadEntry : entriesBySquad.entrySet()) {
            String squad = squadEntry.getKey();
            List<ReleaseNoteEntry> squadEntries = squadEntry.getValue();
            String squadColor = squadColors[squadIndex % squadColors.length];

            html.append("      <div class=\"squad-card\" style=\"--squad-color: ").append(squadColor).append(";\">\n");
            html.append("        <div class=\"squad-header\" style=\"background: linear-gradient(135deg, ").append(squadColor).append(" 0%, ").append(squadColor).append("dd 100%);\">\n");
            html.append("          <div class=\"squad-header-content\">\n");
            html.append("            <div class=\"squad-icon\">👥</div>\n");
            html.append("            <div>").append(squad).append(" <span style=\"opacity: 0.7; font-size: 0.85rem; font-weight: 400;\">(").append(squadEntries.size()).append(")</span></div>\n");
            html.append("          </div>\n");
            html.append("        </div>\n");

            html.append("        <table>\n");
            html.append("          <thead>\n");
            html.append("            <tr>\n");
            html.append("              <th style=\"width: 25%;\">Microservice</th>\n");
            html.append("              <th style=\"width: 20%;\">Solution</th>\n");
            html.append("              <th style=\"width: 55%;\">Changes</th>\n");
            html.append("            </tr>\n");
            html.append("          </thead>\n");
            html.append("          <tbody>\n");

            for (ReleaseNoteEntry entry : squadEntries) {
                // Récupérer solution depuis le microservice
                String solution = "-";
                if (entry.getMicroserviceId() != null) {
                    solution = microserviceRepository.findById(entry.getMicroserviceId())
                            .map(Microservice::getSolution)
                            .orElse("-");
                }

                html.append("            <tr>\n");
                html.append("              <td><div class=\"microservice-name\">")
                        .append(entry.getMicroservice() != null ? entry.getMicroservice() : "-")
                        .append("</div></td>\n");
                html.append("              <td><div class=\"solution-name\">").append(solution).append("</div></td>\n");
                html.append("              <td>\n");

                // Changes avec nouveau design (badge + description)
                List<ReleaseNoteEntryDto.ChangeItem> changes = parseChanges(entry.getChanges());
                if (changes.isEmpty()) {
                    html.append("                <span class=\"no-data\">Aucun changement</span>\n");
                } else {
                    for (ReleaseNoteEntryDto.ChangeItem change : changes) {
                        html.append("                <div class=\"change-item\">\n");
                        html.append("                  <span class=\"jira-badge\">").append(change.getJiraId()).append("</span>\n");
                        html.append("                  <span class=\"change-desc\">").append(change.getDescription()).append("</span>\n");
                        html.append("                </div>\n");
                    }
                }
                html.append("              </td>\n");
                html.append("            </tr>\n");
            }

            html.append("          </tbody>\n");
            html.append("        </table>\n");
            html.append("      </div>\n\n");

            squadIndex++;
        }

        html.append("    </div>\n");
        html.append("  </div>\n");
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
