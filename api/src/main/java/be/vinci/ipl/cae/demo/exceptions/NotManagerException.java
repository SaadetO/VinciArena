package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when the user is not a manager.
 */
public class NotManagerException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the exception message
   */
  public NotManagerException(String message) {
    super(message);
  }
}
