package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * JoinRequest Repository.
 */
@Repository
public interface JoinRequestRepository extends CrudRepository<JoinRequest, Long> {

  /**
   * Check if a member already has a pending join request for a given team and a given request
   * status.
   *
   * @param member        the member
   * @param requestedTeam the requested team
   * @param status        the join request status
   * @return true if the member already has a pending join request; false otherwise
   */
  boolean existsByMemberAndRequestedTeamAndStatus(Member member, Team requestedTeam,
      RequestStatus status);
}
