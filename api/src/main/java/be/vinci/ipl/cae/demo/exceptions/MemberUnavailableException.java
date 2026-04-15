package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a member has a recorded unavailability that conflicts with a match time.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class MemberUnavailableException extends RuntimeException {

  public MemberUnavailableException() {
    super("The selected member is not available at this time.");
  }

  public MemberUnavailableException(String message) {
    super(message);
  }
}