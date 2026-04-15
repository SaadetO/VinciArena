package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.*;
import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * JoinRequest Service.
 */
@Service
public class JoinRequestService {

  private final JoinRequestRepository joinRequestRepository;
  private final TeamService teamService;
  private final NotificationService notificationService;
  private final MemberRepository memberRepository;

  /**
   * Constructor.
   *
   * @param joinRequestRepository the join-request repository
   * @param teamService the team service
   * @param notificationService the notification service
   * @param memberRepository the member repository
   */
  public JoinRequestService(JoinRequestRepository joinRequestRepository,
      TeamService teamService, NotificationService notificationService,
      MemberRepository memberRepository) {
    this.joinRequestRepository = joinRequestRepository;
    this.teamService = teamService;
    this.notificationService = notificationService;
    this.memberRepository = memberRepository;
  }

  /**
   * Creates a new join request.
   *
   * @param teamId the ID of the team to join
   * @param requester the member requesting to join
   * @return the created JoinRequestDto
   * @throws ResponseStatusException if team not found, user already in team or already has a
   *         pending request for that team
   */
  public JoinRequestDto createJoinRequest(Long teamId, Member requester) {
    Team requestedTeam = teamService.getExistingTeam(teamId);
    validateRequesterCanJoin(requester, requestedTeam);

    JoinRequest joinRequest = new JoinRequest();
    joinRequest.setMember(requester);
    joinRequest.setRequestedTeam(requestedTeam);
    joinRequest.setExpirationDate(LocalDateTime.now().plusDays(7));

    joinRequest = joinRequestRepository.save(joinRequest);

    notificationService.notifyTeamManagers(requestedTeam,
        requester.getTag() + " souhaite rejoindre " + requestedTeam.getName(),
        NotificationType.TEAM, teamId);

    return JoinRequestDto.builder().idJoinRequest(joinRequest.getIdJoinRequest())
        .idTeam(requestedTeam.getIdTeam()).teamName(requestedTeam.getName())
        .status(joinRequest.getStatus()).expirationDate(joinRequest.getExpirationDate()).build();
  }

  /**
   * Update the status of a join request.
   *
   * @param requestId the ID of the join request
   * @param newStatus the new status (ACCEPTED or REJECTED)
   * @param rejectionReason the reason for rejection (required if REJECTED)
   * @param manager the manager performing the action
   * @return the updated JoinRequestDto
   * @throws ResponseStatusException if the request doesn't exist, is not pending, or the user is
   *         not authorized
   */
  @Transactional
  public JoinRequestDto updateJoinRequestStatus(Long requestId, RequestStatus newStatus,
      String rejectionReason, Member manager) {

    JoinRequest joinRequest = getPendingJoinRequest(requestId);
    validateJoinRequestUpdate(newStatus, rejectionReason);

    Team team = joinRequest.getRequestedTeam();
    teamService.requireManager(team, manager);

    if (newStatus == RequestStatus.REJECTED) {
      joinRequest.setRejectionReason(rejectionReason);
    }
    joinRequest.setStatus(newStatus);
    joinRequestRepository.save(joinRequest);

    Member requester = joinRequest.getMember();
    String decision = determineDecisionMessage(newStatus, rejectionReason);

    notificationService.notifyMember(requester.getIdMember(),
        "Votre demande pour rejoindre " + team.getName() + " a été " + decision,
        NotificationType.TEAM, null);

    if (newStatus == RequestStatus.ACCEPTED) {
      requester.setTeam(team);
      memberRepository.save(requester);
      joinRequestRepository.deleteAllByMemberAndStatus(requester, RequestStatus.PENDING);
    }

    return JoinRequestDto.builder().idJoinRequest(joinRequest.getIdJoinRequest())
        .idTeam(team.getIdTeam()).teamName(team.getName()).status(joinRequest.getStatus())
        .expirationDate(joinRequest.getExpirationDate())
        .rejectionReason(joinRequest.getRejectionReason()).build();
  }

  private void validateRequesterCanJoin(Member requester, Team requestedTeam) {
    if (requester.getTeam() != null) {
      throw new UserAlreadyInTeamException("Vous appartenez déjà à une équipe");
    }
    if (joinRequestRepository.existsByMemberAndRequestedTeamAndStatus(requester, requestedTeam,
        RequestStatus.PENDING)) {
      throw new JoinRequestAlreadyExistsException(
          "Vous avez déjà une demande en attente pour cette équipe");
    }
  }

  private JoinRequest getPendingJoinRequest(Long requestId) {
    JoinRequest joinRequest = joinRequestRepository.findById(requestId)
        .orElseThrow(() -> new JoinRequestNotFoundException("Demande d'adhésion non trouvée"));
    
    if (joinRequest.getStatus() != RequestStatus.PENDING) {
      throw new InvalidJoinRequestException("Cette demande n'est plus en attente");
    }
    return joinRequest;
  }

  private void validateJoinRequestUpdate(RequestStatus newStatus, String rejectionReason) {
    if (newStatus == null) {
      throw new InvalidJoinRequestException("Le statut est obligatoire");
    }
    if (newStatus == RequestStatus.REJECTED && (rejectionReason == null || rejectionReason.isBlank())) {
      throw new InvalidJoinRequestException("Une raison est obligatoire pour refuser une demande");
    }
  }

  private String determineDecisionMessage(RequestStatus newStatus, String rejectionReason) {
    if (newStatus == RequestStatus.ACCEPTED) {
      return "acceptée";
    }
    return "rejetée.\n" + rejectionReason;
  }
}
