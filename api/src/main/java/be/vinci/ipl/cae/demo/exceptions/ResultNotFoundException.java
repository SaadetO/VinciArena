package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a match result cannot be found.
 */
public class ResultNotFoundException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public ResultNotFoundException(String message) {
    super(message);
  }
}
