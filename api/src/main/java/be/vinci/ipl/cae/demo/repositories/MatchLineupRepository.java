package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchLineupId;
import be.vinci.ipl.cae.demo.models.entities.Team;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Match Lineup repository.
 */
@Repository
public interface MatchLineupRepository extends JpaRepository<MatchLineup, MatchLineupId> {
  /**
   * Get match lineups for a specific match.
   *
   * @param idMatch the id of the match
   * @return a list of match lineups
   */
  List<MatchLineup> findByIdIdMatch(Long idMatch);

  Optional<MatchLineup> findByMatchAndTeam(Match match, Team team);

  /**
   * Get a match by the id of the members.
   *
   * @param membersIdMembers the ids of the members
   * @return an iterable of MatchLineups
   */
  Iterable<MatchLineup> findByMembersIdMemberIn(Collection<Long> membersIdMembers);
}
