package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import java.util.Collection;
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
}