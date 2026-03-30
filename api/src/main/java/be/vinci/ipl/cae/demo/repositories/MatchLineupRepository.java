package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchLineupId;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Match Lineup repository.
 */
@Repository
public interface MatchLineupRepository extends CrudRepository<MatchLineup, MatchLineupId> {

  /**
   * Get matche lineups related to a certain member.
   *
   * @param memberIds id of the member
   * @return a MatchLineup
   */
  Iterable<MatchLineup> findByMembersIdMemberIn(List<Long> memberIds);

}
