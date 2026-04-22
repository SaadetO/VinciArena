package be.vinci.ipl.cae.demo.exceptions;

/**
 * Private Lineup exception.
 */
public class PrivateLineupException extends RuntimeException {

  /**
   * exception that handles trying to access private lineups.
   *
   * @param message error message
   */
  public PrivateLineupException(String message) {
    super(message);
  }
}
