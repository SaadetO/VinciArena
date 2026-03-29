package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.util.List;
import org.springframework.stereotype.Service;


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
          List.of(TournamentStatus.DONE, TournamentStatus.IN_PROGRESS)
      );
      default -> tournamentRepository.findAllByOrderByStartDateDesc();
    };
  }

  /**
   * Update a tournament's information.
   *
   * @param tournamentId the id of the team to update
   * @param newTournament the tournament with the updated data
   * @param currentMember the current member
   * @return the updated team if it has been updated, null otherwise.
   */
  public Tournament updateTournament(
      Long tournamentId, NewTournament newTournament, Member currentMember
  ) {
    Tournament tournament = tournamentRepository.findById(tournamentId).orElse(null);

    if (tournament == null) {
      return null;
    }

    if (tournament.getTournamentStatus() != TournamentStatus.IN_PREPARATION) {
      return null;
    }

    if (!currentMember.isAdmin()) {
      return null;
    }

    if (newTournament.name() != null) {
      tournament.setName(newTournament.name());
    }

    if (newTournament.description() != null) {
      tournament.setDescription(newTournament.description());
    }

    if (newTournament.startDate() != null) {
      tournament.setStartDate(newTournament.startDate());
    }

    if (newTournament.endDate() != null) {
      tournament.setEndDate(newTournament.endDate());
    }

    if (newTournament.nbMaxOfTeams() != tournament.getMaxNbOfTeams()) {
      tournament.setMaxNbOfTeams(newTournament.nbMaxOfTeams());
    }

    if (newTournament.registrationDeadline() != null) {
      tournament.setRegistrationDeadline(newTournament.registrationDeadline());
    }

    return tournamentRepository.save(tournament);
  }
}
