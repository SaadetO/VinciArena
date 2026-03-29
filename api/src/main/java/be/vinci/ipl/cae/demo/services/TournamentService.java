package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Tournament service.
 */
@Service
public class TournamentService {

  private final TournamentRepository tournamentRepository;

  /**
   * Constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }

  /**
   * Creates and inserts a new tournament into the database.
   *
   * @param newTournament payload
   * @return created tournament
   */
  public Tournament createTournament(NewTournament newTournament) {
    Tournament tournament = new Tournament();
    tournament.setName(newTournament.name());
    tournament.setDescription(newTournament.description());
    tournament.setMaxNbOfTeams(newTournament.nbMaxOfTeams());
    tournament.setEndDate(newTournament.endDate());
    tournament.setStartDate(newTournament.startDate());
    tournament.setRegistrationDeadline(newTournament.registrationDeadline());

    tournament = tournamentRepository.save(tournament);
    return tournament;
  }

  /**
   * Periodically updates tournament statuses based on dates and registration numbers.
   * Runs every 60 seconds to synchronize database state with the current time.
   */
  @Scheduled(initialDelay = 5000, fixedDelay = 60000)
  @Transactional
  public void updateAllTournamentStates() {

    System.out.println("Tournaments: Updating database...");

    List<TournamentStatus> activeStatuses = List.of(TournamentStatus.PLANNED,
        TournamentStatus.IN_PROGRESS, TournamentStatus.REGISTRATION_OPEN,
        TournamentStatus.REGISTRATION_CLOSED);

    Iterable<Tournament> activeTournaments = tournamentRepository.findAllByTournamentStatusIn(
        activeStatuses);
    List<Tournament> updatedTournaments = new ArrayList<>();

    for (Tournament t : activeTournaments) {
      TournamentStatus currentStatus = t.getTournamentStatus();
      TournamentStatus newStatus = determineNewStatus(t);

      if (currentStatus != newStatus) {
        t.setTournamentStatus(newStatus);
        updatedTournaments.add(t);
      }
    }

    if (!updatedTournaments.isEmpty()) {
      tournamentRepository.saveAll(updatedTournaments);
      System.out.println("Updated " + updatedTournaments.size() + " tournament states.");
    } else {
      System.out.println("No updated needed.");
    }
  }

  /**
   * Determines the next status for a tournament based on its current state and timeline.
   * * @param t The tournament to evaluate
   *
   * @return The calculated TournamentStatus
   */
  private TournamentStatus determineNewStatus(Tournament t) {
    LocalDateTime now = LocalDateTime.now();
    LocalDate today = now.toLocalDate();
    TournamentStatus status = t.getTournamentStatus();

    return switch (status) {

      // registrationDeadline arrives -> if not enough registrations: CANCELLED
      //                              else: REGISTRATION_CLOSED
      case REGISTRATION_OPEN -> {
        if (!t.getRegistrationDeadline().isAfter(now)) {
          yield (t.getRegistrationsNumber() < 2) ? TournamentStatus.CANCELLED
              : TournamentStatus.REGISTRATION_CLOSED;
        }
        yield status;
      }

      // cancel tournament if it's not planned and the startDate arrives
      case REGISTRATION_CLOSED ->
          (!t.getStartDate().isAfter(today)) ? TournamentStatus.CANCELLED : status;
      // start tournament if its planned and startDate arrives
      case PLANNED ->
          (!t.getStartDate().isAfter(today)) ? TournamentStatus.IN_PROGRESS : status;

      // finish tournament if endDate arrives
      case IN_PROGRESS ->
          (!t.getEndDate().isAfter(today)) ? TournamentStatus.DONE : status;

      default -> status;
    };
  }

  /**
   * Get all tournaments optionally filtered by timeframe.
   *
   * @param timeframe past, future, current, or null/empty for all.
   * @return the filtered and sorted list of tournaments.
   */
  public Iterable<Tournament> getTournaments(String timeframe) {
    if (timeframe == null || timeframe.isBlank()) {
      return tournamentRepository.findAllByOrderByStartDateDesc();
    }

    return switch (timeframe.toLowerCase(java.util.Locale.ROOT)) {
      case "past" ->
          tournamentRepository.findByTournamentStatusOrderByStartDateDesc(TournamentStatus.DONE);
      case "current" -> tournamentRepository.findByTournamentStatusOrderByStartDateDesc(
          TournamentStatus.IN_PROGRESS);
      case "future" -> tournamentRepository.findByTournamentStatusNotInOrderByStartDateDesc(
          List.of(TournamentStatus.DONE, TournamentStatus.IN_PROGRESS));
      default -> tournamentRepository.findAllByOrderByStartDateDesc();
    };
  }
}
