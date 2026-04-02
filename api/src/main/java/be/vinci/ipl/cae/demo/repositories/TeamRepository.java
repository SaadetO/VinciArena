package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Team Repository.
 */
@Repository
public interface TeamRepository extends CrudRepository<Team, Long> {

  /**
   * Finds the first team where the member is manager1 or manager2.
   *
   * @param manager1 the member as manager1
   * @param manager2 the member as manager2
   * @return the optional team
   */
  Optional<Team> findFirstByManager1OrManager2(Member manager1, Member manager2);

  /**
   * Checks if a team with the given name already exists.
   *
   * @param name the team name
   * @return true if a team with this name exists
   */
  boolean existsByName(String name);

  /**
   * Returns an iterable of all active teams.
   *
   * @return an iterable of all active teams
   */
  Iterable<Team> findByIsActiveTrue();
}
