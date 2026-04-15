package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a match is not found.
 */
public class MatchNotFoundException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the exception message
   */
  public MatchNotFoundException(String message) {
    super(message);
  }
}
