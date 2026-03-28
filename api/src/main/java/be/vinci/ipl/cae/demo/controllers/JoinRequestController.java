package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.services.JoinRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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

    return joinRequestService.createJoinRequest(teamId, currentMember);
  }

  /**
   * Update the status of a join request (accept or deny).
   *
   * @param requestId     the ID of the join request
   * @param status        the new status (ACCEPTED or REFUSED)
   * @param currentMember the authenticated manager performing the action
   * @return the updated join request as a DTO
   */
  @PatchMapping("/join-requests/{requestId}")
  @PreAuthorize("isAuthenticated()")
  public JoinRequestDto updateJoinRequestStatus(@PathVariable Long requestId,
      @RequestBody RequestStatus status,
      @AuthenticationPrincipal Member currentMember) {
    return joinRequestService.updateJoinRequestStatus(requestId, status, currentMember);
  }
}
