package be.vinci.ipl.cae.demo.exceptions;

public class EmailAlreadyTakenException extends RuntimeException {
  public EmailAlreadyTakenException(String message) {
    super(message);
  }
}
