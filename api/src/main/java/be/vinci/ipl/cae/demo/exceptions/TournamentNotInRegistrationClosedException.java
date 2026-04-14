package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a tournament is not in registration closed state.
 */
public class TournamentNotInRegistrationClosedException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public TournamentNotInRegistrationClosedException(String message) {
    super(message);
  }
}
