package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;

/**
 * Team Repository.
 */
@Repository
public interface TournamentRepository extends CrudRepository<Tournament, Long> {
  Iterable<Tournament> findAllByOrderByStartDateDesc();
  Iterable<Tournament> findByTournamentStatusOrderByStartDateDesc(TournamentStatus status);
  Iterable<Tournament> findByTournamentStatusNotInOrderByStartDateDesc(Collection<TournamentStatus> statuses);
}