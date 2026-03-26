package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import be.vinci.ipl.cae.demo.services.TournamentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tournament controller.
 */
@RestController
@RequestMapping("/tournaments")
public class TounramentController {

  private final TournamentService tournamentService;
  private final TournamentRepository tournamentRepo;

  /**
   * Constructor.
   *
   * @param tournamentService the unavailability service
   */
  public TounramentController(TournamentService tournamentService,
      TournamentRepository tournamentRepo) {
    this.tournamentService = tournamentService;
    this.tournamentRepo = tournamentRepo;
  }

  /**
   * Get all tournaments.
   *
   * @return the list of tournaments.
   */
  @GetMapping({"", "/"})
  public Iterable<Tournament> getTournaments() {
    return tournamentRepo.findAll();
  }

  /**
   * Get a tournament by its id.
   *
   * @param id the id of the requested tournament.
   * @return a tournament.
   */
  @GetMapping("/{id}")
  public Tournament getTournament(@PathVariable Long id) {
    return tournamentRepo.findById(id).orElse(null);
  }

}
