package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a match cannot be found.
 */
public class MatchNotFoundException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public MatchNotFoundException(String message) {
    super(message);
  }
}