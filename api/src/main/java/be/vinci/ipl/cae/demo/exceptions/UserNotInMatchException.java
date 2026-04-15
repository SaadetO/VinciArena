package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a user is not part of a match.
 */
public class UserNotInMatchException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public UserNotInMatchException(String message) {
    super(message);
  }
}