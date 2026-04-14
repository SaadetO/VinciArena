package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a team cannot be found.
 */
public class TeamNotFoundException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the exception message
   */
  public TeamNotFoundException(String message) {
    super(message);
  }
}
