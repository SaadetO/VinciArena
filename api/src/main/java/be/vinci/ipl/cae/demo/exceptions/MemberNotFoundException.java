package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a member is not found.
 */
public class MemberNotFoundException extends RuntimeException {

  /**
   * Constructor.
   *
   * @param message the error message
   */
  public MemberNotFoundException(String message) {
    super(message);
  }
}