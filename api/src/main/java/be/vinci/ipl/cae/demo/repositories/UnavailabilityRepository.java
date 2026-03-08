package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Unavailability;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Unavailability Repository.
 */
@Repository
public interface UnavailabilityRepository extends CrudRepository<Unavailability, Long> {

  /**
   * Finds unavailabilities by member.
   *
   * @param member the member
   * @return iterable of unavailabilities
   */
  Iterable<Unavailability> findByMember(Member member);
}
