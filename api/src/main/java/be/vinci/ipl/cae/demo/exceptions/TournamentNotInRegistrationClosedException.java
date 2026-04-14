package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a user is not authenticated.
 */
public class TournamentNotInRegistrationClosedException
  extends RuntimeException
{

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public TournamentNotInRegistrationClosedException(String message) {
    super(message);
  }
}
