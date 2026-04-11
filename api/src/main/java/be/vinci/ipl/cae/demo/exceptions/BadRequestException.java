package be.vinci.ipl.cae.demo.exceptions;

public class BadRequestException extends RuntimeException {

  public BadRequestException(String message) {
    super(message);
  }
}
