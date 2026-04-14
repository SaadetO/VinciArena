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
   * Handle TournamentNotFoundException.
   *
   * @param ex the exception
   * @return response entity with 404 status
   */
  @ExceptionHandler(TournamentNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleTournamentNotFound(
      TournamentNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle TeamNotFoundException.
   *
   * @param ex the exception
   * @return response entity with 404 status
   */
  @ExceptionHandler(TeamNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleTeamNotFound(
      TeamNotFoundException ex
  ) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle MatchNotFoundException.
   *
   * @param ex the exception
   * @return response entity with 404 status
   */
  @ExceptionHandler(MatchNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleMatchNotFound(
      MatchNotFoundException ex
  ) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle DuplicateRegistrationException.
   *
   * @param ex the exception
   * @return response entity with 409 status
   */
  @ExceptionHandler(DuplicateRegistrationException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateRegistration(
      DuplicateRegistrationException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle RegistrationClosedException.
   *
   * @param ex the exception
   * @return response entity with 400 status
   */
  @ExceptionHandler(RegistrationClosedException.class)
  public ResponseEntity<Map<String, String>> handleRegistrationClosed(
      RegistrationClosedException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle InsufficientTeamMembersException.
   *
   * @param ex the exception
   * @return response entity with 400 status
   */
  @ExceptionHandler(InsufficientTeamMembersException.class)
  public ResponseEntity<Map<String, String>> handleInsufficientTeamMembers(
      InsufficientTeamMembersException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle InactiveTeamException.
   *
   * @param ex the exception
   * @return response entity with 400 status
   */
  @ExceptionHandler(InactiveTeamException.class)
  public ResponseEntity<Map<String, String>> handleInactiveTeam(InactiveTeamException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle NotManagerException.
   *
   * @param ex the exception
   * @return response entity with 403 status
   */
  @ExceptionHandler(NotManagerException.class)
  public ResponseEntity<Map<String, String>> handleNotManager(NotManagerException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
  }

  /**
   * Handle TeamNotInMatchException.
   *
   * @param ex the exception
   * @return response entity with 400 status
   */
  @ExceptionHandler(TeamNotInMatchException.class)
  public ResponseEntity<Map<String, String>> handleTeamNotInMatch(
      TeamNotInMatchException ex
  ) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("message", ex.getMessage()));
  }

  @ExceptionHandler(MatchNotPlayedException.class)
  public ResponseEntity<Map<String, String>> handleMatchNotPlayed(
      MatchNotPlayedException ex
  ) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("message", ex.getMessage()));
  }

}
