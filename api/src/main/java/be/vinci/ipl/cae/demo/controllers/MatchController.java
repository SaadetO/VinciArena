package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.MemberSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.MatchService;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Match Controller.
 */
@RestController
@RequestMapping("/matches")
public class MatchController {

  private final MatchService matchService;

  /**
   * Match controller constructor. initializes match service
   *
   * @param matchService matchservice
   */
  public MatchController(MatchService matchService) {
    this.matchService = matchService;
  }

  /**
   * Fetches available members for a match.(manager use only
   *
   * @param matchId       match id
   * @param currentMember the manager sending the request
   * @return set of members
   */
  @GetMapping("/{matchId}/available-members")
  @PreAuthorize("isAuthenticated()") // Or your specific manager check
  public Set<MemberSummaryDto> getAvailableMembers(
      @PathVariable Long matchId,
      @AuthenticationPrincipal Member currentMember) {

    return matchService.getAvailableMembersForMatch(matchId, currentMember).stream()
        .map(MemberSummaryDto::fromEntity)
        .collect(Collectors.toSet());
  }


  /**
   * Confirms the result of a match.
   *
   * @param id    the id of the match
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
   * @param id    the id of the match
   * @param email the authenticated user's email
   */
  @PatchMapping("/{id}/contest")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void contestMatchResult(@PathVariable Long id, @AuthenticationPrincipal String email) {
    matchService.contestResult(id, email);
  }
}
