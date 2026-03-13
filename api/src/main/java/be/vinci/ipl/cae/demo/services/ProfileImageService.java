package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import org.springframework.stereotype.Service;

/**
 * Profile image service.
 */
@Service
public class ProfileImageService {

  private final ProfileImageRepository profileImageRepository;

  /**
   * Constructs profile image service.
   *
   * @param profileImageRepository profileImageRepo
   */
  public ProfileImageService(ProfileImageRepository profileImageRepository) {
    this.profileImageRepository = profileImageRepository;
  }

  /**
   * Reads all profile images from db via un repository.
   *
   * @return profile images
   */
  public Iterable<ProfileImage> readAllProfileImages() {
    return profileImageRepository.findAll();
  }
}
