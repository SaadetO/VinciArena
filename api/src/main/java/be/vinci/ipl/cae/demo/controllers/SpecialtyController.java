package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.SpecialtyDto;
import be.vinci.ipl.cae.demo.services.SpecialtyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for specialties.
 */
@RestController
@RequestMapping("/specialties")
public class SpecialtyController {
  private final SpecialtyService specialtyService;

  /**
   * Constructor for SpecialtyController.
   *
   * @param specialityService the injected SpecialtyService.
   */
  public SpecialtyController(SpecialtyService specialityService) {
    this.specialtyService = specialityService;
  }

  /**
   * Get all specialties.
   *
   * @return the list of specialties.
   */
  @GetMapping({"", "/"})
  public Iterable<SpecialtyDto> getSpecialties() {
    return specialtyService.readAllSpecialties();
  }
}
