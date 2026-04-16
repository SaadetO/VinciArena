package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Team Repository.
 */
@Repository
public interface TournamentRepository
    extends CrudRepository<Tournament, Long>, JpaSpecificationExecutor<Tournament> {

  /**
   * Get all tournaments of a certain status.
   */
  Iterable<Tournament> findAllByStatusIn(Collection<TournamentStatus> tournamentStatuses);

  /**
   * Gets a tournament by its name.
   */
  Tournament findByName(String name);
}
