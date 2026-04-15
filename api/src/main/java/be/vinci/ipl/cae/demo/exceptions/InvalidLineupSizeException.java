package be.vinci.ipl.cae.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidLineupSizeException extends RuntimeException {
  public InvalidLineupSizeException() {
    super("A lineup cannot have more than 4 players.");
  }

  public InvalidLineupSizeException(String message) {
    super(message);
  }
}