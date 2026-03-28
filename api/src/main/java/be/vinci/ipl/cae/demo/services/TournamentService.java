package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

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
   * creates and inserts a new tournament into the database
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

    return switch (timeframe.toLowerCase()) {
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
}
