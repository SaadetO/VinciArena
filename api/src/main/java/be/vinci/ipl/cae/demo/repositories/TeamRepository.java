package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Team;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Team Repository.
 */
@Repository
public interface TeamRepository extends CrudRepository<Team, Long> {

  /**
   * Checks if a team with the given name already exists.
   *
   * @param name the team name
   * @return true if a team with this name exists
   */
  boolean existsByName(String name);
}
