package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.UserSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.TeamDetailsDto;

import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private JoinRequestRepository joinRequestRepository;

  @Mock
  private MemberService memberService;

  @InjectMocks
  private TeamService teamService;

  private Member creator;

  @BeforeEach
  void setUp() {
    // New Team-less member
    creator = new Member();
    creator.setIdMember(1L);
    creator.setEmail("player@example.com");
    creator.setTeam(null);
  }

  @Test
  void createTeamValid() {
    // Arrange
    when(teamRepository.existsByName("My Team")).thenReturn(false);
    when(teamRepository.save(any(Team.class))).thenAnswer(call -> {
      Team saved = call.getArgument(0);
      saved.setIdTeam(1L);
      return saved;
    });
    when(memberRepository.save(any(Member.class))).thenReturn(creator);

    // Act
    Team result = teamService.createTeam("My Team", creator);

    // Assert
    assertNotNull(result);
    assertEquals("My Team", result.getName());
    assertTrue(result.getIsActive());
    assertEquals(creator, result.getManager1());
    assertEquals(result, creator.getTeam());
    verify(teamRepository).save(any(Team.class));
    verify(memberRepository).save(creator);
  }

  @Test
  void createTeamDuplicateName() {
    // Arrange
    when(teamRepository.existsByName("Taken Name")).thenReturn(true);

    // Act + Assert
    assertThrows(ResponseStatusException.class,
        () -> teamService.createTeam("Taken Name", creator));
    verify(teamRepository, never()).save(any(Team.class));
    verify(memberRepository, never()).save(any(Member.class));
  }

  @Test
  void createTeamMemberAlreadyInTeam() {
    // Arrange
    Team existingTeam = new Team();
    existingTeam.setIdTeam(5L);
    creator.setTeam(existingTeam);

    when(teamRepository.existsByName("New Team")).thenReturn(false);

    // Act + Assert
    assertThrows(ResponseStatusException.class,
        () -> teamService.createTeam("New Team", creator));
    verify(memberRepository, never()).save(any(Member.class));
    verify(teamRepository, never()).save(any(Team.class));
  }

  @Test
  void getAllActiveTeams() {
    // Arrange
    Team team1 = new Team();
    team1.setName("Team 1");
    Team team2 = new Team();
    team2.setName("Team 2");
    Team teamInactive = new Team();
    teamInactive.setIsActive(false);

    when(teamRepository.findByIsActiveTrue()).thenReturn(List.of(team1, team2));

    // Act
    Iterable<Team> result = teamService.getAllActiveTeams();

    // Assert
    assertNotNull(result);
    assertEquals(List.of(team1, team2), result);
    verify(teamRepository).findByIsActiveTrue();
  }

  @Test
  void getTeamDetails_NotFound() {
    when(teamRepository.findById(1L)).thenReturn(Optional.empty());
    assertThrows(ResponseStatusException.class,
        () -> teamService.getTeamDetails(1L, null));
  }

  @Test
  void getTeamDetails_AsRegularMember() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    Member member1 = new Member();
    member1.setIdMember(10L);
    team.setMembers(List.of(member1));

    Member currentMember = new Member();
    currentMember.setIdMember(20L);
    currentMember.setEmail("user@test.com");

    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(memberService.getUserSummary(member1)).thenReturn(
        UserSummaryDto.builder().id(10L).build());

    // Act
    TeamDetailsDto result = teamService.getTeamDetails(1L, currentMember);

    // Assert
    assertNotNull(result);
    assertEquals("Team 1", result.getName());
    assertEquals(1, result.getMembers().size());
    assertNull(result.getJoinRequests()); // Regular members do not see join requests
  }

  @Test
  void getTeamDetails_AsManager() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    Member manager = new Member();
    manager.setIdMember(10L);
    manager.setEmail("manager@test.com");
    team.setManager1(manager);
    team.setMembers(List.of());

    JoinRequest jr = new JoinRequest();
    jr.setIdJoinRequest(100L);
    jr.setMember(new Member());
    jr.getMember().setIdMember(30L);
    jr.setRequestedTeam(team);
    jr.setStatus(RequestStatus.PENDING);

    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(memberService.getUserSummary(manager)).thenReturn(
        UserSummaryDto.builder().id(10L).build());
    when(memberService.getUserSummary(jr.getMember())).thenReturn(
        UserSummaryDto.builder().id(30L).build());
    when(joinRequestRepository.findAllByRequestedTeamAndStatus(team, RequestStatus.PENDING))
        .thenReturn(List.of(jr));

    // Act
    TeamDetailsDto result = teamService.getTeamDetails(1L, manager);

    // Assert
    assertNotNull(result);
    assertNotNull(result.getJoinRequests());
    assertEquals(1, result.getJoinRequests().size());
    assertEquals(100L, result.getJoinRequests().getFirst().getIdJoinRequest());
  }

  @Test
  void isManager1Manager1() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);

    team.setManager1(creator);
    creator.setTeam(team);

    team.setMembers(List.of(creator));

    // Act
    boolean result = teamService.isManager1(team, creator);

    // Assert
    assertTrue(result);
  }

  @Test
  void isManager1Manager2WithUnexistingManager2() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    team.setManager1(creator);

    creator.setTeam(team);

    team.setMembers(List.of(creator));

    // Act
    boolean result = teamService.isManager2(team, creator);

    // Assert
    assertFalse(result);
  }

  @Test
  void isManager1Manager2WithExistingManager2() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);

    team.setManager1(creator);
    creator.setTeam(team);

    Member manager2 = new Member();
    manager2.setIdMember(2L);
    manager2.setTeam(team);
    team.setManager2(manager2);

    team.setMembers(List.of(creator, manager2));

    // Act
    boolean result = teamService.isManager2(team, creator);

    // Assert
    assertFalse(result);
  }

  @Test
  void isManager2Manager2() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    team.setManager2(creator);

    Member manager1 = new Member();
    manager1.setIdMember(2L);
    manager1.setTeam(team);
    team.setManager1(manager1);

    team.setMembers(List.of(creator, manager1));

    creator.setTeam(team);

    // Act
    boolean result = teamService.isManager2(team, creator);

    // Assert
    assertTrue(result);
  }

  @Test
  void isManager2Manager1() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    team.setManager2(creator);

    Member manager1 = new Member();
    manager1.setIdMember(2L);
    manager1.setTeam(team);
    team.setManager1(manager1);

    team.setMembers(List.of(creator, manager1));

    creator.setTeam(team);

    // Act
    boolean result = teamService.isManager1(team, creator);

    // Assert
    assertFalse(result);
  }

  @Test
  void quitTeamWithMemberWithNoTeam() {
    // Arrange
    when(creator.getTeam()).thenReturn(null);

    // Act
    Team result = teamService.quitTeam(creator);

    // Assert
    assertNull(result);
  }

  @Test
  void quitTeamAsNonManager() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    creator.setTeam(team);
    team.setMembers(List.of(creator));

    when(teamRepository.save(any(Team.class))).thenReturn(team);

    // Act
    Team result = teamService.quitTeam(creator);

    // Assert
    assertAll(
        () -> assertNull(creator.getTeam()),
        () -> assertEquals(team, result)
    );
    assertNull(creator.getTeam());
  }

  @Test
  void quitTeamAsManager2() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    team.setManager2(creator);
    creator.setTeam(team);
    Member manager1 = new Member();
    manager1.setIdMember(2L);
    manager1.setTeam(team);
    team.setManager1(manager1);
    team.setMembers(List.of(creator, manager1));

    when(teamRepository.save(any(Team.class))).thenReturn(team);
    when(memberRepository.save(any(Member.class))).thenReturn(manager1);

    // Act
    Team result = teamService.quitTeam(creator);

    // Assert
    assertAll(
        () -> assertEquals(team, result),
        () -> assertNull(creator.getTeam()),
        () -> assertNull(team.getManager2())
    );

  }

  @Test
  void quitTeamAsManager1WithNoOtherMembers() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    team.setManager1(creator);
    creator.setTeam(team);
    team.setMembers(List.of(creator));

    when(teamRepository.save(any(Team.class))).thenReturn(team);

    // Act
    Team result = teamService.quitTeam(creator);

    // Assert
    assertAll(
        () -> assertEquals(team, result),
        () -> assertNull(team.getManager1()),
        () -> assertNull(creator.getTeam()),
        () -> assertFalse(team.getIsActive())
    );

  }

  @Test
  void quitTeamAsManager1WithOtherMembers () {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);

    team.setManager1(creator);
    creator.setTeam(team);

    Member m2 = new Member();
    m2.setIdMember(2L);
    m2.setTeam(team);

    Member m3 = new Member();
    m3.setIdMember(3L);
    m3.setTeam(team);

    team.setMembers(List.of(creator, m2, m3));

    // Act
    Team result = teamService.quitTeam(creator);

    // Assert
    assertNull(result);
  }

  @Test
  void quitTeamAsManager1WithExistingManager2 () {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    team.setManager1(creator);

    creator.setTeam(team);

    Member manager2 = new Member();
    manager2.setIdMember(2L);
    manager2.setTeam(team);
    team.setManager2(manager2);

    team.setMembers(List.of(creator, manager2));

    when(teamRepository.save(any(Team.class))).thenReturn(team);

    // Act
    Team result = teamService.quitTeam(creator);

    // Assert
    assertAll(
        () -> assertEquals(team, result),
        () -> assertNull(creator.getTeam()),
        () -> assertEquals(team.getManager1(), manager2),
        () -> assertNull(team.getManager2())
    );
  }
}
