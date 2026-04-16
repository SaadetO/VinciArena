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

  @ExceptionHandler({TournamentNotFoundException.class})
  public ResponseEntity<Map<String, String>> handleNotFoundExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
  }

  @ExceptionHandler({EmailAlreadyTakenException.class, DuplicateRegistrationException.class})
  public ResponseEntity<Map<String, String>> handleConflictExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
  }

  @ExceptionHandler({InvalidPasswordException.class, MemberAlreadyBannedException.class,
      CannotBanSelfException.class, RegistrationClosedException.class,
      InsufficientTeamMembersException.class, InactiveTeamException.class,
      TournamentStatusException.class, ImpossibleTournamentException.class,
      AlreadyPlayedMatchInTournamentMatchGenerationAttemptException.class})
  public ResponseEntity<Map<String, String>> handleBadRequestExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
  }

  @ExceptionHandler({AccountBannedException.class, NotAdminException.class,
      CannotBanAdminException.class, ForbiddenException.class, NotManagerException.class})
  public ResponseEntity<Map<String, String>> handleForbiddenExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
  }

  @ExceptionHandler({InvalidCredentialsException.class, NotAuthenticatedException.class})
  public ResponseEntity<Map<String, String>> handleUnauthorizedExceptions(RuntimeException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
  }

}
