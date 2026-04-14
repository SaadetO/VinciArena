package be.vinci.ipl.cae.demo.exceptions;

public class NotAuthenticatedException extends RuntimeException {
  public NotAuthenticatedException(String message) {
    super(message);
  }
}
