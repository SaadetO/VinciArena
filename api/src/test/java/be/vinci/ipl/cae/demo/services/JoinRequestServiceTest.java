package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class JoinRequestServiceTest {

  @Mock
  private JoinRequestRepository joinRequestRepository;

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private NotificationService notificationService;

  @Mock
  private MemberRepository memberRepository;

  @InjectMocks
  private JoinRequestService joinRequestService;

  private Member requester;
  private Team team;

  @BeforeEach
  void setUp() {
    requester = new Member();
    requester.setIdMember(1L);
    requester.setTag("PlayerOne");
    requester.setTeam(null);

    team = new Team();
    team.setIdTeam(2L);
    team.setName("Team Name");
  }

  @Test
  void createJoinRequest_Valid() {
    when(teamRepository.findById(2L)).thenReturn(Optional.of(team));
    when(joinRequestRepository.existsByMemberAndRequestedTeamAndStatus(requester, team,
        RequestStatus.PENDING))
        .thenReturn(false);
    when(joinRequestRepository.save(any(JoinRequest.class))).thenAnswer(call -> {
      JoinRequest saved = call.getArgument(0);
      saved.setIdJoinRequest(10L);
      return saved;
    });

    JoinRequestDto result = joinRequestService.createJoinRequest(2L, requester);

    assertNotNull(result);
    assertEquals(10L, result.getIdJoinRequest());
    assertEquals(2L, result.getIdTeam());
    assertEquals("Team Name", result.getTeamName());
    verify(joinRequestRepository).save(any(JoinRequest.class));
    verify(notificationService).notifyTeamManagers(any(Team.class), anyString());
  }

  @Test
  void createJoinRequest_TeamNotFound() {
    when(teamRepository.findById(2L)).thenReturn(Optional.empty());

    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
        () -> joinRequestService.createJoinRequest(2L, requester));

    assertEquals("L'équipe demandée n'existe pas", exception.getMessage());
    verify(joinRequestRepository, never()).save(any(JoinRequest.class));
  }

  @Test
  void createJoinRequest_AlreadyInTeam() {
    Team anotherTeam = new Team();
    anotherTeam.setIdTeam(3L);
    requester.setTeam(anotherTeam);

    when(teamRepository.findById(2L)).thenReturn(Optional.of(team));

    IllegalStateException exception = assertThrows(IllegalStateException.class,
        () -> joinRequestService.createJoinRequest(2L, requester));

    assertEquals("Vous appartenez déjà à une équipe", exception.getMessage());
    verify(joinRequestRepository, never()).save(any(JoinRequest.class));
  }

  @Test
  void createJoinRequest_PendingRequestExists() {
    when(teamRepository.findById(2L)).thenReturn(Optional.of(team));
    when(joinRequestRepository.existsByMemberAndRequestedTeamAndStatus(requester, team,
        RequestStatus.PENDING))
        .thenReturn(true);

    IllegalStateException exception = assertThrows(IllegalStateException.class,
        () -> joinRequestService.createJoinRequest(2L, requester));

    assertEquals("Vous avez déjà une demande en attente pour cette équipe", exception.getMessage());
    verify(joinRequestRepository, never()).save(any(JoinRequest.class));
  }

  @Test
  void updateJoinRequestStatus_Accepted() {
    // Arrange
    Team teamA = new Team();
    teamA.setIdTeam(1L);
    teamA.setName("Team A");
    Member manager = new Member();
    manager.setIdMember(10L);
    teamA.setManager1(manager);

    JoinRequest jr = new JoinRequest();
    jr.setIdJoinRequest(100L);
    jr.setMember(requester);
    jr.setRequestedTeam(teamA);
    jr.setStatus(RequestStatus.PENDING);

    when(joinRequestRepository.findById(100L)).thenReturn(Optional.of(jr));

    // Act
    JoinRequestDto result = joinRequestService.updateJoinRequestStatus(100L, RequestStatus.ACCEPTED, manager);

    // Assert
    assertNotNull(result);
    assertEquals(RequestStatus.ACCEPTED, result.getStatus());
    assertEquals(teamA, requester.getTeam());
    verify(joinRequestRepository).save(jr);
    verify(memberRepository).save(requester);
    verify(notificationService).notifyMember(eq(requester.getIdMember()), anyString());
    verify(joinRequestRepository).deleteAllByMemberAndStatus(requester, RequestStatus.PENDING);
  }

  @Test
  void updateJoinRequestStatus_Rejected() {
    // Arrange
    Team teamA = new Team();
    teamA.setIdTeam(1L);
    teamA.setName("Team A");
    Member manager = new Member();
    manager.setIdMember(10L);
    teamA.setManager1(manager);

    JoinRequest jr = new JoinRequest();
    jr.setIdJoinRequest(100L);
    jr.setMember(requester);
    jr.setRequestedTeam(teamA);
    jr.setStatus(RequestStatus.PENDING);

    when(joinRequestRepository.findById(100L)).thenReturn(Optional.of(jr));

    // Act
    JoinRequestDto result = joinRequestService.updateJoinRequestStatus(100L, RequestStatus.REJECTED, manager);

    // Assert
    assertNotNull(result);
    assertEquals(RequestStatus.REJECTED, result.getStatus());
    verify(joinRequestRepository).save(jr);
    verify(notificationService).notifyMember(eq(requester.getIdMember()), anyString());
    verify(memberRepository, never()).save(any(Member.class));
    verify(joinRequestRepository, never()).deleteAllByMemberAndStatus(any(), any());
  }

  @Test
  void updateJoinRequestStatus_NotManager() {
    // Arrange
    Team teamA = new Team();
    teamA.setIdTeam(1L);
    Member manager = new Member();
    manager.setIdMember(10L);
    teamA.setManager1(manager);

    JoinRequest jr = new JoinRequest();
    jr.setStatus(RequestStatus.PENDING);
    jr.setRequestedTeam(teamA);

    Member intruder = new Member();
    intruder.setIdMember(99L);

    when(joinRequestRepository.findById(100L)).thenReturn(Optional.of(jr));

    // Act & Assert
    assertThrows(IllegalStateException.class, 
        () -> joinRequestService.updateJoinRequestStatus(100L, RequestStatus.ACCEPTED, intruder));
  }
}
