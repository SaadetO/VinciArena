package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * JoinRequest Service.
 */
@Service
public class JoinRequestService {

  private final JoinRequestRepository joinRequestRepository;
  private final TeamRepository teamRepository;
  private final NotificationService notificationService;
  private final MemberRepository memberRepository;

  /**
   * Constructor.
   *
   * @param joinRequestRepository the join-request repository
   * @param teamRepository        the team repository
   * @param notificationService   the notification service
   * @param memberRepository      the member repository
   */
  public JoinRequestService(JoinRequestRepository joinRequestRepository,
      TeamRepository teamRepository, NotificationService notificationService,
      MemberRepository memberRepository) {
    this.joinRequestRepository = joinRequestRepository;
    this.teamRepository = teamRepository;
    this.notificationService = notificationService;
    this.memberRepository = memberRepository;
  }

  /**
   * Creates a new join request.
   *
   * @param teamId    the ID of the team to join
   * @param requester the member requesting to join
   * @return the created JoinRequestDto, or null if the request is invalid
   */
  public JoinRequestDto createJoinRequest(Long teamId, Member requester) {
    Team requestedTeam = teamRepository.findById(teamId).orElse(null);
    if (requestedTeam == null) {
      throw new IllegalArgumentException("L'équipe demandée n'existe pas");
    }

    if (requester.getTeam() != null) {
      throw new IllegalStateException("Vous appartenez déjà à une équipe");
    }

    if (joinRequestRepository.existsByMemberAndRequestedTeamAndStatus(requester, requestedTeam,
        RequestStatus.PENDING)) {
      throw new IllegalStateException("Vous avez déjà une demande en attente pour cette équipe");
    }

    JoinRequest joinRequest = new JoinRequest();
    joinRequest.setMember(requester);
    joinRequest.setRequestedTeam(requestedTeam);
    joinRequest.setExpirationDate(LocalDateTime.now().plusDays(7));

    joinRequest = joinRequestRepository.save(joinRequest);

    notificationService.notifyTeamManagers(requestedTeam,
        requester.getTag() + " souhaite rejoindre "
            + requestedTeam.getName(), NotificationType.TEAM, teamId);

    return JoinRequestDto.builder()
        .idJoinRequest(joinRequest.getIdJoinRequest())
        .idTeam(requestedTeam.getIdTeam())
        .teamName(requestedTeam.getName())
        .status(joinRequest.getStatus())
        .expirationDate(joinRequest.getExpirationDate())
        .build();
  }

  /**
   * Update the status of a join request.
   *
   * @param requestId the ID of the join request
   * @param newStatus the new status (ACCEPTED or REJECTED)
   * @param manager   the manager performing the action
   * @return the updated JoinRequestDto
   * @throws IllegalArgumentException if the request doesn't exist
   * @throws IllegalStateException    if the action is unauthorized or the request is not pending
   */
  @Transactional
  public JoinRequestDto updateJoinRequestStatus(Long requestId, RequestStatus newStatus,
      Member manager) {
    JoinRequest joinRequest = joinRequestRepository.findById(requestId).orElse(null);
    if (joinRequest == null) {
      throw new IllegalArgumentException("Demande d'adhésion non trouvée");
    }

    if (joinRequest.getStatus() != RequestStatus.PENDING) {
      throw new IllegalStateException("Cette demande n'est plus en attente");
    }

    Team team = joinRequest.getRequestedTeam();
    boolean isManager = (team.getManager1() != null && team.getManager1().getIdMember()
        .equals(manager.getIdMember()))
        || (team.getManager2() != null && team.getManager2().getIdMember()
        .equals(manager.getIdMember()));

    if (!isManager) {
      throw new IllegalStateException("Seul un responsable de l'équipe peut gérer les demandes");
    }

    joinRequest.setStatus(newStatus);
    joinRequestRepository.save(joinRequest);

    Member requester = joinRequest.getMember();
    String decision = newStatus == RequestStatus.ACCEPTED ? "acceptée" : "rejetée";
    notificationService.notifyMember(requester.getIdMember(),
        "Votre demande pour rejoindre " + team.getName() + " a été " + decision,
        NotificationType.TEAM, null);

    if (newStatus == RequestStatus.ACCEPTED) {
      requester.setTeam(team);
      memberRepository.save(requester);

      // Obsolete requests deletion: 
      // Delete all other pending requests for this member as they are now in a team
      joinRequestRepository.deleteAllByMemberAndStatus(requester, RequestStatus.PENDING);
    }

    return JoinRequestDto.builder()
        .idJoinRequest(joinRequest.getIdJoinRequest())
        .idTeam(team.getIdTeam())
        .teamName(team.getName())
        .status(joinRequest.getStatus())
        .expirationDate(joinRequest.getExpirationDate())
        .build();
  }
}
