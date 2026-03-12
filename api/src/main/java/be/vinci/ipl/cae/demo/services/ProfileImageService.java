package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileImageService {

  private final ProfileImageRepository profileImageRepository;

  public ProfileImageService(ProfileImageRepository profileImageRepository) {
    this.profileImageRepository = profileImageRepository;
  }

  public Iterable<ProfileImage> readAllProfileImages() {
    return profileImageRepository.findAll();
  }
}
