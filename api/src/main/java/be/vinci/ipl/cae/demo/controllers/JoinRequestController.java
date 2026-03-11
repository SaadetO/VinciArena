package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.JoinRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * JoinRequestController to handle join requests operations.
 */
@RestController
@RequestMapping("/teams")
public class JoinRequestController {

  private final JoinRequestService joinRequestService;

  /**
   * Constructor for JoinRequestController.
   *
   * @param joinRequestService the injected JoinRequestService.
   */
  public JoinRequestController(JoinRequestService joinRequestService) {
    this.joinRequestService = joinRequestService;
  }

  /**
   * Create a new join request for a specific team.
   *
   * @param teamId        the ID of the team to join
   * @param currentMember the authenticated member making the request
   * @return the created join request as a DTO
   */
  @PostMapping("/{teamId}/join-requests")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("isAuthenticated()")
  public JoinRequestDto createJoinRequest(@PathVariable Long teamId,
      @AuthenticationPrincipal Member currentMember) {

    try {
      return joinRequestService.createJoinRequest(teamId, currentMember);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }
}
