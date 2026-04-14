package be.vinci.ipl.cae.demo.exceptions;

public class NotAdminException extends RuntimeException {
  public NotAdminException(String message) {
    super(message);
  }
}
