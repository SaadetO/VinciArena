package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Team Repository.
 */
@Repository
public interface TournamentRepository extends CrudRepository<Tournament, Long> {

  /**
   * Get all tournaments from a certain date on.
   */
  Iterable<Tournament> findAllByOrderByStartDateDesc();

  /**
   * Get all tournaments of a certain status from a certain date on.
   */
  Iterable<Tournament> findByTournamentStatusOrderByStartDateDesc(TournamentStatus status);

  /**
   * Get all tournaments not of a certain status from a certain date on.
   */
  Iterable<Tournament> findByTournamentStatusNotInOrderByStartDateDesc(
      Collection<TournamentStatus> statuses);

  /**
   * Get all tournaments by specific statuses, ordered by start date.
   *
   * @param tournamentStatuses a list of statuses
   * @return a list of tournaments
   */
  List<Tournament> findAllByTournamentStatusInOrderByStartDateDesc(
      Collection<TournamentStatus> tournamentStatuses);

  /**
   * Get all tournaments where at least one of the given teams
   * participates, from a certain date on.
   */
  Iterable<Tournament> findDistinctByTeamsIdTeamInOrderByStartDateDesc(Collection<Long> teamIds);

  /**
   * Get all tournaments of a certain status where at least one
   * of the given teams participates, from a certain date on.
   */
  Iterable<Tournament> findDistinctByTeamsIdTeamInAndTournamentStatusOrderByStartDateDesc(
      Collection<Long> teamIds, TournamentStatus status);

  /**
   * Get all tournaments not of a certain status where at least
   * one of the given teams participates, from a certain date on.
   */
  Iterable<Tournament> findDistinctByTeamsIdTeamInAndTournamentStatusNotInOrderByStartDateDesc(
      Collection<Long> teamIds, Collection<TournamentStatus> statuses);

  /**
   * Get all tournaments of a certain status.
   */
  Iterable<Tournament> findAllByTournamentStatusIn(Collection<TournamentStatus> tournamentStatuses);

  /**
   * Checks if a member exists by name.
   */
  boolean existsByName(String name);
}