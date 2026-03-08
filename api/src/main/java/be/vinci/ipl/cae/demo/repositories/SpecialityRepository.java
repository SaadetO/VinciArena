package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Speciality;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Speciality repository.
 */
@Repository
public interface SpecialityRepository extends CrudRepository<Speciality, Long> {
}
