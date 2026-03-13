package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Specialty;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Speciality repository.
 */
@Repository
public interface SpecialtyRepository extends CrudRepository<Specialty, Long> {

  /**
   * Get all specialties.
   *
   * @return all specialties
   */
  @Override
  Iterable<Specialty> findAll();

  /**
   * Get a specialty by its id.
   *
   * @param idSpecialty id of the specialty
   * @return the specialty
   */
  Specialty getByIdSpecialty(Long idSpecialty);
}
