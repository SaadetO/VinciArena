package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import org.springframework.data.repository.CrudRepository;

public interface ProfileImageRepository extends CrudRepository<ProfileImage, Long> {

  ProfileImage getProfileImageByIdImage(Long idImage);
}
