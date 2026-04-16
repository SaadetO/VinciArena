package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.MatchService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling match-related endpoints.
 */
@RestController
@RequestMapping("/matches")
public class MatchController {

  private final MatchService matchService;

  /**
   * Constructor for MatchController.
   *
   * @param matchService the injected MatchService
   */
  public MatchController(MatchService matchService) {
    this.matchService = matchService;
  }

  /**
   * Confirms the result of a match.
   *
   * @param id the id of the match
   * @param email the authenticated user's email
   */
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PatchMapping("/{id}/confirm")
  public void confirmMatchResult(@PathVariable Long id, @AuthenticationPrincipal String email) {
    matchService.confirmResult(id, email);
  }

  /**
   * Contests the result of a match.
   *
   * @param id the id of the match
   * @param email the authenticated user's email
   */
  @PatchMapping("/{id}/contest")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void contestMatchResult(@PathVariable Long id, @AuthenticationPrincipal String email) {
    matchService.contestResult(id, email);
  }
}
