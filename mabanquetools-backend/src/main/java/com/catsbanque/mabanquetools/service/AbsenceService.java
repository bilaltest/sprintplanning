package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.dto.AbsenceDto;
import com.catsbanque.mabanquetools.dto.AbsenceUserDto;
import com.catsbanque.mabanquetools.dto.CreateAbsenceRequest;
import com.catsbanque.mabanquetools.entity.*;
import com.catsbanque.mabanquetools.exception.ResourceNotFoundException;
import com.catsbanque.mabanquetools.exception.UnauthorizedException;
import com.catsbanque.mabanquetools.repository.AbsenceRepository;
import com.catsbanque.mabanquetools.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @Transactional(readOnly = true)
    public List<AbsenceDto> getAbsences(String userId, LocalDate startDate, LocalDate endDate) {
        if (!permissionService.hasReadAccess(userId, PermissionModule.ABSENCE)) {
            throw new UnauthorizedException("Vous n'avez pas accès au module Absences");
        }

        List<Absence> absences = absenceRepository.findByDateRange(startDate, endDate);
        return absences.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AbsenceUserDto> getAbsenceUsers(String userId) {
        if (!permissionService.hasReadAccess(userId, PermissionModule.ABSENCE)) {
            throw new UnauthorizedException("Vous n'avez pas accès au module Absences");
        }

        return userRepository.findAll().stream()
                .filter(u -> !"Autre".equalsIgnoreCase(u.getTribu())) // Filtrer Tribu != Autre
                .map(u -> AbsenceUserDto.builder()
                        .id(u.getId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .metier(u.getMetier())
                        .tribu(u.getTribu())
                        .interne(u.getInterne())
                        .email(u.getEmail())
                        .squads(u.getTeams().stream().map(com.catsbanque.mabanquetools.entity.Team::getName)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public AbsenceDto createAbsence(String currentUserId, CreateAbsenceRequest request) {
        // Validation des dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("La date de fin doit être après ou égale à la date de début");
        }

        // Déterminer l'utilisateur cible
        String targetUserId = request.getUserId() != null ? request.getUserId() : currentUserId;

        // Vérification des permissions
        checkWritePermission(currentUserId, targetUserId);

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Vérification des chevauchements
        String sp = request.getStartPeriod() != null ? request.getStartPeriod().name() : Period.MORNING.name();
        String ep = request.getEndPeriod() != null ? request.getEndPeriod().name() : Period.AFTERNOON.name();

        if (absenceRepository.existsOverlappingAbsence(targetUserId, "new", request.getStartDate(),
                request.getEndDate(), sp, ep)) {
            throw new IllegalArgumentException("Une absence existe déjà sur cette période");
        }

        Absence absence = Absence.builder()
                .userId(targetUser.getId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .endDate(request.getEndDate())
                .type(request.getType())
                .startPeriod(request.getStartPeriod() != null ? request.getStartPeriod() : Period.MORNING)
                .endPeriod(request.getEndPeriod() != null ? request.getEndPeriod() : Period.AFTERNOON)
                .build();

        absence.setUser(targetUser); // Fix NPE: Set user relationship for DTO mapping

        return mapToDto(absenceRepository.save(absence));
    }

    @Transactional
    public AbsenceDto updateAbsence(String currentUserId, String absenceId, CreateAbsenceRequest request) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Absence non trouvée"));

        // Vérification des permissions (basée sur l'utilisateur de l'absence)
        checkWritePermission(currentUserId, absence.getUser().getId());

        // Validation des dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("La date de fin doit être après ou égale à la date de début");
        }

        // Vérification des chevauchements (exclure l'absence courante)
        String sp = request.getStartPeriod() != null ? request.getStartPeriod().name() : Period.MORNING.name();
        String ep = request.getEndPeriod() != null ? request.getEndPeriod().name() : Period.AFTERNOON.name();

        if (absenceRepository.existsOverlappingAbsence(absence.getUser().getId(), absenceId, request.getStartDate(),
                request.getEndDate(), sp, ep)) {
            throw new IllegalArgumentException("Une absence existe déjà sur cette période");
        }

        absence.setStartDate(request.getStartDate());
        absence.setEndDate(request.getEndDate());
        absence.setType(request.getType());
        absence.setStartPeriod(request.getStartPeriod() != null ? request.getStartPeriod() : Period.MORNING);
        absence.setEndPeriod(request.getEndPeriod() != null ? request.getEndPeriod() : Period.AFTERNOON);

        return mapToDto(absenceRepository.save(absence));
    }

    @Transactional
    public void deleteAbsence(String currentUserId, String absenceId) {
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Absence non trouvée"));

        // Vérification des permissions
        checkWritePermission(currentUserId, absence.getUser().getId());

        absenceRepository.delete(absence);
    }

    private void checkWritePermission(String currentUserId, String targetUserId) {
        // Admin ABSENCE : peut éditer tout le monde
        if (permissionService.getPermissionLevel(currentUserId, PermissionModule.ABSENCE) == PermissionLevel.WRITE
                && permissionService.hasWriteAccess(currentUserId, PermissionModule.ADMIN)) {
            // FIXME: La logique "Admin" n'est pas explicite dans le niveau WRITE actuel.
            // On a dit WRITE = edit own, ADMIN = edit all.
            // Mais PermissionLevel n'a pas ADMIN. Il a NONE, READ, WRITE.
            // Cependant PermissionModule.ADMIN est un module.
            // RE-CHECK PLAN:
            // "READ (ABSENCE module) -> View all."
            // "WRITE (ABSENCE module) -> Edit own."
            // "ADMIN (ABSENCE module) -> Edit all." -> Cela implique un niveau 'ADMIN' dans
            // PermissionLevel, ou alors 'WRITE' sur le module ABSENCE + 'WRITE' sur le
            // module ADMIN ?
            // Le user feedback disait "Seuls ceux qui ont les droits Admin en écriture
            // peuvent modifier les absences de tout le monde."
            // Donc si on a Acces ADMIN WRITE, on peut modifier les absences des autres.
            return;
        }

        // Si on a les droits ADMIN sur le module ADMIN, on considère qu'on est admin
        // global pour simplifier, ou admin des absences.
        if (permissionService.hasWriteAccess(currentUserId, PermissionModule.ADMIN)) {
            return;
        }

        // Sinon, on ne peut modifier que ses propres absences, et il faut avoir le
        // droit WRITE sur ABSENCE
        if (!currentUserId.equals(targetUserId)) {
            throw new UnauthorizedException("Vous ne pouvez pas modifier les absences d'un autre utilisateur");
        }

        if (!permissionService.hasWriteAccess(currentUserId, PermissionModule.ABSENCE)) {
            throw new UnauthorizedException("Vous n'avez pas la permission de modifier les absences");
        }
    }

    private AbsenceDto mapToDto(Absence absence) {
        return AbsenceDto.builder()
                .id(absence.getId())
                .userId(absence.getUserId())
                .userFirstName(absence.getUser().getFirstName())
                .userLastName(absence.getUser().getLastName())
                .startDate(absence.getStartDate())
                .endDate(absence.getEndDate())
                .endDate(absence.getEndDate())
                .type(absence.getType())
                .startPeriod(absence.getStartPeriod())
                .endPeriod(absence.getEndPeriod())
                .build();
    }
}
