package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.services.ProfileImageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for managing profile images.
 */
@RestController
@RequestMapping("/profile-images")
public class ProfileImageController {

  private final ProfileImageService profileImageService;

  /**
   * Constructs image controller with service.
   *
   * @param profileImageService imageService
   */
  public ProfileImageController(ProfileImageService profileImageService) {
    this.profileImageService = profileImageService;
  }

  /**
   * Gets all images from db.
   *
   * @return all images
   */
  @GetMapping("/")
  public Iterable<ProfileImage> getAll() {
    return profileImageService.readAllProfileImages();
  }
}
