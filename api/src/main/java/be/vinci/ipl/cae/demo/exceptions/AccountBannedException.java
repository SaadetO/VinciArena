package be.vinci.ipl.cae.demo.exceptions;

public class AccountBannedException extends RuntimeException {
  public AccountBannedException(String message) {
    super(message);
  }
}
