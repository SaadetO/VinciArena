package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.MatchLineupDto;
import be.vinci.ipl.cae.demo.models.dtos.NewMatchLineupDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.MatchLineupService;
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
@RequestMapping("/lineups")
public class MatchLineupController {

  private final MatchLineupService matchLineupService;

  public MatchLineupController(MatchLineupService matchLineupService) {
    this.matchLineupService = matchLineupService;
  }

  /**
   * Updates the lineup for a specific match.
   */
  @ResponseStatus(HttpStatus.OK)
  @PatchMapping("/match/{id}")
  @PreAuthorize("isAuthenticated()")
  public MatchLineupDto updateLineup(
      @PathVariable Long id,
      @Valid @RequestBody NewMatchLineupDto newMatchLineupDto,
      @AuthenticationPrincipal Member currentMember) {
    return matchLineupService.updateLineup(newMatchLineupDto, id, currentMember);
  }

}
