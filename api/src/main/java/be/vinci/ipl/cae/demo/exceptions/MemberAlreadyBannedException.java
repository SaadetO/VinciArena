package be.vinci.ipl.cae.demo.exceptions;

public class MemberAlreadyBannedException extends RuntimeException {
  public MemberAlreadyBannedException(String message) {
    super(message);
  }
}
