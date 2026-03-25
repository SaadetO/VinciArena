package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import org.springframework.stereotype.Service;

/**
 * Tournament service.
 */
@Service
public class TournamentService {

  TournamentRepository tournamentRepository;

  /**
   * Constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository) {
    this.tournamentRepository = tournamentRepository;
  }
}
