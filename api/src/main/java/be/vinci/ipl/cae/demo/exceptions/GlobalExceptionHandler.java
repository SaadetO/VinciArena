package be.vinci.ipl.cae.demo.exceptions;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for the API.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Handle NOT FOUND HttpStatus exceptions
   *
   * @param ex the thrown exception
   * @return http response entity with status NOT FOUND described by the message in parameter
   */
  @ExceptionHandler({
      TournamentNotFoundException.class,
      TeamNotFoundException.class,
      MemberNotFoundException.class
  })
  public ResponseEntity<Map<String, String>> handleNotFoundExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle CONFLICT HttpStatus exceptions
   *
   * @param ex the thrown exception
   * @return http response entity with status CONFLICT described by the message in parameter
   */
  @ExceptionHandler({
      EmailAlreadyTakenException.class,
      DuplicateRegistrationException.class,
      TeamNameAlreadyTakenException.class,
      NoManagerSpotsLeftException.class,
      LastManagerCannotQuitException.class,
      ReplacementRequiredException.class,
      MemberAlreadyManagerException.class
  })
  public ResponseEntity<Map<String, String>> handleConflictExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle Bad REQUEST HttpStatus exceptions
   *
   * @param ex the thrown exception
   * @return http response entity with status BAD REQUEST described by the message in parameter
   */
  @ExceptionHandler({
      InvalidPasswordException.class,
      MemberAlreadyBannedException.class,
      CannotBanSelfException.class,
      RegistrationClosedException.class,
      InsufficientTeamMembersException.class,
      InactiveTeamException.class,
      TournamentNotInRegistrationClosedException.class,
      ImpossibleTournamentException.class,
      InvalidTeamNameException.class,
      UserAlreadyInTeamException.class,
      UserNotInTeamException.class
  })
  public ResponseEntity<Map<String, String>> handleBadRequestExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle FORBIDDEN HttpStatus exceptions
   *
   * @param ex the thrown exception
   * @return http response entity with status FORBIDDEN described by the message in parameter
   */
  @ExceptionHandler({
      AccountBannedException.class,
      NotAdminException.class,
      CannotBanAdminException.class,
      ForbiddenException.class,
      NotManagerException.class
  })
  public ResponseEntity<Map<String, String>> handleForbiddenExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle UNAUTHORIZED HttpStatus exceptions
   *
   * @param ex the thrown exception
   * @return http response entity with status UNAUTHORIZED described by the message in parameter
   */
  @ExceptionHandler({
      InvalidCredentialsException.class,
      NotAuthenticatedException.class
  })
  public ResponseEntity<Map<String, String>> handleUnauthorizedExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
  }

}
