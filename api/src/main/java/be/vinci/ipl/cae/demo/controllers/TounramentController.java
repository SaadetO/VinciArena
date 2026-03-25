package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.TournamentService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tournament controller.
 */
@RestController
@RequestMapping("/tournament")
public class TounramentController {

  private final TournamentService tournamentService;

  /**
   * Constructor.
   *
   * @param tournamentService the unavailability service
   */
  public TounramentController(TournamentService tournamentService) {
    this.tournamentService = tournamentService;
  }

}
