package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import org.springframework.data.repository.CrudRepository;

/**
 * ProfileImage repository.
 */
public interface ProfileImageRepository extends CrudRepository<ProfileImage, Long> {

  /**
   * Gets a profileImage by id.
   *
   * @param idImage id of the requested image
   * @return a ProfileImage
   */
  ProfileImage getProfileImageByIdImage(Long idImage);
}
