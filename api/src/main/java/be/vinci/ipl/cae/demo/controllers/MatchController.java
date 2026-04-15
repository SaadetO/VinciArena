package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewMatchLineupDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.MatchService;
import be.vinci.ipl.cae.demo.services.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/matches")
public class MatchController {

  private final MatchService matchService;
  private final MemberService memberService;

  public MatchController(MatchService matchService, MemberService memberService) {
    this.matchService = matchService;
    this.memberService = memberService;
  }

  /**
   * Replaces the old matchLineup with the new lineup
   *
   * @param id                id of the match
   * @param newMatchLineupDto new lineup
   * @param currentMember     current member
   */
  @ResponseStatus(HttpStatus.OK)
  @PatchMapping("/lineup/match/{id}")
  @PreAuthorize("isAuthenticated()")
  public void updateLineup(@PathVariable Long id,
      @Valid @RequestBody NewMatchLineupDto newMatchLineupDto,
      @AuthenticationPrincipal Member currentMember) {
    matchService.updateLineup(newMatchLineupDto, id, currentMember);
  }


}