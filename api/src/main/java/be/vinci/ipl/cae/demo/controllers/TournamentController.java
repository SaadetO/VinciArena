package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDetailsDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import be.vinci.ipl.cae.demo.services.TournamentService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Tournament controller.
 */
@RestController
@RequestMapping("/tournaments")
public class TournamentController {

  private final TournamentService tournamentService;

  /**
   * Constructor.
   *
   * @param tournamentService the unavailability service
   */
  public TournamentController(TournamentService tournamentService) {
    this.tournamentService = tournamentService;

  }

  /**
   * Get all tournaments, optionally filtered by timeframe, teams, or members.
   *
   * @param timeframe past, current, or future.
   * @param teamsIds a list of team IDs to filter tournaments by (OR filter).
   * @param membersIds a list of member IDs whose teams filter the tournaments (OR filter).
   * @return the list of tournaments.
   */
  @GetMapping({"", "/"})
  public Iterable<Tournament> getTournaments(
      @RequestParam(required = false) String timeframe,
      @RequestParam(required = false) List<Long> teamsIds,
      @RequestParam(required = false) List<Long> membersIds) {
    return tournamentService.getTournaments(timeframe, teamsIds, membersIds);
  }

  /**
   * Get a tournament details by its id.
   *
   * @param id the id of the requested tournament.
   * @return a tournament details DTO.
   */
  @GetMapping("/{id}")
  public TournamentDetailsDto getTournament(@PathVariable Long id) {
    TournamentDetailsDto details = tournamentService.getTournamentDetails(id);
    if (details == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found");
    }
    return details;
  }

  /**
   * Creates a new tournament in the system. The tournament is initialized with the state
   * IN_PREPARATION. Access is restricted to users with administrative privileges.
   *
   * @param newTournament The DTO containing the initial tournament details.
   * @param currentMember The authenticated administrator creating the tournament.
   * @return The created {@link Tournament} object with its generated ID.
   * @throws ResponseStatusException 400 if the input data is invalid.
   * @throws ResponseStatusException 401 if the user is not authenticated.
   * @throws ResponseStatusException 403 if the user is not an admin.
   * @throws ResponseStatusException 409 if a tournament with a conflicting state/name exists.
   */
  @PostMapping("/")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')") // Security handled here
  public Tournament createTournament(@RequestBody NewTournament newTournament,
      @AuthenticationPrincipal Member currentMember) {

    validateNewTournament(newTournament, currentMember); // Removed currentMember check here

    Tournament createdTournament = tournamentService.createTournament(newTournament);

    if (createdTournament == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament already exists");
    }

    return createdTournament;
  }

  /**
   * Updates a tournament in the system.
   * The update is only possible if the tournament's status is IN_PREPARATION
   * and the member is an admin.
   *
   * @param id the tournament id.
   * @param newTournament the new tournament data.
   * @param currentMember the current member.
   * @return the updated tournament
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public Tournament updateTournament(
      @PathVariable Long id,
      @RequestBody NewTournament newTournament,
      @AuthenticationPrincipal Member currentMember
  ) {
    validateNewTournament(newTournament, currentMember);

    Tournament updatedTournament =
        tournamentService.updateTournament(id, newTournament, currentMember);

    if (updatedTournament == null) {
      throw  new ResponseStatusException(HttpStatus.CONFLICT, "Tournament cannot be updated");
    }

    return updatedTournament;
  }

  /**
   * Patch a tournament in the system.
   * The patch is only possible if the tournament's status is IN_PREPARATION
   * and the member is an admin.
   *
   * @param id the tournament id.
   * @param currentMember the current member.
   * @return the patched tournament
   */
  @PatchMapping("/{id}/publish")
  @PreAuthorize("hasRole('ADMIN')")
  public Tournament publishTournament(
      @PathVariable Long id,
      @AuthenticationPrincipal Member currentMember
  ) {
    if (!currentMember.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    Tournament publishedTournament = tournamentService.publishTournament(id, currentMember);

    if (publishedTournament == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament cannot be published");
    }

    return publishedTournament;
  }

  private void validateNewTournament(NewTournament dto, Member currentMember) {
    // check null
    if (dto == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payload is missing");
    }
    if (isNullOrBlank(dto.name())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
    }
    if (isNullOrBlank(dto.description())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
    }

    // check authorization
    if (!currentMember.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    // Check numbers
    if (dto.capacity() <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max teams must be positive");
    }

    // Check dates
    checkDateRange(dto.registrationDeadline(), dto.startDate(), dto.endDate());
  }

  private void checkDateRange(
      LocalDateTime registrationDeadline,
      LocalDate startDate,
      LocalDate endDate
  ) {
    LocalDate today = LocalDate.now();
    if (registrationDeadline.isBefore(today.atStartOfDay())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline cannot be in the past");
    }
    if (endDate.isBefore(startDate)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "End date must be after start date");
    }
  }

  private boolean isNullOrBlank(String s) {
    return s == null || s.isBlank();
  }

}
