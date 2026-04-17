package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a match result cannot be found.
 */
public class LineupNotFoundException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public LineupNotFoundException(String message) {
    super(message);
  }
}
