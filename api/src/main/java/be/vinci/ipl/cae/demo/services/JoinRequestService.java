package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

/**
 * JoinRequest Service.
 */
@Service
public class JoinRequestService {

  private final JoinRequestRepository joinRequestRepository;
  private final TeamRepository teamRepository;
  private final NotificationService notificationService;

  /**
   * Constructor.
   *
   * @param joinRequestRepository the join-request repository
   */
  public JoinRequestService(JoinRequestRepository joinRequestRepository,
      TeamRepository teamRepository, NotificationService notificationService) {
    this.joinRequestRepository = joinRequestRepository;
    this.teamRepository = teamRepository;
    this.notificationService = notificationService;
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
        "Demande d'adhésion: " + requester.getTag() + " souhaite rejoindre "
            + requestedTeam.getName());

    return JoinRequestDto.builder()
        .idJoinRequest(joinRequest.getIdJoinRequest())
        .idTeam(requestedTeam.getIdTeam())
        .teamName(requestedTeam.getName())
        .status(joinRequest.getStatus())
        .expirationDate(joinRequest.getExpirationDate())
        .build();
  }
}
