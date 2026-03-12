package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.services.ProfileImageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/profile-images")
public class ProfileImageController {

  private final ProfileImageService profileImageService;

  public ProfileImageController(ProfileImageService profileImageService) {
    this.profileImageService = profileImageService;
  }

  @GetMapping("/")
  public Iterable<ProfileImage> getAll() {
    return profileImageService.readAllProfileImages();
  }
}
