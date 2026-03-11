package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Specialty;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Speciality repository.
 */
@Repository
public interface SpecialtyRepository extends CrudRepository<Specialty, Long> {

  @Override
  Iterable<Specialty> findAll();

  Specialty getByIdSpecialty(Long idSpecialty);
}
