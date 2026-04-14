package be.vinci.ipl.cae.demo.exceptions;

public class CannotBanSelfException extends RuntimeException {
  public CannotBanSelfException(String message) {
    super(message);
  }
}
