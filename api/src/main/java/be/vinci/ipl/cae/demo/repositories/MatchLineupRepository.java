package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchLineupId;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchLineupRepository extends CrudRepository<MatchLineup, MatchLineupId> {

  Iterable<MatchLineup> findByMembers_IdMemberIn(List<Long> memberIds);

}
