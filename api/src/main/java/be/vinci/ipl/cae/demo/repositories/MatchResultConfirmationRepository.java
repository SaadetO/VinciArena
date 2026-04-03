package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Match Result Confirmation repository.
 */
@Repository
public interface MatchResultConfirmationRepository extends
    CrudRepository<MatchResultConfirmation, Long> {
}
