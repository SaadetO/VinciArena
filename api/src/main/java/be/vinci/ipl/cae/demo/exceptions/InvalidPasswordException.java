package be.vinci.ipl.cae.demo.exceptions;

public class InvalidPasswordException extends RuntimeException {
  public InvalidPasswordException(String message) {
    super(message);
  }
}
