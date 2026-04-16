package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Match;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Match entity.
 */
@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

  /**
   * Find all matches for a given tournament.
   *
   * @param idTournament the id of the tournament
   * @return a list of matches
   */
  List<Match> findByTournamentIdTournament(Long idTournament);

  /**
   * Retrieves a match entity using its unique identifier.
   */
  Match getMatchByIdMatch(Long matchId);
}
