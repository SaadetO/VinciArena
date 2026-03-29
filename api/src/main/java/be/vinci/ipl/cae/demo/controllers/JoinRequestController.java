package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.dtos.UpdateJoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
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

  /**
   * Update the status of a join request (accepted or rejected).
   * If rejected, a rejection reason must be provided.
   *
   * @param requestId     the ID of the join request
   * @param request       the request containing status and rejection reason
   * @param currentMember the authenticated manager performing the action
   * @return the updated join request as a DTO
   */
  @PatchMapping("/join-requests/{requestId}")
  @PreAuthorize("isAuthenticated()")
  public JoinRequestDto updateJoinRequestStatus(
      @PathVariable Long requestId,
      @RequestBody UpdateJoinRequestDto request,
      @AuthenticationPrincipal Member currentMember) {

    try {
      return joinRequestService.updateJoinRequestStatus(
          requestId,
          request.getStatus(),
          request.getRejectionReason(),
          currentMember);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
    }
  }
}